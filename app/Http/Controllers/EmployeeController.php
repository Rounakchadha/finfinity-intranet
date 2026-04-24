<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class EmployeeController extends Controller
{
    private $client;

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30.0,
            'connect_timeout' => 10.0
        ]);
    }

    /**
     * Get all employees from Microsoft Graph API
     */
    public function index()
    {
        $user = Session::get('user');
        if (!$user || !isset($user['authenticated']) || !$user['authenticated']) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $accessToken = AuthController::getValidToken();

        // If no Graph token (local dev login or token expired), fall back to local DB
        if (!$accessToken) {
            Log::info('EmployeeController: No valid Graph token — returning local DB employees');
            return response()->json($this->getLocalEmployees());
        }

        try {
            Log::info('EmployeeController: Fetching all employees from Microsoft Graph');
            $employees = $this->fetchAllEmployees($accessToken);
            Log::info('EmployeeController: Returning employees', ['total_employees' => count($employees)]);
            return response()->json($employees);
        } catch (\Exception $e) {
            Log::error('EmployeeController: Graph error, falling back to local DB', ['error' => $e->getMessage()]);
            return response()->json($this->getLocalEmployees());
        }
    }

    /**
     * Return employees from the local database (HR-managed records).
     * Field names match what the frontend expects.
     */
    private function getLocalEmployees(): array
    {
        $rows = DB::table('employees')
            ->where('status', 'Active')
            ->orderBy('name')
            ->get(['id', 'name', 'employee_email', 'job_title', 'department', 'manager_email']);

        return $rows->map(fn($e) => [
            'id'              => $e->id,
            'name'            => $e->name,
            'email'           => $e->employee_email,
            'job_title'       => $e->job_title,
            'department'      => $e->department,
            'office_location' => null,
            'group_name'      => null,
        ])->toArray();
    }

    /**
     * Fetch all employees from Microsoft Graph
     */
    private function fetchAllEmployees($accessToken)
    {
        try {
            Log::info('EmployeeController: Fetching users from Microsoft Graph API');
            
            // Fetch users from Microsoft Graph
            $response = $this->client->get('https://graph.microsoft.com/v1.0/users', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json'
                ],
                'query' => [
                    '$select' => 'id,displayName,userPrincipalName,mail,jobTitle,department,officeLocation',
                    '$filter' => "accountEnabled eq true and userType eq 'Member'", // Only active member accounts
                    '$top' => 999 // Get up to 999 users (Microsoft Graph limit)
                ]
            ]);

            $data = json_decode($response->getBody(), true);
            $users = $data['value'] ?? [];

            Log::info('EmployeeController: Found users from Graph', [
                'count' => count($users)
            ]);

            // Also fetch group memberships to add group information
            $employeesWithGroups = $this->enrichWithGroupData($accessToken, $users);

            return $employeesWithGroups;

        } catch (RequestException $e) {
            Log::error('EmployeeController: Microsoft Graph API error', [
                'error' => $e->getMessage(),
                'status_code' => $e->getResponse() ? $e->getResponse()->getStatusCode() : 'unknown'
            ]);
            
            return $this->getFallbackEmployees();
        }
    }

    /**
     * Map Graph API user records to the shape the frontend expects.
     * No per-user API calls — department is already in the user record.
     */
    private function enrichWithGroupData($accessToken, $users): array
    {
        return array_map(fn($user) => [
            'id'              => $user['id'],
            'name'            => $user['displayName'] ?? $user['userPrincipalName'],
            'email'           => $user['userPrincipalName'] ?? $user['mail'] ?? '',
            'job_title'       => $user['jobTitle'] ?? null,
            'department'      => $user['department'] ?? null,
            'office_location' => $user['officeLocation'] ?? null,
            'group_name'      => $user['department'] ?? null, // use dept as group label
        ], $users);
    }

    /**
     * @deprecated Use getLocalEmployees() instead
     */
    private function getFallbackEmployees(): array
    {
        return $this->getLocalEmployees();
    }

    private function isAdmin(array $user): bool
    {
        $adminGroups = array_map('strtolower', config('portal.admin_groups', ['Admin', 'HR', 'HR Manager']));
        $roles       = array_map('strtolower', $user['roles'] ?? []);
        $email       = strtolower($user['profile']['userPrincipalName'] ?? $user['profile']['mail'] ?? '');
        $superadmins = array_map('strtolower', config('portal.superadmin_emails', []));
        return in_array($email, $superadmins) || !empty(array_intersect($roles, $adminGroups));
    }

    /**
     * Return a single employee by email (merges Graph/local data).
     */
    public function show(\Illuminate\Http\Request $request)
    {
        $user = Session::get('user');
        if (!$user || empty($user['authenticated'])) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $email = $request->query('email');
        if (!$email) return response()->json(['error' => 'email required'], 400);

        // Local DB record (has phone, start_date, personal_email, etc.)
        $local = DB::table('employees')->where('employee_email', $email)->first();

        // Current laptop allocation
        $laptop = DB::table('allocated_asset_master as aam')
            ->join('asset_master as am', 'aam.asset_tag', '=', 'am.tag')
            ->where('aam.user_email', $email)
            ->where('aam.status', 'active')
            ->where('am.type', 'Laptop')
            ->select(
                'am.tag', 'am.model', 'am.serial_number',
                'am.ownership', 'am.warranty', 'am.location',
                'aam.assign_on'
            )
            ->first();

        return response()->json([
            'email'           => $email,
            'name'            => $local?->name,
            'phone'           => $local?->phone,
            'personal_email'  => $local?->personal_email,
            'job_title'       => $local?->job_title,
            'department'      => $local?->department,
            'office_location' => $local?->office_location,
            'manager_email'   => $local?->manager_email,
            'start_date'      => $local?->start_date,
            'status'          => $local?->status ?? 'Active',
            'local_id'        => $local?->id,
            'device_type'     => $local?->device_type,
            'personal_device' => $local?->personal_device,
            'laptop'          => $laptop ? [
                'tag'           => $laptop->tag,
                'model'         => $laptop->model,
                'serial_number' => $laptop->serial_number,
                'ownership'     => $laptop->ownership,
                'warranty'      => $laptop->warranty,
                'location'      => $laptop->location,
                'assigned_on'   => $laptop->assign_on,
            ] : null,
        ]);
    }

    /**
     * Admin: update employee local DB record.
     */
    public function update(\Illuminate\Http\Request $request)
    {
        $user = Session::get('user');
        if (!$user || empty($user['authenticated'])) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }
        if (!$this->isAdmin($user)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $email = $request->query('email');
        if (!$email) return response()->json(['error' => 'email required'], 400);

        // Treat empty strings as null so email/date validation doesn't choke on ""
        $input = collect($request->only(['name', 'phone', 'personal_email', 'job_title', 'department', 'office_location', 'manager_email', 'start_date']))
            ->map(fn($v) => ($v === '' ? null : $v))
            ->toArray();

        \Validator::make($input, [
            'name'            => 'nullable|string|max:255',
            'phone'           => 'nullable|string|max:30',
            'personal_email'  => 'nullable|email|max:255',
            'job_title'       => 'nullable|string|max:255',
            'department'      => 'nullable|string|max:255',
            'office_location' => 'nullable|string|max:255',
            'manager_email'   => 'nullable|email|max:255',
            'start_date'      => 'nullable|date',
        ])->validate();

        $existing = DB::table('employees')->where('employee_email', $email)->first();

        // Only include non-null values in the update
        $data = array_filter($input, fn($v) => !is_null($v));
        $data['updated_at'] = now();

        if ($existing) {
            DB::table('employees')->where('employee_email', $email)->update($data);
        } else {
            DB::table('employees')->insert(array_merge($data, [
                'employee_email' => $email,
                'status'         => 'Active',
                'created_at'     => now(),
            ]));
        }

        return response()->json(['message' => 'Updated successfully']);
    }

    public function destroy(\Illuminate\Http\Request $request)
    {
        $user = Session::get('user');
        if (!$user || empty($user['authenticated'])) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }
        if (!$this->isAdmin($user)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $email = $request->query('email');
        if (!$email) return response()->json(['error' => 'email required'], 400);

        DB::table('employees')->where('employee_email', $email)->delete();

        return response()->json(['message' => 'Employee removed']);
    }
} 