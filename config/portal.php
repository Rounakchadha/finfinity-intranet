<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Navigation
    |--------------------------------------------------------------------------
    | All sidebar navigation items. React reads this from /api/config — nothing
    | is hardcoded in the frontend. Add, remove, or reorder items here.
    |
    | 'roles' — if set, only users in any of these Microsoft Group names can see
    |           this item. Empty array means visible to all authenticated users.
    */
    'navigation' => [
        ['key' => 'dashboard',      'label' => 'Dashboard',       'path' => '/',                'icon' => 'home',     'roles' => []],
        ['key' => 'calendar',       'label' => 'Calendar',        'path' => '/calendar',        'icon' => 'calendar', 'roles' => []],
        ['key' => 'documents',      'label' => 'Documents',       'path' => '/documents',       'icon' => 'document', 'roles' => []],
        ['key' => 'employees',      'label' => 'Directory',       'path' => '/employees',       'icon' => 'users',    'roles' => []],
        ['key' => 'announcements',  'label' => 'Announcements',   'path' => '/announcements',   'icon' => 'bell',     'roles' => []],
        ['key' => 'memo-approval',  'label' => 'Memo Approval',   'path' => '/memo-approval',   'icon' => 'memo',     'roles' => []],
        ['key' => 'qr-codes',       'label' => 'QR Codes',         'path' => '/qr-codes',        'icon' => 'qr',       'roles' => []],
        ['key' => 'asset-request',  'label' => 'IT Support',       'path' => '/asset-request',   'icon' => 'settings', 'roles' => []],
        ['key' => 'it-admin-tools',      'label' => 'IT Admin',        'path' => '/it-admin-tools',      'icon' => 'settings', 'roles' => ['IT Manager', 'IT Admin', 'Admin', 'Global Administrator', 'Company Administrator']],
        ['key' => 'hr-admin-tools',      'label' => 'HR Admin',        'path' => '/hr-admin-tools',      'icon' => 'hr',       'roles' => ['HR', 'HR Manager', 'Admin', 'Global Administrator', 'Company Administrator']],
        ['key' => 'compliance',          'label' => 'Compliance',      'path' => '/compliance',          'icon' => 'shield',   'roles' => ['Admin', 'HR', 'HR Manager', 'Global Administrator', 'Company Administrator']],
    ],

    /*
    |--------------------------------------------------------------------------
    | Full-screen pages (no sidebar/right panel)
    |--------------------------------------------------------------------------
    */
    'fullscreen_paths' => [],

    /*
    |--------------------------------------------------------------------------
    | Default application links (shown on dashboard when DB has no overrides)
    |--------------------------------------------------------------------------
    */
    'default_links' => [
        [
            'name'             => 'Keka',
            'url'              => env('KEKA_URL', 'https://finfinity.keka.com'),
            'logo'             => '/assets/keka.png',
            'background_color' => '#115948',
            'sort_order'       => 1,
        ],
        [
            'name'             => 'Zoho',
            'url'              => env('ZOHO_URL', 'https://zoho.com'),
            'logo'             => '/assets/zoho.png',
            'background_color' => '#115948',
            'sort_order'       => 2,
        ],
        [
            'name'             => 'Microsoft Teams',
            'url'              => 'https://teams.microsoft.com',
            'logo'             => '/assets/microsoft-logo.png',
            'background_color' => '#115948',
            'sort_order'       => 3,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Right panel — all configurable labels and links
    |--------------------------------------------------------------------------
    | right_panel_default: the link button shown (replaced per-group via GroupPersonalizedLink)
    | document_directory: the "Document Directory" shortcut
    | support_url: the "Support" button destination
    | shared_calendar_title: heading shown above the shared calendar widget
    */
    'right_panel_default' => [
        'name' => env('RIGHT_PANEL_LINK_NAME', 'Outlook'),
        'url'  => env('RIGHT_PANEL_LINK_URL', 'https://outlook.office.com'),
    ],

    'right_panel' => [
        'document_directory_label' => 'Document Directory',
        'support_label'            => 'Support',
        'support_url'              => env('SUPPORT_URL', 'https://teams.microsoft.com'),
        'shared_calendar_title'    => env('SHARED_CALENDAR_TITLE', 'Company Announcements'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Branding
    |--------------------------------------------------------------------------
    */
    'branding' => [
        'primary_color'   => '#115948',
        'secondary_color' => '#177761',
        'logo'            => '/assets/fin-logo.png',
        'company_name'    => env('APP_NAME', 'FinFinity Portal'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Groups that can publish announcements and access admin functions
    |--------------------------------------------------------------------------
    */
    'admin_groups' => ['Admin', 'HR', 'HR Manager', 'Global Administrator', 'Company Administrator'],

    /*
    |--------------------------------------------------------------------------
    | Superadmin emails — bypass ALL role checks, always have full admin access
    |--------------------------------------------------------------------------
    */
    'superadmin_emails' => array_filter(explode(',', env('SUPERADMIN_EMAILS', ''))),
    'hr_emails'         => array_filter(explode(',', env('HR_EMAILS', ''))),

    /*
    |--------------------------------------------------------------------------
    | Notification recipients
    |--------------------------------------------------------------------------
    */
    'it_admin_email'         => env('IT_ADMIN_EMAIL', 'it@finfinity.co.in'),
    'employee_email_domain'  => env('EMPLOYEE_EMAIL_DOMAIN', 'finfinity.co.in'),

    /*
    |--------------------------------------------------------------------------
    | Features (toggle modules on/off without code changes)
    |--------------------------------------------------------------------------
    */
    'features' => [
        'shared_calendar'  => true,
        'document_repo'    => true,
        'memo_approvals'   => true,
        'asset_management' => true,
        'hr_module'        => true,
        'announcements'    => true,
        'qr_codes'         => true,
        'helpdesk'         => false, // Phase 2
    ],

];
