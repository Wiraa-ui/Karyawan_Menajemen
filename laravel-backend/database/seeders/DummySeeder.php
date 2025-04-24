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

        // Relasi unit dan jabatan yang logis
        $unitJabatanMap = [
            'Manajemen' => ['Store Manager', 'Supervisor'],
            'Keuangan' => ['Accountant'],
            'Gudang' => ['Staf Gudang', 'Supervisor'],
            'Penjualan' => ['Sales', 'Kasir'],
            'Logistik' => ['Driver'],
            'Keamanan' => ['Security'],
            'Pemasaran' => ['Customer Service'],
            'SDM' => ['HRD'],
            'Operasional' => ['Supervisor'],
            'Pembelian' => ['Supervisor'],
        ];

        $unitIds = [];
        $jabatanIds = [];

        foreach ($unitJabatanMap as $unit => $jabatans) {
            $unitModel = Unit::create(['nama' => $unit]);
            $unitIds[$unit] = $unitModel->id;

            foreach ($jabatans as $jabatan) {
                if (!array_key_exists($jabatan, $jabatanIds)) {
                    $jabatanModel = Jabatan::create(['nama' => $jabatan]);
                    $jabatanIds[$jabatan] = $jabatanModel->id;
                }
            }
        }

        $names = [
            'Budi Santoso', 'Siti Rahayu', 'Ahmad Hidayat', 'Dewi Lestari', 'Rudi Hermawan',
            'Ani Wijaya', 'Joko Susilo', 'Rina Puspita', 'Agus Setiawan', 'Maya Indah',
        ];

        $karyawanIds = [];

        foreach ($names as $index => $name) {
            $unitName = array_rand($unitJabatanMap); // Acak unit
            $unitId = $unitIds[$unitName];

            $karyawan = Karyawan::create([
                'nama' => $name,
                'username' => strtolower(explode(' ', $name)[0]) . $index,
                'password' => 'admin123',
                'unit_id' => $unitId,
                'tanggal_bergabung' => now()->subMonths(rand(1, 24))->format('Y-m-d'),
            ]);

            // Ambil jabatan yang relevan dari unit yang sama
            $jabatanNama = $unitJabatanMap[$unitName][array_rand($unitJabatanMap[$unitName])];
            $jabatanId = $jabatanIds[$jabatanNama];
            $karyawan->jabatans()->attach($jabatanId);

            $karyawanIds[] = $karyawan->id;
        }

        // 200 login acak dari 10 karyawan
        for ($i = 0; $i < 200; $i++) {
            Login::create([
                'karyawan_id' => $karyawanIds[array_rand($karyawanIds)],
                'waktu_login' => now()
                    ->subDays(rand(0, 30))
                    ->subHours(rand(0, 23))
                    ->subMinutes(rand(0, 59))
            ]);
        }

        $this->command->info('Seeder selesai dijalankan.');
    }
}
