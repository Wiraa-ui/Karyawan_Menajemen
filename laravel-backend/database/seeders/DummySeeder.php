<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Unit;
use App\Models\Jabatan;
use App\Models\Karyawan;
use App\Models\Login;

class DummySeeder extends Seeder
{
    public function run()
    {
        DB::statement("SET FOREIGN_KEY_CHECKS=0");
        Login::truncate();
        Karyawan::truncate();
        Jabatan::truncate();
        Unit::truncate();
        DB::table('jabatan_karyawan')->truncate();
        DB::statement("SET FOREIGN_KEY_CHECKS=1");

        // Buat daftar unit dan jabatan
        $units = ['Manajemen', 'Keuangan', 'Gudang', 'Penjualan', 'Logistik', 'Keamanan', 'Pemasaran', 'SDM', 'Operasional', 'Pembelian'];
        $jabatans = ['Store Manager', 'Supervisor', 'Accountant', 'Kasir', 'Staf Gudang', 'Sales', 'Customer Service', 'Driver', 'Security', 'HRD'];

        foreach ($units as $unit) {
            Unit::create(['nama' => $unit]);
        }
        foreach ($jabatans as $jabatan) {
            Jabatan::create(['nama' => $jabatan]);
        }

        $unitIds = Unit::pluck('id')->toArray();
        $jabatanIds = Jabatan::pluck('id')->toArray();

        // Nama-nama karyawan
        $names = [
            'Budi Santoso', 'Siti Rahayu', 'Ahmad Hidayat', 'Dewi Lestari', 'Rudi Hermawan',
            'Ani Wijaya', 'Joko Susilo', 'Rina Puspita', 'Agus Setiawan', 'Maya Indah',
        ];

        $karyawanIds = [];

        foreach ($names as $index => $name) {
            $karyawan = Karyawan::create([
                'nama' => $name,
                'username' => strtolower(explode(' ', $name)[0]) . $index,
                'password' => 'admin123',
                'unit_id' => $unitIds[array_rand($unitIds)],
                'tanggal_bergabung' => now()->subMonths(rand(1, 24))->format('Y-m-d')
            ]);

            // Hubungkan jabatan secara acak
            $jabatanId = $jabatanIds[array_rand($jabatanIds)];
            $karyawan->jabatans()->attach($jabatanId);

            $karyawanIds[] = $karyawan->id;
        }

        // Buat 200 login random dari 10 karyawan
        for ($i = 0; $i < 200; $i++) {
            Login::create([
                'karyawan_id' => $karyawanIds[array_rand($karyawanIds)],
                'waktu_login' => now()
                    ->subDays(rand(0, 30))
                    ->subHours(rand(0, 23))
                    ->subMinutes(rand(0, 59))
            ]);
        }

        $this->command->info('Seeder selesai: 10 karyawan dengan login acak (200 data).');
    }
}
