<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Models\QrCode;

class QrCodeController extends Controller
{
    private function authorizedUser(): ?array
    {
        $user = Session::get('user');
        return ($user && !empty($user['authenticated'])) ? $user : null;
    }

    private function isAdmin(array $user): bool
    {
        $roles       = $user['roles'] ?? [];
        $adminGroups = config('portal.admin_groups', ['Admin', 'HR', 'HR Manager']);
        return count(array_intersect($roles, $adminGroups)) > 0;
    }

    public function index()
    {
        $user = $this->authorizedUser();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $qrCodes = QrCode::orderBy('category')->orderBy('name')->get();
        return response()->json($qrCodes);
    }

    public function store(Request $request)
    {
        $user = $this->authorizedUser();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }
        if (!$this->isAdmin($user)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'category'    => 'required|string|in:wifi,cafeteria,parking,emergency,custom',
            'description' => 'nullable|string|max:500',
            'content'     => 'required|string',
            'is_dynamic'  => 'boolean',
        ]);

        $qrCode = QrCode::create([
            ...$data,
            'created_by_name'  => $user['profile']['displayName'] ?? 'Admin',
            'created_by_email' => $user['profile']['userPrincipalName'] ?? $user['profile']['mail'],
        ]);

        return response()->json($qrCode, 201);
    }

    public function update(Request $request, $id)
    {
        $user = $this->authorizedUser();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }
        if (!$this->isAdmin($user)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $qrCode = QrCode::findOrFail($id);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:100',
            'category'    => 'sometimes|string|in:wifi,cafeteria,parking,emergency,custom',
            'description' => 'nullable|string|max:500',
            'content'     => 'sometimes|string',
            'is_dynamic'  => 'sometimes|boolean',
        ]);

        $qrCode->update($data);
        return response()->json($qrCode);
    }

    public function destroy($id)
    {
        $user = $this->authorizedUser();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }
        if (!$this->isAdmin($user)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        QrCode::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
