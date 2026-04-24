<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use TheNetworg\OAuth2\Client\Provider\Azure;
use TheNetworg\OAuth2\Client\Token\AccessToken;
use GuzzleHttp\Client;

class AuthController extends Controller
{
    private function getProvider()
    {
        $httpClient = new Client(['verify' => true, 'timeout' => 15]);

        return new Azure(
            [
                'clientId'     => config('services.azure.client_id'),
                'clientSecret' => config('services.azure.client_secret'),
                'redirectUri'  => config('services.azure.redirect_uri'),
                'tenant'       => config('services.azure.tenant_id'),
                'resource'     => 'https://graph.microsoft.com/',
                'defaultEndPointVersion' => Azure::ENDPOINT_VERSION_2_0,
            ],
            ['httpClient' => $httpClient]
        );
    }

    /**
     * Return a valid access token string, refreshing it if expired.
     * Returns null if unauthenticated or refresh fails.
     */
    public static function getValidToken(): ?string
    {
        $tokenData = Session::get('token');
        if (!$tokenData || !isset($tokenData['access_token'])) {
            return null;
        }

        // Check expiry — Azure tokens include 'expires' (unix timestamp)
        $expires = $tokenData['expires'] ?? ($tokenData['expires_in'] ?? null);
        $isExpired = $expires && (int) $expires < time();

        if (!$isExpired) {
            return $tokenData['access_token'];
        }

        // Try to refresh
        $refreshToken = $tokenData['refresh_token'] ?? null;
        if (!$refreshToken) {
            Log::warning('AuthController: Token expired and no refresh_token in session');
            return null;
        }

        try {
            Log::info('AuthController: Access token expired — refreshing via refresh_token');
            $provider = (new self)->getProvider();
            $newToken = $provider->getAccessToken('refresh_token', [
                'refresh_token' => $refreshToken,
            ]);
            Session::put('token', $newToken->jsonSerialize());
            Log::info('AuthController: Token refreshed successfully');
            return $newToken->getToken();
        } catch (\Exception $e) {
            Log::error('AuthController: Token refresh failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function login(Request $request)
    {
        $provider = $this->getProvider();

        $options = [
            'scope' => [
                'openid', 'profile', 'email', 'offline_access',
                'User.Read', 'User.Read.All', 'Calendars.Read', 'Calendars.Read.Shared',
                'Group.Read.All', 'GroupMember.Read.All', 'Mail.Send',
                'Directory.Read.All', // Required to include Azure AD directory roles (e.g. Global Administrator) in transitiveMemberOf
            ],
        ];

        // ?switch=1 — force the Microsoft account picker so the user can choose a different account
        if ($request->query('switch')) {
            $options['prompt'] = 'select_account';
        }

        $authUrl = $provider->getAuthorizationUrl($options);
        Session::put('oauth2state', $provider->getState());
        return redirect()->away($authUrl);
    }

    public function callback(Request $request)
    {
        $provider = $this->getProvider();
        try {
            $token = $provider->getAccessToken('authorization_code', [
                'code' => $request->query('code')
            ]);
            Session::put('token', $token->jsonSerialize());

            // Fetch user profile, calendar, and ALL memberships (groups + directory roles)
            $graph    = $provider->get('https://graph.microsoft.com/v1.0/me', $token);
            $calendar = $provider->get('https://graph.microsoft.com/v1.0/me/calendar/events', $token);
            // transitiveMemberOf returns security groups AND Azure AD directory roles (e.g. Global Administrator)
            // memberOf only returns groups — it misses directory role assignments
            $groups   = $provider->get('https://graph.microsoft.com/v1.0/me/transitiveMemberOf', $token);

            // Extract roles — works for both #microsoft.graph.group and #microsoft.graph.directoryRole
            $roles = [];
            $groupList = isset($groups['value']) ? $groups['value']
                : (isset($groups[0]) && is_array($groups[0]) ? $groups : []);

            Log::info('AuthController: transitiveMemberOf raw count', [
                'count' => count($groupList),
                'types' => array_unique(array_column($groupList, '@odata.type')),
            ]);

            foreach ($groupList as $group) {
                if (!empty($group['displayName'])) {
                    $roles[] = $group['displayName'];
                }
            }

            // Email-based role injection — bypasses Azure group/role requirements
            $email = strtolower($graph['userPrincipalName'] ?? $graph['mail'] ?? '');

            $superadmins = array_map('strtolower', config('portal.superadmin_emails', []));
            if (in_array($email, $superadmins, true)) {
                foreach (['Admin', 'HR Manager', 'IT Manager'] as $r) {
                    if (!in_array($r, $roles)) $roles[] = $r;
                }
            }

            $hrEmails = array_map('strtolower', config('portal.hr_emails', []));
            if (in_array($email, $hrEmails, true)) {
                foreach (['HR Manager', 'HR'] as $r) {
                    if (!in_array($r, $roles)) $roles[] = $r;
                }
            }

            // Log so we can see what Azure actually returned (helps debug admin access issues)
            Log::info('AuthController: Azure login successful', [
                'user'  => $graph['userPrincipalName'] ?? $graph['mail'] ?? 'unknown',
                'roles' => $roles,
                'admin_groups_config' => config('portal.admin_groups', []),
            ]);

            Session::put('user', [
                'authenticated' => true,
                'profile' => $graph,
                'calendar' => $calendar,
                'groups' => $groups,
                'roles' => $roles
            ]);

            return redirect(config('app.url') . '/app');
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public function status(Request $request)
    {
        $user = Session::get('user');
        $isAuthenticated = !empty($user);

        if (!$isAuthenticated) {
            return response()->json(['isAuthenticated' => false, 'user' => null]);
        }

        // Strip calendar events — large, not needed by the SPA
        $slim = $user;
        unset($slim['calendar']);

        // Fill in missing department/officeLocation from local employees table
        $email = $slim['profile']['userPrincipalName'] ?? $slim['profile']['mail'] ?? null;
        if ($email && (empty($slim['profile']['department']) || empty($slim['profile']['officeLocation']))) {
            $local = \DB::table('employees')->where('employee_email', $email)->first();
            if ($local) {
                if (empty($slim['profile']['department']) && !empty($local->department)) {
                    $slim['profile']['department'] = $local->department;
                }
                if (empty($slim['profile']['officeLocation']) && !empty($local->office_location ?? null)) {
                    $slim['profile']['officeLocation'] = $local->office_location;
                }
                if (empty($slim['profile']['jobTitle']) && !empty($local->job_title)) {
                    $slim['profile']['jobTitle'] = $local->job_title;
                }
            }
        }

        return response()->json([
            'isAuthenticated' => true,
            'user' => $slim,
        ]);
    }

    public function logout(Request $request)
    {
        Session::flush();
        return response()->json(['success' => true]);
    }

    /**
     * Return personal calendar events from session (fast — no API call).
     * The events are stored in session at login time.
     */
    public function personalCalendar(Request $request)
    {
        $user = Session::get('user');
        if (!$user || empty($user['authenticated'])) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $raw = $user['calendar']['value'] ?? $user['calendar'] ?? [];
        $events = is_array($raw) ? array_values($raw) : [];

        return response()->json(['events' => $events]);
    }

    public function refreshCalendar(Request $request)
    {
        $user = Session::get('user');
        if (empty($user) || empty($user['authenticated'])) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $accessToken = self::getValidToken();
        if (!$accessToken) {
            return response()->json(['error' => 'Your session has expired. Please log out and log back in to sync your calendar.'], 401);
        }

        try {
            $client = new \GuzzleHttp\Client(['timeout' => 15]);
            $res = $client->get('https://graph.microsoft.com/v1.0/me/calendarView', [
                'headers' => ['Authorization' => 'Bearer ' . $accessToken],
                'query'   => [
                    'startDateTime' => now()->subDays(7)->toIso8601String(),
                    'endDateTime'   => now()->addDays(60)->toIso8601String(),
                    '$select'       => 'id,subject,start,end,location,bodyPreview,isAllDay',
                    '$orderby'      => 'start/dateTime',
                    '$top'          => 100,
                ],
            ]);
            $data   = json_decode($res->getBody(), true);
            $events = $data['value'] ?? [];
            $user['calendar'] = ['value' => $events];
            Session::put('user', $user);
            return response()->json(['events' => $events]);
        } catch (\Exception $e) {
            Log::error('refreshCalendar failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Could not fetch calendar from Outlook. Try logging out and back in.'], 500);
        }
    }
}
