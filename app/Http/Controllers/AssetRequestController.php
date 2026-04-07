<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use App\Models\AssetRequest;

class AssetRequestController extends Controller
{
    private function authUser(): ?array
    {
        $user = Session::get('user');
        return ($user && ($user['authenticated'] ?? false)) ? $user : null;
    }

    private function isITAdmin(array $user): bool
    {
        $adminGroups = ['IT Manager', 'IT Admin', 'Admin'];
        return !empty(array_intersect($user['roles'] ?? [], $adminGroups));
    }

    // Employee submits a new request
    public function store(Request $request)
    {
        try {
            $user = $this->authUser();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $request->validate([
                'asset_type' => 'required|string|max:100',
                'notes'      => 'nullable|string|max:1000',
            ]);

            $assetRequest = AssetRequest::create([
                'employee_email' => $user['email'],
                'employee_name'  => $user['name'],
                'asset_type'     => $request->asset_type,
                'notes'          => $request->notes,
                'status'         => 'pending',
            ]);

            return response()->json(['message' => 'Request submitted successfully', 'request' => $assetRequest], 201);

        } catch (\Exception $e) {
            Log::error('AssetRequestController@store', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to submit request'], 500);
        }
    }

    // Employee views their own requests; IT admin sees all
    public function index(Request $request)
    {
        try {
            $user = $this->authUser();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $query = AssetRequest::orderByDesc('created_at');

            if (!$this->isITAdmin($user)) {
                $query->where('employee_email', $user['email']);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            return response()->json($query->get());

        } catch (\Exception $e) {
            Log::error('AssetRequestController@index', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch requests'], 500);
        }
    }

    // IT admin approves or rejects a request
    public function review(Request $request, int $id)
    {
        try {
            $user = $this->authUser();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            if (!$this->isITAdmin($user)) {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            $request->validate([
                'status'       => 'required|in:approved,rejected',
                'review_notes' => 'nullable|string|max:1000',
            ]);

            $assetRequest = AssetRequest::findOrFail($id);

            if ($assetRequest->status !== 'pending') {
                return response()->json(['error' => 'Request has already been reviewed'], 400);
            }

            $assetRequest->update([
                'status'           => $request->status,
                'reviewed_by_email'=> $user['email'],
                'review_notes'     => $request->review_notes,
                'reviewed_at'      => now(),
            ]);

            return response()->json(['message' => 'Request reviewed successfully', 'request' => $assetRequest]);

        } catch (\Exception $e) {
            Log::error('AssetRequestController@review', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to review request'], 500);
        }
    }
}
