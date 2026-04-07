<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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

    public function login(Request $request)
    {
        $provider = $this->getProvider();
        $authUrl = $provider->getAuthorizationUrl([
            'scope' => [
                'openid', 'profile', 'email',
                'User.Read', 'User.Read.All', 'Calendars.Read', 'Calendars.Read.Shared', 'Group.Read.All', 'GroupMember.Read.All', 'Mail.Send'
            ]
        ]);
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

            // Fetch user profile, calendar, groups
            $graph = $provider->get('https://graph.microsoft.com/v1.0/me', $token);
            $calendar = $provider->get('https://graph.microsoft.com/v1.0/me/calendar/events', $token);
            $groups = $provider->get('https://graph.microsoft.com/v1.0/me/memberOf', $token);

            // Extract roles
            $roles = [];
            if (isset($groups[0]) && is_array($groups[0])) {
                foreach ($groups as $group) {
                    if (isset($group['displayName'])) {
                        $roles[] = $group['displayName'];
                    }
                }
            } elseif (isset($groups['value'])) {
                foreach ($groups['value'] as $group) {
                    if (isset($group['displayName'])) {
                        $roles[] = $group['displayName'];
                    }
                }
            }

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
        return response()->json([
            'isAuthenticated' => $isAuthenticated,
            'user' => $isAuthenticated ? $user : null
        ]);
    }

    public function logout(Request $request)
    {
        Session::flush();
        return response()->json(['success' => true]);
    }

    public function refreshCalendar(Request $request)
    {
        $provider = $this->getProvider();
        $user = Session::get('user');
        $tokenArr = Session::get('token');

        if (empty($user) || empty($user['profile']['id']) || empty($tokenArr)) {
            return response()->json(['error' => 'User not authenticated.'], 401);
        }

        $token = new AccessToken($tokenArr, $provider);

        try {
            $calendar = $provider->get('https://graph.microsoft.com/v1.0/me/calendar/events', $token);
            $user['calendar'] = $calendar;
            Session::put('user', $user);
            return response()->json(['calendar' => $calendar]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
