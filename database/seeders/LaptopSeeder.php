<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds laptop inventory and employee device assignments from the Excel files:
 *   - public/Synergenius Active Laptop list 24032026 1.xlsx
 *   - public/All Employees - Finfinity (8) 1.xlsx
 *
 * Run: php artisan db:seed --class=LaptopSeeder
 */
class LaptopSeeder extends Seeder
{
    // -------------------------------------------------------------------------
    // Raw data extracted from Excel (asset_no = Laptop Asset No from sheet)
    // -------------------------------------------------------------------------

    private array $laptops = [
        // asset_no, model, serial, location(office), city(employee city), monthly_rent, out_date, contract_end_note
        ['asset_no' => '538LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'GL1M0N2',   'location' => 'MUMBAI',     'city' => 'Gurgaon',    'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-11-30', 'contract_end_note' => null],
        ['asset_no' => '714LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'BGMDPH2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-11-30', 'contract_end_note' => null],
        ['asset_no' => '556LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'BQ3SJM2',   'location' => 'MUMBAI',     'city' => 'Ahmedabad',  'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-11-30', 'contract_end_note' => null],
        ['asset_no' => '541LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'JK4QBH2',   'location' => 'MUMBAI',     'city' => 'Kochi',      'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-11-30', 'contract_end_note' => null],
        ['asset_no' => '542LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '5GYFWD2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-11-30', 'contract_end_note' => null],
        ['asset_no' => '544LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '2TY7JM2',   'location' => 'BANGALORE',  'city' => 'Bangalore',  'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-01', 'contract_end_note' => null],
        ['asset_no' => '1202LAPCCS', 'model' => 'DELL LATITUDE 5480',     'serial' => '90JR3H2',   'location' => 'BANGALORE',  'city' => 'Bangalore',  'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-01', 'contract_end_note' => null],
        ['asset_no' => '546LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'DBWR3H2',   'location' => 'BANGALORE',  'city' => 'Bangalore',  'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-01', 'contract_end_note' => null],
        ['asset_no' => '547LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'BV6NNQ2',   'location' => 'DELHI',      'city' => 'Delhi',      'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-04', 'contract_end_note' => null],
        ['asset_no' => '548LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'DQS7SQ2',   'location' => 'DELHI',      'city' => 'Delhi',      'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-04', 'contract_end_note' => '2026-04-06'],
        ['asset_no' => '549LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '74M8MQ2',   'location' => 'DELHI',      'city' => 'Delhi',      'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-04', 'contract_end_note' => null],
        ['asset_no' => '550LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '3N3CFH2',   'location' => 'MUMBAI',     'city' => 'Nagpur',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-05', 'contract_end_note' => null],
        ['asset_no' => '551LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'GRJX5M2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-05', 'contract_end_note' => null],
        ['asset_no' => '557LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '90JR3H2',   'location' => 'MUMBAI',     'city' => 'Bilaspur',   'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-12', 'contract_end_note' => '2026-04-06'],
        ['asset_no' => '562LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '7JHPPL2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-14', 'contract_end_note' => null],
        ['asset_no' => '563LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '6LGKLH2',   'location' => 'MUMBAI',     'city' => null,         'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-14', 'contract_end_note' => 'CONTRACT END 563LAPCCS ON 10-11-25'],
        ['asset_no' => '592LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => 'BZ55SN2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2023-12-28', 'contract_end_note' => null],
        ['asset_no' => '620LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '5VV1MQ2',   'location' => 'GUJARAT',    'city' => 'Ahmedabad',  'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-02', 'contract_end_note' => null],
        ['asset_no' => '532LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '9F497S2',   'location' => 'MUMBAI',     'city' => null,         'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-02', 'contract_end_note' => 'CONTRACT END 532LAPCCS 16-10-2025'],
        ['asset_no' => '597LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '1VJR1N2',   'location' => 'MUMBAI',     'city' => null,         'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-12', 'contract_end_note' => 'CONTRACT END 597LAPCCS ON 30/01/2026'],
        ['asset_no' => '534LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => 'D6XXNQ2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-17', 'contract_end_note' => null],
        ['asset_no' => '619LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => 'J7MH0N2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-17', 'contract_end_note' => null],
        ['asset_no' => '628LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => 'GPY7SN2',   'location' => 'MUMBAI',     'city' => 'Pune',       'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-18', 'contract_end_note' => null],
        ['asset_no' => '646LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '1QCL2R2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-18', 'contract_end_note' => null],
        ['asset_no' => '647LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '86X40R2',   'location' => 'MUMBAI',     'city' => 'Gurgaon',    'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-18', 'contract_end_note' => null],
        ['asset_no' => '1196LAPCCS', 'model' => 'DELL LATITUDE 5490',     'serial' => '436WFH2',   'location' => 'BANGALORE',  'city' => 'Bangalore',  'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-18', 'contract_end_note' => null],
        ['asset_no' => '627LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => 'JHKW4Q2',   'location' => 'BANGALORE',  'city' => 'Bangalore',  'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-18', 'contract_end_note' => null],
        ['asset_no' => '615LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '6BT0KR2',   'location' => 'MUMBAI',     'city' => null,         'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-18', 'contract_end_note' => 'CONTRACT END 615LAPCCS 10-11-2025'],
        ['asset_no' => '612LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '3HHPST2',   'location' => 'PUNE',       'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-18', 'contract_end_note' => null],
        ['asset_no' => '603LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '957DJR2',   'location' => 'CHANDIGARH', 'city' => 'Chandigarh', 'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-18', 'contract_end_note' => null],
        ['asset_no' => '599LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '31YBNN2',   'location' => 'HYDERABAD',  'city' => 'Hyderabad',  'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-19', 'contract_end_note' => null],
        ['asset_no' => '613LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '8D5L0N2',   'location' => 'HYDERABAD',  'city' => 'Hyderabad',  'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-19', 'contract_end_note' => null],
        ['asset_no' => '614LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '89M1KR2',   'location' => 'HYDERABAD',  'city' => null,         'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-19', 'contract_end_note' => 'CONTRACT END 614LAPCCS 21-01-2026'],
        ['asset_no' => '621LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '95HKST2',   'location' => 'HYDERABAD',  'city' => null,         'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-19', 'contract_end_note' => 'CONTRACT END 621LAPCCS 21-01-2026'],
        ['asset_no' => '622LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => 'HXN32N2',   'location' => 'VAPI',       'city' => 'Kalyan',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-20', 'contract_end_note' => null],
        ['asset_no' => '668LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '9GRN4M2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-24', 'contract_end_note' => null],
        ['asset_no' => '669LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'BW6P4M2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-24', 'contract_end_note' => null],
        ['asset_no' => '670LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '8KTRBH2',   'location' => 'MUMBAI',     'city' => 'Kalyan',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-01-24', 'contract_end_note' => null],
        ['asset_no' => '611LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'FZN32N2',   'location' => 'VAPI',       'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-02-01', 'contract_end_note' => null],
        ['asset_no' => '704LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '',          'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-02-09', 'contract_end_note' => null],
        ['asset_no' => '778LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'GPQQPH2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-02-13', 'contract_end_note' => null],
        ['asset_no' => '111LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => 'HMVV8H2',   'location' => 'MUMBAI',     'city' => 'Kochi',      'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-02-13', 'contract_end_note' => null],
        ['asset_no' => '610LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '4S5SBH2',   'location' => 'MUMBAI',     'city' => 'Kochi',      'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-02-13', 'contract_end_note' => null],
        ['asset_no' => '624LAPCCS',  'model' => 'DELL LATITUDE 5480',     'serial' => '78RHSQ2',   'location' => 'CHANDIGARH', 'city' => 'Chandigarh', 'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2024-02-29', 'contract_end_note' => null],
        ['asset_no' => '148LAPCCS',  'model' => 'LENOVO T470S',           'serial' => '',          'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'RS.2,590/-', 'out_date' => '2024-03-27', 'contract_end_note' => null],
        ['asset_no' => '159LAPCCS',  'model' => 'LENOVO T460S',           'serial' => 'PC0T8X5X',  'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'RS.2,590/-', 'out_date' => '2024-03-27', 'contract_end_note' => null],
        ['asset_no' => '434LAPCCS',  'model' => 'DELL LATITUDE 7250',     'serial' => '',          'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'RS.1,350/-', 'out_date' => '2024-04-05', 'contract_end_note' => null],
        ['asset_no' => '500LAPCCS',  'model' => 'DELL LATITUDE E7470',    'serial' => '28GLZF2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'RS.1,450/-', 'out_date' => '2024-04-05', 'contract_end_note' => null],
        ['asset_no' => '554LAPCCS',  'model' => 'DELL LATITUDE E5480',    'serial' => '4TFY0N2',   'location' => 'MUMBAI',     'city' => 'Gurgaon',    'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-01-17', 'contract_end_note' => null],
        ['asset_no' => '655LAPCCS',  'model' => 'DELL LATITUDE E5480',    'serial' => '9GRB0N2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-01-17', 'contract_end_note' => null],
        ['asset_no' => '658LAPCCS',  'model' => 'DELL LATITUDE E5480',    'serial' => '64SN4M2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-01-17', 'contract_end_note' => null],
        ['asset_no' => '701LAPCCS',  'model' => 'DELL LATITUDE E5480',    'serial' => 'GFCQJM2',   'location' => 'MUMBAI',     'city' => 'Chennai',    'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-01-17', 'contract_end_note' => null],
        ['asset_no' => '720LAPCCS',  'model' => 'DELL LATITUDE E5480',    'serial' => 'BNL1WT2',   'location' => 'MUMBAI',     'city' => 'Gurgaon',    'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-01-17', 'contract_end_note' => null],
        ['asset_no' => '568LAPCCS',  'model' => 'DELL LATITUDE E5480',    'serial' => '3G2FGH2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-01-17', 'contract_end_note' => null],
        ['asset_no' => '653LAPCCS',  'model' => 'DELL LATITUDE 5490',     'serial' => '9GRB0N2',   'location' => 'JALANDHAR',  'city' => 'Jalandhar',  'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-02-10', 'contract_end_note' => null],
        ['asset_no' => '576LAPCCS',  'model' => 'DELL LATITUDE E5480',    'serial' => '88BS6S2',   'location' => 'VIJAYAWADA', 'city' => 'Vijayawada', 'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-02-13', 'contract_end_note' => null],
        ['asset_no' => '1612LAPCCS', 'model' => 'DELL LATITUDE E5480',    'serial' => '47R7QV2',   'location' => 'VIJAYAWADA', 'city' => 'Vijayawada', 'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-02-13', 'contract_end_note' => null],
        ['asset_no' => '693LAPCCS',  'model' => 'DELL LATITUDE E5480',    'serial' => 'JH2W3M2',   'location' => 'RAIPUR',     'city' => null,         'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-04-04', 'contract_end_note' => 'CONTRACT END 693LAPCCS 10-11-2025'],
        ['asset_no' => '724LAPCCS',  'model' => 'DELL LATITUDE E5480',    'serial' => 'BM82KR2',   'location' => 'RAIPUR',     'city' => null,         'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-04-04', 'contract_end_note' => 'CONTRACT END 724LAPCCS 10-11-2025'],
        ['asset_no' => '1172LAPCCS', 'model' => 'DELL LATITUDE 3400',     'serial' => '7N6HQT2',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-04-17', 'contract_end_note' => null],
        ['asset_no' => '1183LAPCCS', 'model' => 'DELL LATITUDE 3400',     'serial' => 'G128003',   'location' => 'MUMBAI',     'city' => 'Mumbai',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-04-17', 'contract_end_note' => null],
        ['asset_no' => '1195LAPCCS', 'model' => 'DELL LATITUDE 3400',     'serial' => '2341JT2',   'location' => 'MUMBAI',     'city' => 'Kalyan',     'monthly_rent' => 'Rs.1,450/-', 'out_date' => '2025-04-17', 'contract_end_note' => null],
        ['asset_no' => '1213LAPCCS', 'model' => 'LENOVO X390 THINKPAD',   'serial' => 'PC1G87P5',  'location' => 'INDORE',     'city' => 'Ahmedabad',  'monthly_rent' => 'Rs.1,290/-', 'out_date' => '2025-05-13', 'contract_end_note' => null],
        ['asset_no' => '918LAPCCS',  'model' => 'LENOVO X390 THINKPAD',   'serial' => 'PC1G875Y',  'location' => 'INDORE',     'city' => 'Ahmedabad',  'monthly_rent' => 'Rs.1,290/-', 'out_date' => '2025-05-13', 'contract_end_note' => null],
        ['asset_no' => '1209LAPCCS', 'model' => 'LENOVO X390 THINKPAD',   'serial' => 'PC19AV42',  'location' => 'CHANDIGARH', 'city' => 'Chandigarh', 'monthly_rent' => 'Rs.1,290/-', 'out_date' => '2025-05-14', 'contract_end_note' => null],
        ['asset_no' => '1210LAPCCS', 'model' => 'LENOVO X390 THINKPAD',   'serial' => 'PC1G89F6',  'location' => 'CHANDIGARH', 'city' => 'Chandigarh', 'monthly_rent' => 'Rs.1,290/-', 'out_date' => '2025-05-14', 'contract_end_note' => null],
        ['asset_no' => '1204LAPCCS', 'model' => 'LENOVO X390 THINKPAD',   'serial' => 'PC1G86K2',  'location' => 'BANGALORE',  'city' => 'Bangalore',  'monthly_rent' => 'Rs.1,290/-', 'out_date' => '2025-06-10', 'contract_end_note' => null],
        ['asset_no' => '916LAPCCS',  'model' => 'LENOVO X390 THINKPAD',   'serial' => 'PC19ATWY',  'location' => 'CHENNAI',    'city' => 'Chennai',    'monthly_rent' => 'Rs.1,290/-', 'out_date' => '2025-10-29', 'contract_end_note' => null],
        ['asset_no' => '1205LAPCCS', 'model' => 'LENOVO X390 THINKPAD',   'serial' => 'PC1G84MV',  'location' => 'BANGALORE',  'city' => 'Bangalore',  'monthly_rent' => 'Rs.1,290/-', 'out_date' => '2025-08-05', 'contract_end_note' => null],
    ];

    // Asset tags that are spare / returned (no active allocation)
    private array $spareAssets = [
        '541LAPCCS', '542LAPCCS', '548LAPCCS', '557LAPCCS', '563LAPCCS',
        '532LAPCCS', '597LAPCCS', '615LAPCCS', '614LAPCCS', '621LAPCCS',
        '670LAPCCS', '1183LAPCCS', '693LAPCCS', '724LAPCCS',
    ];

    // Employee data with their device assignments (from employee Excel)
    private array $employees = [
        ['employee_number' => 'SGPL00002', 'name' => 'Pradeep Chauhan',             'email' => 'pradeep@finfinity.co.in',           'title' => 'Managing Director',                    'location' => 'Mumbai',      'device_type' => 'BYOD',             'asset_tag' => null],
        ['employee_number' => 'SGPL00003', 'name' => 'Nisha Chauhan',               'email' => 'nisha@finfinity.co.in',             'title' => 'Executive Director',                   'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '434LAPCCS'],
        ['employee_number' => 'SGPL00005', 'name' => 'Mohit Jain',                  'email' => 'mohit@finfinity.co.in',             'title' => 'CFO',                                  'location' => 'Mumbai',      'device_type' => 'Finfinity Owned',  'asset_tag' => null, 'personal_device' => 'Lenovo'],
        ['employee_number' => 'SGPL00006', 'name' => 'Ranjith Das K',               'email' => 'ranjithdas@finfinity.co.in',        'title' => 'Director Sales',                       'location' => 'Bangalore',   'device_type' => 'Rented',           'asset_tag' => '1202LAPCCS'],
        ['employee_number' => 'SGPL00009', 'name' => 'Vijay Janardan Kadam',        'email' => 'vijay@finfinity.co.in',             'title' => 'Chief Digital & Technology Officer',   'location' => 'Mumbai',      'device_type' => 'BYOD',             'asset_tag' => null],
        ['employee_number' => 'SGPL00014', 'name' => 'Sahil Malik',                 'email' => 'sahil@finfinity.co.in',             'title' => 'Zonal Head',                           'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '714LAPCCS'],
        ['employee_number' => 'SGPL00015', 'name' => 'Anirudh Gupta',               'email' => 'anirudh@finfinity.co.in',           'title' => 'Head Digital Platform',                'location' => 'Mumbai',      'device_type' => 'Finfinity Owned',  'asset_tag' => null, 'personal_device' => 'HP'],
        ['employee_number' => 'SGPL00021', 'name' => 'Sakalesh Kumar S',            'email' => 'sakalesh@finfinity.co.in',          'title' => 'Sales Head',                           'location' => 'Bangalore',   'device_type' => 'Rented',           'asset_tag' => '546LAPCCS'],
        ['employee_number' => 'SGPL00023', 'name' => 'Okesh Shashikumar Badhiye',   'email' => 'okesh@finfinity.co.in',             'title' => 'Head Technical Engineering',           'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '159LAPCCS'],
        ['employee_number' => 'SGPL00024', 'name' => 'Girish K',                    'email' => 'girish@finfinity.co.in',            'title' => 'Territory Manager',                    'location' => 'Bangalore',   'device_type' => 'Rented',           'asset_tag' => '1196LAPCCS'],
        ['employee_number' => 'SGPL00028', 'name' => 'Mullkallapally Rajesh',       'email' => 'mrajesh@finfinity.co.in',           'title' => 'Sales Head',                           'location' => 'Hyderabad',   'device_type' => 'Rented',           'asset_tag' => '599LAPCCS'],
        ['employee_number' => 'SGPL00030', 'name' => 'Ankur Sood',                  'email' => 'ankur.sood@finfinity.co.in',        'title' => 'Zonal Head',                           'location' => 'Chandigarh',  'device_type' => 'Rented',           'asset_tag' => '330LAPCCS'],
        ['employee_number' => 'SGPL00031', 'name' => 'Antony James',                'email' => 'antony@finfinity.co.in',            'title' => 'Sales Head',                           'location' => 'Bangalore',   'device_type' => 'Rented',           'asset_tag' => '627LAPCCS'],
        ['employee_number' => 'SGPL00037', 'name' => 'Veer Singh',                  'email' => 'veer.singh@finfinity.co.in',        'title' => 'Territory Manager',                    'location' => 'Chandigarh',  'device_type' => 'Rented',           'asset_tag' => '603LAPCCS'],
        ['employee_number' => 'SGPL00038', 'name' => 'Rajat Kagda',                 'email' => 'rajat.kagda@finfinity.co.in',       'title' => 'Sales Manager',                        'location' => 'Chandigarh',  'device_type' => 'NA',               'asset_tag' => null],
        ['employee_number' => 'SGPL00042', 'name' => 'Nimesh Vasantlal Shah',       'email' => 'nimesh.shah@finfinity.co.in',       'title' => 'City Head',                            'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '612LAPCCS'],
        ['employee_number' => 'SGPL00046', 'name' => 'Jagpal Singh',                'email' => 'jagpal.singh@finfinity.co.in',      'title' => 'Sales Manager',                        'location' => 'Chandigarh',  'device_type' => 'NA',               'asset_tag' => null],
        ['employee_number' => 'SGPL00048', 'name' => 'Peda Srinivas Srinivas',      'email' => 'peda.srinivas@finfinity.co.in',     'title' => 'Sales Manager',                        'location' => 'Hyderabad',   'device_type' => 'Rented',           'asset_tag' => '613LAPCCS'],
        ['employee_number' => 'SGPL00051', 'name' => 'Abhinav Joshi',               'email' => 'abhinav.joshi@finfinity.co.in',     'title' => 'Sales Manager',                        'location' => 'Chandigarh',  'device_type' => 'NA',               'asset_tag' => null],
        ['employee_number' => 'SGPL00054', 'name' => 'Makarand Tukaram Pawar',      'email' => 'makarand.pawar@finfinity.co.in',    'title' => 'Account Executive',                    'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '534LAPCCS'],
        ['employee_number' => 'SGPL00055', 'name' => 'Harshali Gajanan Save',       'email' => 'harshali.save@finfinity.co.in',     'title' => 'Lead Finance & Strategy',              'location' => 'Mumbai',      'device_type' => 'Finfinity Owned',  'asset_tag' => null, 'personal_device' => 'Warner'],
        ['employee_number' => 'SGPL00059', 'name' => 'Niraj Pravin Shah',           'email' => 'niraj.shah@finfinity.co.in',        'title' => 'City Head',                            'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '646LAPCCS'],
        ['employee_number' => 'SGPL00062', 'name' => 'Sanvi Darshan Bhagat',        'email' => 'sanvi.bhagat@finfinity.co.in',      'title' => 'Corporate Relationship Manager',       'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '668LAPCCS'],
        ['employee_number' => 'SGPL00068', 'name' => 'Geetika Raina',               'email' => 'geetika.raina@finfinity.co.in',     'title' => 'Head Digital Alliances & Partnership', 'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '551LAPCCS'],
        ['employee_number' => 'SGPL00074', 'name' => 'Shalini Nitin Bhadoria',      'email' => 'shalini.bhadoria@finfinity.co.in',  'title' => 'City Head',                            'location' => 'Mumbai',      'device_type' => 'Finfinity Owned',  'asset_tag' => null, 'personal_device' => 'Warner'],
        ['employee_number' => 'SGPL00077', 'name' => 'Vikas Choudhary',             'email' => 'vikas.choudhary@finfinity.co.in',   'title' => 'Insurance Sales Head',                 'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '592LAPCCS'],
        ['employee_number' => 'SGPL00081', 'name' => 'Devanshi Shailesh Chabhadia', 'email' => 'devanshi.chabhadia@finfinity.co.in','title' => 'Lead People & Infra Management',       'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '778LAPCCS'],
        ['employee_number' => 'SGPL00083', 'name' => 'Janu John',                   'email' => 'jenu.john@finfinity.co.in',         'title' => 'Sales Head',                           'location' => 'Kochi',       'device_type' => 'Rented',           'asset_tag' => '111LAPCCS'],
        ['employee_number' => 'SGPL00085', 'name' => 'Akhilesh K P',                'email' => 'akhilesh.kp@finfinity.co.in',       'title' => 'Sales Manager',                        'location' => 'Kochi',       'device_type' => 'Rented',           'asset_tag' => '610LAPCCS'],
        ['employee_number' => 'SGPL00087', 'name' => 'Sparsh Gupta',                'email' => 'sparsh.gupta@finfinity.co.in',      'title' => 'Head Digital Product',                 'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '500LAPCCS'],
        ['employee_number' => 'SGPL00090', 'name' => 'Radhika Nimishh Dalal',       'email' => 'radhika.dalal@finfinity.co.in',     'title' => 'Analytics-IT',                         'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '148LAPCCS'],
        ['employee_number' => 'SGPL00100', 'name' => 'Harsha Prasad R',             'email' => 'harshaprasad.r@finfinity.co.in',    'title' => 'City Head',                            'location' => 'Bangalore',   'device_type' => 'Rented',           'asset_tag' => '544LAPCCS'],
        ['employee_number' => 'SGPL00101', 'name' => 'Sunil Pandey',                'email' => 'sunil.pandey@finfinity.co.in',      'title' => 'Sales Head',                           'location' => 'Gurgaon',     'device_type' => 'Rented',           'asset_tag' => '647LAPCCS'],
        ['employee_number' => 'SGPL00103', 'name' => 'Sheet Choudhary',             'email' => 'sheet.choudhary@finfinity.co.in',   'title' => 'Sales Manager',                        'location' => 'Gurgaon',     'device_type' => 'Rented',           'asset_tag' => '538LAPCCS'],
        ['employee_number' => 'SGPL00109', 'name' => 'Amitesh Tripathi',            'email' => 'amitesh.tripathi@finfinity.co.in',  'title' => 'Director Sales',                       'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '704LAPCCS'],
        ['employee_number' => 'SGPL00114', 'name' => 'Paresh Shanbhag',             'email' => 'paresh.shanbhag@finfinity.co.in',   'title' => 'Sales Head',                           'location' => 'Pune',        'device_type' => 'Rented',           'asset_tag' => '628LAPCCS'],
        ['employee_number' => 'SGPL00118', 'name' => 'Kasim Chand Patel',           'email' => 'kasim.patel@finfinity.co.in',       'title' => 'Corporate Relationship Manager',       'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '611LAPCCS'],
        ['employee_number' => 'SGPL00119', 'name' => 'Meghana S',                   'email' => 'meghana.s@finfinity.co.in',         'title' => 'Sales Co-ordinator',                   'location' => 'Bangalore',   'device_type' => 'Rented',           'asset_tag' => '1204LAPCCS'],
        ['employee_number' => 'SGPL00120', 'name' => 'Nagurvali Shaik',             'email' => 'nagurvali.shaik@finfinity.co.in',   'title' => 'City Head',                            'location' => 'Vijayawada',  'device_type' => 'Rented',           'asset_tag' => '576LAPCCS'],
        ['employee_number' => 'SGPL00121', 'name' => 'Don S',                       'email' => 'don.s@finfinity.co.in',             'title' => 'Territory Manager',                    'location' => 'Kochi',       'device_type' => 'BYOD',             'asset_tag' => null],
        ['employee_number' => 'SGPL00122', 'name' => 'Abhinav Bhardwaj',            'email' => 'abhinav.bhardwaj@finfinity.co.in',  'title' => 'Territory Manager',                    'location' => 'Delhi',       'device_type' => 'BYOD',             'asset_tag' => null],
        ['employee_number' => 'SGPL00128', 'name' => 'SUMESH RAMACHANDRAN',         'email' => 'sumesh.r@finfinity.co.in',          'title' => 'Territory Manager',                    'location' => 'Kochi',       'device_type' => 'BYOD',             'asset_tag' => null],
        ['employee_number' => 'SGPL00129', 'name' => 'Shivani Gupta',               'email' => 'shivani.gupta@finfinity.co.in',     'title' => 'Sales Manager',                        'location' => 'Delhi',       'device_type' => 'Rented',           'asset_tag' => '547LAPCCS'],
        ['employee_number' => 'SGPL00131', 'name' => 'Rohit Gupta',                 'email' => 'rohit.gupta@finfinity.co.in',       'title' => 'Sales Manager',                        'location' => 'Delhi',       'device_type' => 'Rented',           'asset_tag' => '549LAPCCS'],
        ['employee_number' => 'SGPL00132', 'name' => 'Rohit Subhash Jadhav',        'email' => 'rohit.jadhav@finfinity.co.in',      'title' => 'Sales Manager',                        'location' => 'Pune',        'device_type' => 'NA',               'asset_tag' => null],
        ['employee_number' => 'SGPL00133', 'name' => 'Sahil Aalam',                 'email' => 'sahil.aalam@finfinity.co.in',       'title' => 'Sales Manager',                        'location' => 'Chandigarh',  'device_type' => 'Rented',           'asset_tag' => '653LAPCCS'],
        ['employee_number' => 'SGPL00135', 'name' => 'Rambaksh Giri',               'email' => 'rambaksh.giri@finfinity.co.in',     'title' => 'City Head',                            'location' => 'Kalyan',      'device_type' => 'Rented',           'asset_tag' => '622LAPCCS'],
        ['employee_number' => 'SGPL00139', 'name' => 'Milind Gawade',               'email' => 'milind.gawade@finfinity.co.in',     'title' => 'Sales Manager',                        'location' => 'Pune',        'device_type' => 'NA',               'asset_tag' => null],
        ['employee_number' => 'SGPL00140', 'name' => 'Gagandeep Kumar',             'email' => 'gagandeep.kumar@finfinity.co.in',   'title' => 'Territory Manager',                    'location' => 'Chandigarh',  'device_type' => 'Rented',           'asset_tag' => '1210LAPCCS'],
        ['employee_number' => 'SGPL00144', 'name' => 'Prashant Padwal',             'email' => 'prashant.padwal@finfinity.co.in',   'title' => 'City Head',                            'location' => 'Pune',        'device_type' => 'NA',               'asset_tag' => null],
        ['employee_number' => 'SGPL00145', 'name' => 'Hanisha chetan Fafadia',      'email' => 'hanisha.fafadia@finfinity.co.in',   'title' => 'Credit Analyst',                       'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '568LAPCCS'],
        ['employee_number' => 'SGPL00146', 'name' => 'Moulali Shaik',               'email' => 'moulali.shaik@finfinity.co.in',     'title' => 'Sales Manager',                        'location' => 'Vijayawada',  'device_type' => 'Rented',           'asset_tag' => '1612LAPCCS'],
        ['employee_number' => 'SGPL00148', 'name' => 'Giriraj Kishore Purohit',     'email' => 'giriraj.purohit@finfinity.co.in',   'title' => 'Sales Head',                           'location' => 'Ahmedabad',   'device_type' => 'Rented',           'asset_tag' => '918LAPCCS'],
        ['employee_number' => 'SGPL00150', 'name' => 'Kamlesh Ramchandra Shukla',   'email' => 'kamlesh.shukla@finfinity.co.in',    'title' => 'Sales Manager',                        'location' => 'Ahmedabad',   'device_type' => 'Rented',           'asset_tag' => '556LAPCCS'],
        ['employee_number' => 'SGPL00152', 'name' => 'Aakanksha Kiran Kshirsagar',  'email' => 'aakanksha.kshirsagar@finfinity.co.in', 'title' => 'Analytics-IT',                     'location' => 'Mumbai',      'device_type' => 'Finfinity Owned',  'asset_tag' => null, 'personal_device' => 'Warner'],
        ['employee_number' => 'SGPL00154', 'name' => 'Dhanraj Manohar Patil',       'email' => 'dhanraj.patil@finfinity.co.in',     'title' => 'City Head',                            'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '1172LAPCCS'],
        ['employee_number' => 'SGPL00156', 'name' => 'Sanjay Jaiswal',              'email' => 'sanjay.jaiswal@finfinity.co.in',    'title' => 'Sales Head',                           'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '669LAPCCS'],
        ['employee_number' => 'SGPL00157', 'name' => 'MANAS D S',                   'email' => 'manas.ds@finfinity.co.in',          'title' => 'Sales Manager',                        'location' => 'Bangalore',   'device_type' => 'NA',               'asset_tag' => null],
        ['employee_number' => 'SGPL00158', 'name' => 'Amara Rampal Bhagwane',       'email' => 'amara.bhagwane@finfinity.co.in',    'title' => 'Territory Manager',                    'location' => 'Kalyan',      'device_type' => 'Rented',           'asset_tag' => '1195LAPCCS'],
        ['employee_number' => 'SGPL00159', 'name' => 'Ravi Kumar Trivedi',          'email' => 'ravi.trivedi@finfinity.co.in',      'title' => 'Territory Manager',                    'location' => 'Ahmedabad',   'device_type' => 'Rented',           'asset_tag' => '1213LAPCCS'],
        ['employee_number' => 'SGPL00160', 'name' => 'Yukti Mathur',                'email' => 'yukti.mathur@finfinity.co.in',      'title' => 'Head - Marketing & Branding',          'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '655LAPCCS'],
        ['employee_number' => 'SGPL00161', 'name' => 'Arshan Irani',                'email' => 'arshan.irani@finfinity.co.in',      'title' => 'Analytics-IT',                         'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '619LAPCCS'],
        ['employee_number' => 'SGPL00162', 'name' => 'Esakki Raj S',                'email' => 'esakki.s@finfinity.co.in',          'title' => 'Sales Head',                           'location' => 'Chennai',     'device_type' => 'Rented',           'asset_tag' => '916LAPCCS'],
        ['employee_number' => 'SGPL00163', 'name' => 'Sanjeev Kumar',               'email' => 'sanjeev.kumar@finfinity.co.in',     'title' => 'Sales Manager',                        'location' => 'Gurgaon',     'device_type' => 'Rented',           'asset_tag' => '554LAPCCS'],
        ['employee_number' => 'SGPL00164', 'name' => 'Ashok Dubey',                 'email' => 'ashok.dubey@finfinity.co.in',       'title' => 'Corporate Relationship Manager',       'location' => 'Mumbai',      'device_type' => 'Rented',           'asset_tag' => '562LAPCCS'],
        ['employee_number' => 'SGPL00165', 'name' => 'Ankur Kamboj',                'email' => 'ankur.kamboj@finfinity.co.in',      'title' => 'Sales Manager',                        'location' => 'Gurgaon',     'device_type' => 'Rented',           'asset_tag' => '720LAPCCS'],
        ['employee_number' => 'SGPL00166', 'name' => 'Sarvesh Kumar S',             'email' => 'sarvesh.kumar@finfinity.co.in',     'title' => 'City Head',                            'location' => 'Bangalore',   'device_type' => 'Rented',           'asset_tag' => '1205LAPCCS'],
        ['employee_number' => 'SGPL00167', 'name' => 'Saaurabh R Pradhaan',         'email' => 'saaurabhr@finfinity.co.in',         'title' => 'Chief Operating Officer',              'location' => 'Mumbai',      'device_type' => 'BYOD',             'asset_tag' => null],
        ['employee_number' => 'SGPL00168', 'name' => 'Jitendra Thavarchand Doshi',  'email' => 'jitendra.doshi@finfinity.co.in',    'title' => 'Zonal Head',                           'location' => 'Ahmedabad',   'device_type' => 'Rented',           'asset_tag' => '620LAPCCS'],
        ['employee_number' => 'SGPL00169', 'name' => 'Mukesh Babu R S',             'email' => 'mukesh.babu@finfinity.co.in',       'title' => 'Sales Manager',                        'location' => 'Chennai',     'device_type' => 'Rented',           'asset_tag' => '701LAPCCS'],
        ['employee_number' => 'SGPL00170', 'name' => 'Mridul Pareek',               'email' => 'mridul.pareek@finfinity.co.in',     'title' => 'Territory Manager',                    'location' => 'Gurgaon',     'device_type' => 'NA',               'asset_tag' => null],
    ];

    public function run(): void
    {
        // 1. Ensure asset_type_master has Laptop
        if (!DB::table('asset_type_master')->where('type', 'Laptop')->exists()) {
            DB::table('asset_type_master')->insert([
                'type'       => 'Laptop',
                'keyword'    => 'LAP',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Collect unique locations and upsert into location_master
        $locations = array_unique(array_filter(array_column($this->laptops, 'location')));
        foreach ($locations as $loc) {
            if (!DB::table('location_master')->where('unique_location', $loc)->exists()) {
                DB::table('location_master')->insert([
                    'unique_location' => $loc,
                    'total_assets'    => 0,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
            }
        }

        // 3. Upsert asset_master — insert new, update existing with latest Excel data
        foreach ($this->laptops as $lap) {
            $isSpare = in_array($lap['asset_no'], $this->spareAssets);

            $location = $lap['location'] && DB::table('location_master')->where('unique_location', $lap['location'])->exists()
                ? $lap['location']
                : null;

            $exists = DB::table('asset_master')->where('tag', $lap['asset_no'])->exists();

            if ($exists) {
                DB::table('asset_master')->where('tag', $lap['asset_no'])->update([
                    'model'             => $lap['model'],
                    'serial_number'     => $lap['serial'] ?: null,
                    'location'          => $location,
                    'city'              => $lap['city'] ?? null,
                    'monthly_rent'      => $lap['monthly_rent'],
                    'out_date'          => $lap['out_date'] ?: null,
                    'contract_end_note' => $lap['contract_end_note'] ?? null,
                    'updated_at'        => now(),
                ]);
            } else {
                DB::table('asset_master')->insert([
                    'tag'               => $lap['asset_no'],
                    'type'              => 'Laptop',
                    'ownership'         => 'Rental',
                    'warranty'          => 'NA',
                    'serial_number'     => $lap['serial'] ?: null,
                    'model'             => $lap['model'],
                    'location'          => $location,
                    'city'              => $lap['city'] ?? null,
                    'status'            => $isSpare ? 'inactive' : 'active',
                    'monthly_rent'      => $lap['monthly_rent'],
                    'out_date'          => $lap['out_date'] ?: null,
                    'contract_end_note' => $lap['contract_end_note'] ?? null,
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]);
            }
        }

        // 4. Upsert employees from Excel (update existing, insert new)
        foreach ($this->employees as $emp) {
            $existing = DB::table('employees')->where('employee_email', $emp['email'])->first();
            if ($existing) {
                DB::table('employees')->where('employee_email', $emp['email'])->update([
                    'employee_number' => $emp['employee_number'],
                    'device_type'     => $emp['device_type'],
                    'personal_device' => $emp['personal_device'] ?? null,
                    'updated_at'      => now(),
                ]);
            } else {
                DB::table('employees')->insert([
                    'employee_number' => $emp['employee_number'],
                    'name'            => $emp['name'],
                    'employee_email'  => $emp['email'],
                    'job_title'       => $emp['title'],
                    'department'      => null,
                    'status'          => 'Active',
                    'device_type'     => $emp['device_type'],
                    'personal_device' => $emp['personal_device'] ?? null,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
            }
        }

        // 5. Create allocations in allocated_asset_master (skip existing active ones)
        foreach ($this->employees as $emp) {
            if (!$emp['asset_tag']) {
                continue;
            }
            // Skip if asset not in our inventory (seeder filtered some)
            if (!DB::table('asset_master')->where('tag', $emp['asset_tag'])->exists()) {
                continue;
            }
            // Skip if already has an active allocation
            $alreadyAllocated = DB::table('allocated_asset_master')
                ->where('asset_tag', $emp['asset_tag'])
                ->where('status', 'active')
                ->exists();
            if ($alreadyAllocated) {
                continue;
            }

            DB::table('allocated_asset_master')->insert([
                'asset_tag'  => $emp['asset_tag'],
                'user_email' => $emp['email'],
                'assign_on'  => now(),
                'status'     => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('LaptopSeeder: imported ' . count($this->laptops) . ' laptops and ' . count($this->employees) . ' employees.');
    }
}
