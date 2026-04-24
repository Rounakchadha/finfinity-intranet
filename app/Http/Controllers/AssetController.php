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
                ->leftJoin('employees as emp', 'aam.user_email', '=', 'emp.employee_email')
                ->select(
                    'am.*',
                    'aam.user_email as allocated_to_email',
                    'aam.assign_on as allocated_on',
                    'emp.name as allocated_to_name'
                );

            match ($filter) {
                'active'        => $query->where('am.status', 'active'),
                'inactive'      => $query->where('am.status', 'inactive'),
                'decommissioned'=> $query->where('am.status', 'decommissioned'),
                default         => null,
            };

            $assets = $query->get()->map(fn($a) => [
                'id'                  => $a->id,
                'tag'                 => $a->tag,
                'type'                => $a->type,
                'ownership'           => $a->ownership,
                'warranty'            => $a->warranty,
                'warranty_start'      => $a->warranty_start,
                'warranty_end'        => $a->warranty_end,
                'serial_number'       => $a->serial_number,
                'model'               => $a->model,
                'location'            => $a->location,
                'monthly_rent'        => $a->monthly_rent ?? null,
                'out_date'            => $a->out_date ?? null,
                'status'              => $a->status,
                'allocated_to_email'  => $a->allocated_to_email,
                'allocated_to_name'   => $a->allocated_to_name,
                'allocated_on'        => $a->allocated_on,
                'created_at'          => $a->created_at,
                'warranty_display'    => $a->warranty ?? null,
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

            $isByod = $request->ownership === 'BYOD';

            $rules = [
                'tag'                    => 'nullable|string|max:50|unique:asset_master,tag',
                'ownership'              => 'required|in:SGPL,Rental,BYOD',
                'model'                  => $isByod ? 'nullable|string|max:50' : 'required|string|max:50',
                'serial_number'          => 'nullable|string|max:30|unique:asset_master,serial_number',
                'warranty'               => 'nullable|string|in:Under Warranty,Out of Warranty,NA',
                'location'               => 'nullable|string|max:255',
                'assign_to'              => 'nullable|in:employee,contractor',
                'assign_email'           => 'nullable|email',
                'assign_contractor_name' => 'nullable|string|max:255',
            ];

            $request->validate($rules);

            // Generate tag if not provided
            $tag = $request->filled('tag')
                ? $request->tag
                : $this->generateAssetTag('Laptop', $request->ownership);

            $assignTo    = $request->assign_to;
            $assignEmail = $request->assign_email;
            $contractorName = trim($request->assign_contractor_name ?? '');

            // Determine initial status — active if immediately assigned
            $hasAssignment = ($assignTo === 'employee' && $assignEmail)
                          || ($assignTo === 'contractor' && $contractorName);
            $initialStatus = $hasAssignment ? 'active' : 'inactive';

            // If custom location, persist it to location_master so it shows in dropdown next time
            if ($request->filled('location')) {
                $exists = DB::table('location_master')
                    ->where('unique_location', $request->location)
                    ->exists();
                if (!$exists) {
                    DB::table('location_master')->insert([
                        'unique_location' => $request->location,
                        'created_at'      => now(),
                        'updated_at'      => now(),
                    ]);
                }
            }

            DB::beginTransaction();

            DB::table('asset_master')->insert([
                'type'          => 'Laptop',
                'ownership'     => $request->ownership,
                'warranty'      => $request->warranty ?: null,
                'serial_number' => $request->serial_number ?: null,
                'tag'           => $tag,
                'model'         => $request->model ?: null,
                'location'      => $request->location ?: null,
                'status'        => $initialStatus,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            $this->log('created', $tag, $user);

            // Handle inline assignment
            if ($hasAssignment) {
                if ($assignTo === 'employee' && $assignEmail) {
                    $allocationEmail = $assignEmail;
                } else {
                    // Synthetic email for contractor (no real email needed)
                    $slug = preg_replace('/[^a-z0-9]+/', '.', strtolower($contractorName));
                    $allocationEmail = "contractor.{$slug}@ext.local";
                }

                DB::table('allocated_asset_master')->insert([
                    'asset_tag'  => $tag,
                    'user_email' => $allocationEmail,
                    'assign_on'  => now(),
                    'status'     => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->log('allocated', $tag, $user, ['to_user_email' => $allocationEmail]);

                // Update employee device_type: BYOD asset → mark them BYOD; company asset → Rented
                if ($assignTo === 'employee' && $assignEmail) {
                    $newDeviceType = $isByod ? 'BYOD' : 'Rented';
                    DB::table('employees')
                        ->where('employee_email', $assignEmail)
                        ->update(['device_type' => $newDeviceType, 'updated_at' => now()]);
                }
            }

            DB::commit();

            return response()->json(['message' => 'Asset created successfully', 'tag' => $tag], 201);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('AssetController@store', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create asset', 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $tag)
    {
        try {
            $user = $this->authUser();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $asset = DB::table('asset_master')->where('tag', $tag)->first();
            if (!$asset) {
                return response()->json(['error' => 'Asset not found'], 404);
            }

            $request->validate([
                'model'         => 'nullable|string|max:50',
                'serial_number' => "nullable|string|max:30|unique:asset_master,serial_number,{$asset->id}",
                'warranty'      => 'nullable|string|in:Under Warranty,Out of Warranty,NA',
                'location'      => 'nullable|string|max:255',
                'ownership'     => 'nullable|in:SGPL,Rental,BYOD',
            ]);

            // Persist new custom location
            if ($request->filled('location')) {
                $exists = DB::table('location_master')
                    ->where('unique_location', $request->location)
                    ->exists();
                if (!$exists) {
                    DB::table('location_master')->insert([
                        'unique_location' => $request->location,
                        'created_at'      => now(),
                        'updated_at'      => now(),
                    ]);
                }
            }

            $data = ['updated_at' => now()];
            foreach (['model', 'serial_number', 'warranty', 'location', 'ownership'] as $field) {
                if ($request->has($field)) {
                    $data[$field] = $request->filled($field) ? $request->$field : null;
                }
            }

            DB::table('asset_master')->where('tag', $tag)->update($data);

            return response()->json(['message' => 'Asset updated successfully']);

        } catch (\Exception $e) {
            Log::error('AssetController@update', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update asset', 'message' => $e->getMessage()], 500);
        }
    }

    public function laptopMatrix(Request $request)
    {
        try {
            if (!$this->authUser()) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $laptops = DB::table('asset_master as am')
                ->leftJoin('allocated_asset_master as aam', function ($join) {
                    $join->on('am.tag', '=', 'aam.asset_tag')
                         ->where('aam.status', 'active');
                })
                ->leftJoin('employees as emp', 'aam.user_email', '=', 'emp.employee_email')
                ->where('am.type', 'Laptop')
                ->select(
                    'am.tag', 'am.model', 'am.serial_number',
                    'am.location', 'am.city',
                    'am.status', 'am.monthly_rent', 'am.out_date', 'am.contract_end_note',
                    'aam.user_email as allocated_to_email',
                    'aam.assign_on as allocated_on',
                    'emp.name as allocated_to_name',
                    'emp.job_title as allocated_to_title',
                    'emp.employee_number as allocated_to_emp_no'
                )
                ->orderBy('am.tag')
                ->get();

            // Emails of employees who have a rented laptop in the system
            $emailsWithRentedLaptop = DB::table('allocated_asset_master as aam')
                ->join('asset_master as am', function ($j) {
                    $j->on('aam.asset_tag', '=', 'am.tag')->where('am.type', 'Laptop');
                })
                ->where('aam.status', 'active')
                ->pluck('aam.user_email')
                ->toArray();

            // All employees grouped by device type
            $allEmployees = DB::table('employees')
                ->where('status', 'Active')
                ->select('employee_email', 'name', 'job_title', 'employee_number', 'device_type', 'personal_device')
                ->orderBy('name')
                ->get();

            // Split into device categories
            $byod            = $allEmployees->filter(fn($e) => $e->device_type === 'BYOD')->values();
            $finfinityOwned  = $allEmployees->filter(fn($e) => $e->device_type === 'Finfinity Owned')->values();
            $noDevice        = $allEmployees
                ->filter(fn($e) => in_array($e->device_type, ['NA', null, '']) && !in_array($e->employee_email, $emailsWithRentedLaptop))
                ->values();
            // Rented but not yet in the asset system
            $rentedNotLinked = $allEmployees
                ->filter(fn($e) => $e->device_type === 'Rented' && !in_array($e->employee_email, $emailsWithRentedLaptop))
                ->values();

            $stats = [
                'total_laptops'      => $laptops->count(),
                'allocated'          => $laptops->where('status', 'active')->count(),
                'spare'              => $laptops->where('status', 'inactive')->count(),
                'decommissioned'     => $laptops->where('status', 'decommissioned')->count(),
                'rented_assigned'    => count($emailsWithRentedLaptop),
                'byod_count'         => $byod->count(),
                'finfinity_owned'    => $finfinityOwned->count(),
                'no_device'          => $noDevice->count(),
                'rented_not_linked'  => $rentedNotLinked->count(),
            ];

            return response()->json([
                'laptops'           => $laptops->values(),
                'byod'              => $byod,
                'finfinity_owned'   => $finfinityOwned,
                'no_device'         => $noDevice,
                'rented_not_linked' => $rentedNotLinked,
                'stats'             => $stats,
            ]);

        } catch (\Exception $e) {
            Log::error('AssetController@laptopMatrix', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load laptop matrix'], 500);
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
                'force'      => 'nullable|boolean',
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

            // Check if the target employee already has a laptop of the same type
            if (!$request->boolean('force')) {
                $assetType = $asset->type;
                $existingForEmployee = DB::table('allocated_asset_master as aam')
                    ->join('asset_master as am', 'aam.asset_tag', '=', 'am.tag')
                    ->where('aam.user_email', $request->user_email)
                    ->where('aam.status', 'active')
                    ->where('am.type', $assetType)
                    ->select('aam.asset_tag')
                    ->first();

                if ($existingForEmployee) {
                    $employeeName = DB::table('employees')
                        ->where('employee_email', $request->user_email)
                        ->value('name') ?? $request->user_email;
                    return response()->json([
                        'warning'          => true,
                        'existing_asset'   => $existingForEmployee->asset_tag,
                        'message'          => "Warning: {$employeeName} already has {$assetType} {$existingForEmployee->asset_tag} assigned. Pass force=true to reassign instead, or use the Reassign action.",
                    ], 409);
                }
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

            // If employee was BYOD but is now receiving a company laptop, flip device_type to Rented
            if ($asset->ownership !== 'BYOD') {
                DB::table('employees')
                    ->where('employee_email', $request->user_email)
                    ->where('device_type', 'BYOD')
                    ->update(['device_type' => 'Rented', 'updated_at' => now()]);
            }

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
