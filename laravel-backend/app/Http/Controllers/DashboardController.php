<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Karyawan;
use App\Models\Unit;
use App\Models\Jabatan;
use App\Models\Login;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Get date range filter if provided
            $startDate = $request->input('from_date');
            $endDate = $request->input('to_date');

            // Query builder for login data with date filtering
            $loginQuery = Login::query();
            
            if ($startDate) {
                $loginQuery->where('created_at', '>=', $startDate . ' 00:00:00');
            }
            
            if ($endDate) {
                $loginQuery->where('created_at', '<=', $endDate . ' 23:59:59');
            }

            // Get counts
            $totalKaryawan = Karyawan::count();
            $totalLogin = Login::count();
            $totalUnit = Unit::count();
            $totalJabatan = Jabatan::count();

            // Get top 10 users by login count
            $topUsers = DB::table('logins')
                ->select('karyawan_id', DB::raw('count(*) as login_count'))
                ->groupBy('karyawan_id')
                ->having('login_count', '>', 25)
                ->orderBy('login_count', 'desc')
                ->limit(10)
                ->get();

            // Get karyawan details for top users
            $topUsersWithDetails = [];
            foreach ($topUsers as $user) {
                $karyawan = Karyawan::with('unit')->find($user->karyawan_id);
                if ($karyawan) {
                    // Get jabatan names for this karyawan
                    $jabatanNames = '';
                    if (method_exists($karyawan, 'jabatans')) {
                        $jabatans = $karyawan->jabatans;
                        if ($jabatans && count($jabatans) > 0) {
                            $jabatanNames = $jabatans->pluck('nama')->implode(', ');
                        }
                    }
                    
                    $topUsersWithDetails[] = [
                        'id' => $karyawan->id,
                        'nama' => $karyawan->nama,
                        'unit' => $karyawan->unit,
                        'jabatan' => $jabatanNames ?: '-',
                        'login_count' => $user->login_count
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'total_karyawan' => $totalKaryawan,
                'total_login' => $totalLogin,
                'total_unit' => $totalUnit,
                'total_jabatan' => $totalJabatan,
                'top_users' => $topUsersWithDetails
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}
