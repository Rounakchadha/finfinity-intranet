<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Session;

class ConfigController extends Controller
{
    /**
     * Returns portal configuration for the frontend.
     * React reads this once on load — no hardcoded values in components.
     */
    public function index()
    {
        $user = Session::get('user');
        $userGroups = [];

        if ($user && !empty($user['authenticated'])) {
            foreach ($user['groups']['value'] ?? $user['groups'] ?? [] as $group) {
                if (isset($group['displayName'])) {
                    $userGroups[] = $group['displayName'];
                }
            }
        }

        $features = config('portal.features');
        $nav = $this->filterNavForUser(config('portal.navigation'), $userGroups, $features);

        return response()->json([
            'navigation'          => $nav,
            'fullscreen_paths'    => config('portal.fullscreen_paths'),
            'default_links'       => config('portal.default_links'),
            'right_panel_default' => config('portal.right_panel_default'),
            'right_panel'         => config('portal.right_panel'),
            'branding'            => config('portal.branding'),
            'features'            => $features,
            'admin_groups'        => config('portal.admin_groups'),
        ]);
    }

    // Map nav item keys to their feature flag
    private const FEATURE_GATE = [
        'announcements' => 'announcements',
        'memo-approval' => 'memo_approvals',
        'qr-codes'      => 'qr_codes',
        'documents'     => 'document_repo',
        'it-admin-tools'=> 'asset_management',
        'asset-request' => 'asset_management',
        'hr-admin-tools'=> 'hr_module',
        'calendar'      => 'shared_calendar',
    ];

    private function filterNavForUser(array $items, array $userGroups, array $features): array
    {
        return array_values(array_filter($items, function ($item) use ($userGroups, $features) {
            // Check feature flag first
            $featureKey = self::FEATURE_GATE[$item['key']] ?? null;
            if ($featureKey && !($features[$featureKey] ?? true)) {
                return false;
            }
            // Then check role requirement
            if (empty($item['roles'])) {
                return true;
            }
            return count(array_intersect($item['roles'], $userGroups)) > 0;
        }));
    }
}
