<?php

namespace App\Http\Controllers;

use App\Models\Karyawan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'username' => 'required',
                'password' => 'required'
            ]);

            // Cari karyawan berdasarkan username
            $user = Karyawan::where('username', $request->username)->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Username tidak ditemukan'
                ], 401);
            }

            // Verifikasi password tanpa enkripsi (plain text)
            if (trim($request->password) !== trim($user->password)) {
                return response()->json([
                    'message' => 'Password salah'
                ], 401);
            }

            // Jika berhasil, buat token
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Catat login
            $user->logins()->create([
                'waktu_login' => now()
            ]);

            return response()->json([
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'username' => $user->username
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan pada server: ' . $e->getMessage()
            ], 500);
        }
    }
}
