<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\AssetAuditLog;

class AssetController extends Controller
{
    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function authUser(): ?array
    {
        $user = Session::get('user');
        return ($user && ($user['authenticated'] ?? false)) ? $user : null;
    }

    private function log(string $action, string $assetTag, array $user, array $extra = []): void
    {
        AssetAuditLog::create(array_merge([
            'asset_tag'          => $assetTag,
            'action'             => $action,
            'performed_by_email' => $user['email'] ?? '',
            'performed_by_name'  => $user['name']  ?? '',
            'performed_at'       => now(),
        ], $extra));
    }

    // -------------------------------------------------------------------------
    // Read endpoints
    // -------------------------------------------------------------------------

    public function index(Request $request)
    {
        try {
            if (!$this->authUser()) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $filter = $request->get('filter', 'all');

            $query = DB::table('asset_master as am')
                ->leftJoin('allocated_asset_master as aam', function ($join) {
                    $join->on('am.tag', '=', 'aam.asset_tag')
                         ->where('aam.status', 'active');
                })
                ->select(
                    'am.*',
                    'aam.user_email as allocated_to_email',
                    'aam.assign_on as allocated_on'
                );

            match ($filter) {
                'active'        => $query->where('am.status', 'active'),
                'inactive'      => $query->where('am.status', 'inactive'),
                'decommissioned'=> $query->where('am.status', 'decommissioned'),
                default         => null,
            };

            $assets = $query->get()->map(fn($a) => [
                'id'                 => $a->id,
                'tag'                => $a->tag,
                'type'               => $a->type,
                'ownership'          => $a->ownership,
                'warranty'           => $a->warranty,
                'warranty_start'     => $a->warranty_start,
                'warranty_end'       => $a->warranty_end,
                'serial_number'      => $a->serial_number,
                'model'              => $a->model,
                'location'           => $a->location,
                'status'             => $a->status,
                'allocated_to_email' => $a->allocated_to_email,
                'allocated_on'       => $a->allocated_on,
                'created_at'         => $a->created_at,
            ]);

            return response()->json(['assets' => $assets, 'total' => $assets->count()]);

        } catch (\Exception $e) {
            Log::error('AssetController@index', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch assets'], 500);
        }
    }

    public function getAssetTypes()
    {
        try {
            return response()->json(DB::table('asset_type_master')->get());
        } catch (\Exception $e) {
            Log::error('AssetController@getAssetTypes', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch asset types'], 500);
        }
    }

    public function getLocations()
    {
        try {
            return response()->json(DB::table('location_master')->get());
        } catch (\Exception $e) {
            Log::error('AssetController@getLocations', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch locations'], 500);
        }
    }

    public function auditLogs(Request $request)
    {
        try {
            if (!$this->authUser()) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $query = AssetAuditLog::orderByDesc('performed_at');

            if ($request->filled('asset_tag')) {
                $query->where('asset_tag', $request->asset_tag);
            }

            $logs = $query->limit(200)->get();

            return response()->json($logs);

        } catch (\Exception $e) {
            Log::error('AssetController@auditLogs', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch audit logs'], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Write endpoints
    // -------------------------------------------------------------------------

    public function store(Request $request)
    {
        try {
            $user = $this->authUser();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $request->validate([
                'type'          => 'required|string|exists:asset_type_master,type',
                'ownership'     => 'required|in:SGPL,Rental,BYOD',
                'warranty'      => 'required|in:Under Warranty,NA,Out of Warranty',
                'warranty_start'=> 'nullable|date',
                'warranty_end'  => 'nullable|date|after:warranty_start',
                'serial_number' => 'required|string|max:30|unique:asset_master,serial_number',
                'model'         => 'required|string|max:50',
                'location'      => 'required|string|exists:location_master,unique_location',
            ]);

            $tag = $this->generateAssetTag($request->type, $request->ownership);

            DB::table('asset_master')->insert([
                'type'          => $request->type,
                'ownership'     => $request->ownership,
                'warranty'      => $request->warranty,
                'warranty_start'=> $request->warranty_start,
                'warranty_end'  => $request->warranty_end,
                'serial_number' => $request->serial_number,
                'tag'           => $tag,
                'model'         => $request->model,
                'location'      => $request->location,
                'status'        => 'inactive',
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            $this->log('created', $tag, $user);

            return response()->json(['message' => 'Asset created successfully', 'tag' => $tag], 201);

        } catch (\Exception $e) {
            Log::error('AssetController@store', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create asset', 'message' => $e->getMessage()], 500);
        }
    }

    public function allocate(Request $request)
    {
        try {
            $user = $this->authUser();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $request->validate([
                'asset_tag'  => 'required|string|exists:asset_master,tag',
                'user_email' => 'required|email',
            ]);

            $asset = DB::table('asset_master')->where('tag', $request->asset_tag)->first();
            if (!$asset || $asset->status !== 'inactive') {
                return response()->json(['error' => 'Asset not available for allocation'], 400);
            }

            $existing = DB::table('allocated_asset_master')
                ->where('asset_tag', $request->asset_tag)
                ->where('status', 'active')
                ->first();

            if ($existing) {
                return response()->json(['error' => 'Asset already allocated'], 400);
            }

            DB::beginTransaction();

            DB::table('allocated_asset_master')->insert([
                'asset_tag'  => $request->asset_tag,
                'user_email' => $request->user_email,
                'assign_on'  => now(),
                'status'     => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('asset_master')
                ->where('tag', $request->asset_tag)
                ->update(['status' => 'active', 'updated_at' => now()]);

            $this->log('allocated', $request->asset_tag, $user, [
                'to_user_email' => $request->user_email,
            ]);

            DB::commit();

            return response()->json(['message' => 'Asset allocated successfully']);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('AssetController@allocate', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to allocate asset'], 500);
        }
    }

    public function deallocate(Request $request)
    {
        try {
            $user = $this->authUser();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $request->validate([
                'asset_tag' => 'required|string|exists:asset_master,tag',
            ]);

            $currentAllocation = DB::table('allocated_asset_master')
                ->where('asset_tag', $request->asset_tag)
                ->where('status', 'active')
                ->first();

            DB::beginTransaction();

            DB::table('allocated_asset_master')
                ->where('asset_tag', $request->asset_tag)
                ->where('status', 'active')
                ->update(['status' => 'inactive', 'end_date' => now(), 'updated_at' => now()]);

            DB::table('asset_master')
                ->where('tag', $request->asset_tag)
                ->update(['status' => 'inactive', 'updated_at' => now()]);

            $this->log('deallocated', $request->asset_tag, $user, [
                'from_user_email' => $currentAllocation?->user_email,
            ]);

            DB::commit();

            return response()->json(['message' => 'Asset deallocated successfully']);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('AssetController@deallocate', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to deallocate asset'], 500);
        }
    }

    public function reallocate(Request $request)
    {
        try {
            $user = $this->authUser();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $request->validate([
                'asset_tag'      => 'required|string|exists:asset_master,tag',
                'new_user_email' => 'required|email',
            ]);

            $currentAllocation = DB::table('allocated_asset_master')
                ->where('asset_tag', $request->asset_tag)
                ->where('status', 'active')
                ->first();

            DB::beginTransaction();

            DB::table('allocated_asset_master')
                ->where('asset_tag', $request->asset_tag)
                ->where('status', 'active')
                ->update(['status' => 'inactive', 'end_date' => now(), 'updated_at' => now()]);

            DB::table('allocated_asset_master')->insert([
                'asset_tag'  => $request->asset_tag,
                'user_email' => $request->new_user_email,
                'assign_on'  => now(),
                'status'     => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->log('reallocated', $request->asset_tag, $user, [
                'from_user_email' => $currentAllocation?->user_email,
                'to_user_email'   => $request->new_user_email,
            ]);

            DB::commit();

            return response()->json(['message' => 'Asset reallocated successfully']);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('AssetController@reallocate', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to reallocate asset'], 500);
        }
    }

    public function decommission(Request $request)
    {
        try {
            $user = $this->authUser();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $request->validate([
                'asset_tags'   => 'required|array',
                'asset_tags.*' => 'required|string|exists:asset_master,tag',
            ]);

            // Validate ALL assets are inactive BEFORE opening a transaction
            $assets = DB::table('asset_master')
                ->whereIn('tag', $request->asset_tags)
                ->get()
                ->keyBy('tag');

            foreach ($request->asset_tags as $assetTag) {
                if (($assets[$assetTag]->status ?? '') !== 'inactive') {
                    return response()->json(
                        ['error' => "Asset {$assetTag} must be inactive before decommissioning"],
                        400
                    );
                }
            }

            DB::beginTransaction();

            foreach ($request->asset_tags as $assetTag) {
                DB::table('asset_master')
                    ->where('tag', $assetTag)
                    ->update(['status' => 'decommissioned', 'updated_at' => now()]);

                $this->log('decommissioned', $assetTag, $user);
            }

            DB::commit();

            return response()->json(['message' => 'Assets decommissioned successfully']);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('AssetController@decommission', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to decommission assets'], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function generateAssetTag(string $type, string $ownership): string
    {
        $prefix  = ($ownership === 'SGPL') ? 'FIN' : 'EXT';
        $typeData = DB::table('asset_type_master')->where('type', $type)->first();
        $infix   = $typeData ? $typeData->keyword : 'UNK';

        $lastTag = DB::table('asset_master')
            ->where('tag', 'LIKE', $prefix . $infix . '%')
            ->orderByDesc('tag')
            ->first();

        $newPostfix = $lastTag
            ? str_pad(intval(substr($lastTag->tag, -5)) + 1, 5, '0', STR_PAD_LEFT)
            : '00001';

        return $prefix . $infix . $newPostfix;
    }
}
