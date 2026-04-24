<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use GuzzleHttp\Client;

class DocumentController extends Controller
{
    private function authUser(): ?array
    {
        $user = Session::get('user');
        return ($user && ($user['authenticated'] ?? false)) ? $user : null;
    }

    private function isAdmin(array $user): bool
    {
        $adminGroups = array_map('strtolower', config('portal.admin_groups', ['Admin', 'HR', 'HR Manager']));
        $roles       = array_map('strtolower', $user['roles'] ?? []);
        $email       = strtolower($user['profile']['userPrincipalName'] ?? $user['profile']['mail'] ?? '');
        $superadmins = array_map('strtolower', config('portal.superadmin_emails', []));
        return in_array($email, $superadmins) || !empty(array_intersect($roles, $adminGroups));
    }

    public function index()
    {
        $user = $this->authUser();
        if (!$user) return response()->json(['error' => 'Not authenticated'], 401);

        $paperlessToken = config('services.paperless.token');
        $paperlessUrl   = config('services.paperless.url');

        // Paperless not configured — serve from portal_documents table
        if (!$paperlessToken || !$paperlessUrl) {
            $docs = DB::table('portal_documents')
                ->orderByDesc('created_at')
                ->get();

            return response()->json($docs->map(fn($d) => [
                'id'                => $d->id,
                'title'             => $d->title,
                'original_filename' => $d->original_filename,
                'category'          => $d->category,
                'description'       => $d->description,
                'uploaded_by_name'  => $d->uploaded_by_name,
                'created_at'        => $d->created_at,
                'download_url'      => '/api/documents/' . $d->id . '/download',
            ]));
        }

        // Paperless integration
        try {
            $roles = $user['roles'] ?? [];
            $tags  = [];
            if (!empty($roles)) {
                $tags = DB::table('role_tag')->whereIn('role', $roles)->distinct()->pluck('tag')->toArray();
            }
            if (empty($tags)) return response()->json([]);

            $docIds = DB::table('doc_tag')->whereIn('tag', $tags)->distinct()->pluck('document_id')->toArray();
            if (empty($docIds)) return response()->json([]);

            $client     = new Client(['timeout' => 10.0]);
            $resultDocs = [];
            foreach ($docIds as $docId) {
                try {
                    $res = $client->get("{$paperlessUrl}/api/documents/{$docId}/", [
                        'headers'     => ['Authorization' => 'Token ' . $paperlessToken],
                        'http_errors' => false,
                    ]);
                    if ($res->getStatusCode() === 200) $resultDocs[] = json_decode($res->getBody(), true);
                } catch (\Exception $e) {
                    Log::warning('DocumentController: Failed to fetch doc', ['doc_id' => $docId, 'error' => $e->getMessage()]);
                }
            }
            return response()->json($resultDocs);
        } catch (\Exception $e) {
            Log::error('DocumentController: Error', ['error' => $e->getMessage()]);
            return response()->json([]);
        }
    }

    public function store(Request $request)
    {
        $user = $this->authUser();
        if (!$user) return response()->json(['error' => 'Not authenticated'], 401);
        if (!$this->isAdmin($user)) return response()->json(['error' => 'Forbidden'], 403);

        $request->validate([
            'file'     => 'required|file|max:20480', // 20 MB
            'title'    => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        $file     = $request->file('file');
        $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());

        Storage::disk('public')->putFileAs('documents', $file, $filename);

        $id = DB::table('portal_documents')->insertGetId([
            'title'             => $request->title,
            'filename'          => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'category'          => $request->category,
            'description'       => $request->description,
            'uploaded_by_email' => $user['profile']['userPrincipalName'] ?? $user['profile']['mail'] ?? '',
            'uploaded_by_name'  => $user['profile']['displayName'] ?? 'Admin',
            'is_public'         => true,
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Document uploaded successfully'], 201);
    }

    public function download(int $id)
    {
        $user = $this->authUser();
        if (!$user) return response()->json(['error' => 'Not authenticated'], 401);

        $doc = DB::table('portal_documents')->find($id);
        if (!$doc) return response()->json(['error' => 'Not found'], 404);

        $path = Storage::disk('public')->path('documents/' . $doc->filename);
        if (!file_exists($path)) return response()->json(['error' => 'File not found'], 404);

        return response()->download($path, $doc->original_filename);
    }

    public function destroy(int $id)
    {
        $user = $this->authUser();
        if (!$user) return response()->json(['error' => 'Not authenticated'], 401);
        if (!$this->isAdmin($user)) return response()->json(['error' => 'Forbidden'], 403);

        $doc = DB::table('portal_documents')->find($id);
        if (!$doc) return response()->json(['error' => 'Not found'], 404);

        Storage::disk('public')->delete('documents/' . $doc->filename);
        DB::table('portal_documents')->delete($id);

        return response()->json(['message' => 'Deleted']);
    }
}
