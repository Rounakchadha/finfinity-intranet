<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PortalSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedEmployees();
        $this->seedQrCodes();
        $this->seedAnnouncements();
    }

    private function seedEmployees(): void
    {
        if (DB::table('employees')->count() > 0) {
            return; // Don't re-seed
        }

        $now = now();
        DB::table('employees')->insert([
            ['name' => 'Arjun Sharma',    'employee_email' => 'arjun.sharma@finfinity.co.in',    'job_title' => 'Senior Software Engineer',  'department' => 'Technology',   'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2022-01-10', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Priya Nair',      'employee_email' => 'priya.nair@finfinity.co.in',      'job_title' => 'Product Manager',           'department' => 'Technology',   'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2021-06-15', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Rohan Mehta',     'employee_email' => 'rohan.mehta@finfinity.co.in',     'job_title' => 'DevOps Engineer',           'department' => 'Technology',   'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2023-03-01', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Sneha Kulkarni',  'employee_email' => 'sneha.kulkarni@finfinity.co.in',  'job_title' => 'HR Business Partner',       'department' => 'Human Resources', 'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2020-09-20', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Vikram Reddy',    'employee_email' => 'vikram.reddy@finfinity.co.in',    'job_title' => 'Finance Analyst',           'department' => 'Finance',      'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2021-11-05', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Meera Pillai',    'employee_email' => 'meera.pillai@finfinity.co.in',    'job_title' => 'Accounts Manager',          'department' => 'Finance',      'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2019-04-12', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Karthik Iyer',    'employee_email' => 'karthik.iyer@finfinity.co.in',    'job_title' => 'IT Support Engineer',       'department' => 'IT',           'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2022-08-22', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ananya Gupta',    'employee_email' => 'ananya.gupta@finfinity.co.in',    'job_title' => 'Marketing Executive',       'department' => 'Marketing',    'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2023-01-15', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Deepak Singh',    'employee_email' => 'deepak.singh@finfinity.co.in',    'job_title' => 'Business Development Manager', 'department' => 'Sales',   'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2020-07-01', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Pooja Desai',     'employee_email' => 'pooja.desai@finfinity.co.in',     'job_title' => 'Legal Counsel',             'department' => 'Legal',        'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2021-03-08', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Rahul Joshi',     'employee_email' => 'rahul.joshi@finfinity.co.in',     'job_title' => 'Data Scientist',            'department' => 'Technology',   'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2022-05-17', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Kavita Patel',    'employee_email' => 'kavita.patel@finfinity.co.in',    'job_title' => 'Talent Acquisition Lead',   'department' => 'Human Resources', 'manager_email' => 'admin@finfinity.co.in', 'start_date' => '2020-12-01', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    private function seedQrCodes(): void
    {
        if (DB::table('qr_codes')->count() > 0) {
            return;
        }

        $now = now();
        DB::table('qr_codes')->insert([
            [
                'name'              => 'Office Wi-Fi',
                'category'          => 'wifi',
                'description'       => 'Main office Wi-Fi network. Connect and stay productive.',
                'content'           => 'WIFI:T:WPA;S:FinFinity-Office;P:changeme123;;',
                'is_dynamic'        => false,
                'created_by_name'   => 'Admin',
                'created_by_email'  => 'admin@finfinity.co.in',
                'created_at'        => $now,
                'updated_at'        => $now,
            ],
            [
                'name'              => 'Cafeteria Menu',
                'category'          => 'cafeteria',
                'description'       => 'Scan to view today\'s cafeteria menu.',
                'content'           => 'https://finfinity.co.in/cafeteria',
                'is_dynamic'        => true,
                'created_by_name'   => 'Admin',
                'created_by_email'  => 'admin@finfinity.co.in',
                'created_at'        => $now,
                'updated_at'        => $now,
            ],
            [
                'name'              => 'Parking Registration',
                'category'          => 'parking',
                'description'       => 'Register your vehicle for parking.',
                'content'           => 'https://finfinity.co.in/parking',
                'is_dynamic'        => false,
                'created_by_name'   => 'Admin',
                'created_by_email'  => 'admin@finfinity.co.in',
                'created_at'        => $now,
                'updated_at'        => $now,
            ],
            [
                'name'              => 'Emergency Contacts',
                'category'          => 'emergency',
                'description'       => 'Fire, medical, security emergency contacts.',
                'content'           => "EMERGENCY CONTACTS\nFire: 101\nAmbulance: 102\nSecurity Desk: +91-9999-000000",
                'is_dynamic'        => false,
                'created_by_name'   => 'Admin',
                'created_by_email'  => 'admin@finfinity.co.in',
                'created_at'        => $now,
                'updated_at'        => $now,
            ],
            [
                'name'              => 'IT Support',
                'category'          => 'custom',
                'description'       => 'Raise an IT support ticket.',
                'content'           => 'https://finfinity.co.in/asset-request',
                'is_dynamic'        => false,
                'created_by_name'   => 'Admin',
                'created_by_email'  => 'admin@finfinity.co.in',
                'created_at'        => $now,
                'updated_at'        => $now,
            ],
        ]);
    }

    private function seedAnnouncements(): void
    {
        if (DB::table('announcements')->count() > 0) {
            return;
        }

        $now = now();
        DB::table('announcements')->insert([
            [
                'title'           => 'Welcome to the FinFinity Intranet Portal',
                'body'            => 'We are excited to launch our new company intranet portal. Use this portal to access company resources, directories, documents, and more. Reach out to IT support if you need any help.',
                'posted_by_name'  => 'Admin',
                'posted_by_email' => 'admin@finfinity.co.in',
                'is_pinned'       => true,
                'expires_at'      => null,
                'created_at'      => $now,
                'updated_at'      => $now,
            ],
            [
                'title'           => 'IT Policy Update — Password Requirements',
                'body'            => 'As part of our security improvements, all employees must update their passwords to meet the new requirements: minimum 12 characters, one uppercase, one number, one special character. Deadline: 30 days from today.',
                'posted_by_name'  => 'IT Admin',
                'posted_by_email' => 'admin@finfinity.co.in',
                'is_pinned'       => false,
                'expires_at'      => null,
                'created_at'      => $now,
                'updated_at'      => $now,
            ],
            [
                'title'           => 'Office Closure — Public Holiday',
                'body'            => 'The office will be closed on the upcoming public holiday. Employees working from home should ensure they are reachable during core hours. The portal and all systems will remain accessible.',
                'posted_by_name'  => 'HR Team',
                'posted_by_email' => 'admin@finfinity.co.in',
                'is_pinned'       => false,
                'expires_at'      => null,
                'created_at'      => $now,
                'updated_at'      => $now,
            ],
        ]);
    }
}
