<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Models\Announcement;
use App\Models\AnnouncementAcknowledgement;

class AnnouncementController extends Controller
{
    private function authorizedUser(): ?array
    {
        $user = Session::get('user');
        return ($user && !empty($user['authenticated'])) ? $user : null;
    }

    private function isAdminOrHR(array $user): bool
    {
        $roles = $user['roles'] ?? [];
        $adminGroups = config('portal.admin_groups', ['Admin', 'HR', 'HR Manager']);
        return count(array_intersect($roles, $adminGroups)) > 0;
    }

    public function index()
    {
        $user = $this->authorizedUser();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $userEmail = $user['profile']['userPrincipalName'] ?? $user['profile']['mail'];

        $announcements = Announcement::active()
            ->pinnedFirst()
            ->withCount('acknowledgements')
            ->get()
            ->map(function ($a) use ($userEmail) {
                return [
                    'id'               => $a->id,
                    'title'            => $a->title,
                    'body'             => $a->body,
                    'posted_by'        => $a->posted_by_name,
                    'is_pinned'        => $a->is_pinned,
                    'expires_at'       => $a->expires_at,
                    'created_at'       => $a->created_at,
                    'ack_count'        => $a->acknowledgements_count,
                    'acknowledged_by_me' => $a->acknowledgements()
                        ->where('acknowledged_by_email', $userEmail)
                        ->exists(),
                ];
            });

        return response()->json($announcements);
    }

    public function store(Request $request)
    {
        $user = $this->authorizedUser();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }
        if (!$this->isAdminOrHR($user)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'body'       => 'required|string',
            'is_pinned'  => 'boolean',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $announcement = Announcement::create([
            ...$data,
            'posted_by_name'  => $user['profile']['displayName'] ?? 'Admin',
            'posted_by_email' => $user['profile']['userPrincipalName'] ?? $user['profile']['mail'],
        ]);

        return response()->json($announcement, 201);
    }

    public function update(Request $request, $id)
    {
        $user = $this->authorizedUser();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }
        if (!$this->isAdminOrHR($user)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $announcement = Announcement::findOrFail($id);

        $data = $request->validate([
            'title'      => 'sometimes|string|max:255',
            'body'       => 'sometimes|string',
            'is_pinned'  => 'sometimes|boolean',
            'expires_at' => 'nullable|date',
        ]);

        $announcement->update($data);

        return response()->json($announcement);
    }

    public function destroy($id)
    {
        $user = $this->authorizedUser();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }
        if (!$this->isAdminOrHR($user)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        Announcement::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function acknowledge($id)
    {
        $user = $this->authorizedUser();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $userEmail = $user['profile']['userPrincipalName'] ?? $user['profile']['mail'];
        $userName  = $user['profile']['displayName'] ?? 'Unknown';

        $announcement = Announcement::findOrFail($id);

        $already = AnnouncementAcknowledgement::where('announcement_id', $id)
            ->where('acknowledged_by_email', $userEmail)
            ->exists();

        if (!$already) {
            AnnouncementAcknowledgement::create([
                'announcement_id'       => $id,
                'acknowledged_by_email' => $userEmail,
                'acknowledged_by_name'  => $userName,
                'acknowledged_at'       => now(),
            ]);
        }

        return response()->json(['acknowledged' => true]);
    }
}
