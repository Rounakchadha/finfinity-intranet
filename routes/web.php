<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GroupMemberController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\MemoController;
use App\Http\Controllers\LinkController;
use App\Http\Controllers\SharedCalendarController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AccessControlController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\HRAdminController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\QrCodeController;
use App\Http\Controllers\AssetRequestController;

// Auth (outside /api prefix — these are redirects, not JSON endpoints)
Route::get('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/callback', [AuthController::class, 'callback']);
Route::get('/auth/azure/callback', [AuthController::class, 'callback']);

// Local developer bypass (accessible directly from browser)
Route::get('/auth/local-login', function () {
    Session::put('user', [
        'authenticated' => true,
        'profile' => [
            'displayName' => 'Local Admin',
            'userPrincipalName' => 'admin@finfinity.co.in',
            'mail' => 'admin@finfinity.co.in',
            'id' => 'local-admin-12345'
        ],
        'groups' => [
            ['displayName' => 'FinFinity IT'],
            ['displayName' => 'HR Team'],
            ['displayName' => 'Management']
        ],
        'roles' => ['FinFinity IT', 'HR Team', 'Management']
    ]);
    return redirect('/app');
});

Route::prefix('api')->group(function () {

    // -------------------------------------------------------------------------
    // Portal config (navigation, branding, features, default links)
    // -------------------------------------------------------------------------
    Route::get('/config', [ConfigController::class, 'index']);

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------
    Route::get('/auth/status', [AuthController::class, 'status']);
    Route::get('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/calendar/refresh', [AuthController::class, 'refreshCalendar']);

    // -------------------------------------------------------------------------
    // Core Portal
    // -------------------------------------------------------------------------
    Route::get('/group-members', [GroupMemberController::class, 'index']);
    Route::get('/groups', [GroupMemberController::class, 'getAzureGroups']);
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::get('/shared-calendar', [SharedCalendarController::class, 'index']);

    // Links
    Route::get('/links', [LinkController::class, 'index']);
    Route::get('/links/access-info', [LinkController::class, 'getAccessInfo']);
    Route::get('/links/rightpanel', [LinkController::class, 'getRightPanelLink']);

    // -------------------------------------------------------------------------
    // Announcements & News Feed
    // -------------------------------------------------------------------------
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
    Route::post('/announcements/{id}/acknowledge', [AnnouncementController::class, 'acknowledge']);

    // -------------------------------------------------------------------------
    // QR Code Manager
    // -------------------------------------------------------------------------
    Route::get('/qr-codes', [QrCodeController::class, 'index']);
    Route::post('/qr-codes', [QrCodeController::class, 'store']);
    Route::put('/qr-codes/{id}', [QrCodeController::class, 'update']);
    Route::delete('/qr-codes/{id}', [QrCodeController::class, 'destroy']);

    // -------------------------------------------------------------------------
    // Memo & Approvals
    // -------------------------------------------------------------------------
    Route::post('/memos', [MemoController::class, 'store']);
    Route::get('/my-approvals', [ApprovalController::class, 'myApprovals']);
    Route::post('/approvals/{id}/approve', [ApprovalController::class, 'approve']);
    Route::post('/approvals/{id}/decline', [ApprovalController::class, 'decline']);

    // -------------------------------------------------------------------------
    // Admin — Access Control & Groups
    // -------------------------------------------------------------------------
    Route::prefix('admin')->group(function () {
        Route::get('/groups/stats', [GroupMemberController::class, 'getStats']);
        Route::get('/access-control', [AccessControlController::class, 'index']);
        Route::post('/access-control', [AccessControlController::class, 'store']);
        Route::put('/access-control/{id}', [AccessControlController::class, 'update']);
        Route::delete('/access-control/{id}', [AccessControlController::class, 'destroy']);
        Route::get('/access-control/stats', [AccessControlController::class, 'getStats']);
    });

    // -------------------------------------------------------------------------
    // Asset Management
    // -------------------------------------------------------------------------
    Route::prefix('assets')->group(function () {
        Route::get('/', [AssetController::class, 'index']);
        Route::post('/', [AssetController::class, 'store']);
        Route::get('/types', [AssetController::class, 'getAssetTypes']);
        Route::get('/locations', [AssetController::class, 'getLocations']);
        Route::post('/allocate', [AssetController::class, 'allocate']);
        Route::post('/deallocate', [AssetController::class, 'deallocate']);
        Route::post('/reallocate', [AssetController::class, 'reallocate']);
        Route::post('/decommission', [AssetController::class, 'decommission']);
        Route::get('/audit-logs', [AssetController::class, 'auditLogs']);
    });

    // -------------------------------------------------------------------------
    // HR Management
    // -------------------------------------------------------------------------
    Route::prefix('hr')->group(function () {
        // Write operations
        Route::post('/jobs', [HRAdminController::class, 'createJob']);
        Route::post('/candidates', [HRAdminController::class, 'addCandidate']);
        Route::post('/assign-to-job', [HRAdminController::class, 'assignToJob']);
        Route::post('/approve-candidate', [HRAdminController::class, 'approveCandidate']);
        Route::post('/schedule-interview', [HRAdminController::class, 'scheduleInterview']);
        Route::post('/send-offer', [HRAdminController::class, 'sendOffer']);
        Route::post('/start-onboarding', [HRAdminController::class, 'startOnboarding']);
        Route::post('/mark-resignation', [HRAdminController::class, 'markResignation']);

        // Read operations
        Route::get('/jobs', [HRAdminController::class, 'getJobs']);
        Route::get('/candidates', [HRAdminController::class, 'getCandidates']);
        Route::get('/candidate-sources', [HRAdminController::class, 'getCandidateSources']);
        Route::get('/candidate-skills', [HRAdminController::class, 'getCandidateSkills']);
        Route::get('/available-candidates', [HRAdminController::class, 'getAvailableCandidates']);
        Route::get('/candidates-for-approval', [HRAdminController::class, 'getCandidatesForApproval']);
        Route::get('/verified-candidates', [HRAdminController::class, 'getVerifiedCandidates']);
        Route::get('/active-employees', [HRAdminController::class, 'getActiveEmployees']);

        // Background Checks
        Route::post('/background-checks', [HRAdminController::class, 'initiateBackgroundCheck']);
        Route::get('/background-checks', [HRAdminController::class, 'listBackgroundChecks']);
        Route::put('/background-checks/{id}', [HRAdminController::class, 'updateBackgroundCheck']);
    });

    // -------------------------------------------------------------------------
    // Asset Requests (employee-side)
    // -------------------------------------------------------------------------
    Route::prefix('asset-requests')->group(function () {
        Route::get('/', [AssetRequestController::class, 'index']);
        Route::post('/', [AssetRequestController::class, 'store']);
        Route::put('/{id}/review', [AssetRequestController::class, 'review']);
    });

    // -------------------------------------------------------------------------
    // Debug (local environment only — never exposed in production)
    // -------------------------------------------------------------------------
    if (app()->environment('local')) {
        Route::prefix('debug')->group(function () {
            Route::get('/auth', function () {
                return response()->json([
                    'authenticated' => auth()->check(),
                    'session_id' => session()->getId(),
                    'session_data' => session()->all(),
                    'timestamp' => now(),
                ]);
            });

            Route::get('/user-groups', function () {
                $user = Session::get('user');
                $userGroups = [];

                if ($user && !empty($user['authenticated'])) {
                    foreach ($user['groups']['value'] ?? $user['groups'] ?? [] as $group) {
                        if (isset($group['displayName'])) {
                            $userGroups[] = $group['displayName'];
                        }
                    }
                }

                $accessRules = \App\Models\GroupPersonalizedLink::whereIn('microsoft_group_name', $userGroups)
                    ->where('is_active', true)
                    ->get(['microsoft_group_name', 'link_name', 'link_url', 'replaces_link']);

                return response()->json([
                    'user_groups' => $userGroups,
                    'access_rules' => $accessRules,
                ]);
            });

            Route::post('/memo-test', function (\Illuminate\Http\Request $request) {
                $user = Session::get('user');
                $isAuthenticated = !empty($user) && !empty($user['authenticated']);
                return response()->json([
                    'authenticated' => $isAuthenticated,
                    'request_data' => $request->except(['document']),
                    'has_file' => $request->hasFile('document'),
                ]);
            });

            Route::get('/workflow', function () {
                $user = Session::get('user');
                if (!$user) {
                    return response()->json(['error' => 'Not authenticated'], 401);
                }
                $groupMemberController = new \App\Http\Controllers\GroupMemberController();
                $approvalController = new \App\Http\Controllers\ApprovalController();
                $members = json_decode($groupMemberController->index()->getContent(), true);
                $approvals = json_decode($approvalController->myApprovals()->getContent(), true);
                return response()->json([
                    'current_user' => [
                        'email' => $user['profile']['userPrincipalName'] ?? null,
                        'name' => $user['profile']['displayName'] ?? 'Unknown',
                    ],
                    'available_approvers' => count($members),
                    'pending_approvals' => count($approvals),
                ]);
            });

            Route::get('/test-email', function () {
                $user = Session::get('user');
                if (!$user || empty($user['authenticated'])) {
                    return response()->json(['error' => 'Not authenticated'], 401);
                }
                $userEmail = $user['profile']['userPrincipalName'] ?? $user['profile']['mail'];
                $userName = $user['profile']['displayName'] ?? 'Test User';
                $emailService = new \App\Services\EmailService();
                $result = $emailService->sendEmailFromNoreply(
                    $userEmail,
                    $userName,
                    'Test Email from ' . config('app.name'),
                    '<h2>Email Test</h2><p>If you receive this, the noreply email integration is working.</p>'
                );
                return response()->json(['email_sent' => $result, 'recipient' => $userEmail]);
            });
        });
    }
});

// Serve the SPA entry point (catch-all — must be last)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
