<?php

namespace App\Http\Controllers;

use App\Models\Karyawan;
use App\Models\Unit;
use App\Models\Jabatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB; // Import DB facade

class RegisterController extends Controller
{
    /**
     * Handle a registration request for the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                "nama" => "required|string|max:255",
                "email" => "required|string|email|max:255|unique:karyawans",
                "username" => "required|string|max:255|unique:karyawans",
                "password" => "required|string|min:6|confirmed", // Add password confirmation
                "unit_id" => "required|exists:units,id",
                "tanggal_bergabung" => "required|date", // Assuming this is still required for registration
                "jabatans" => "required|array|min:1|max:2",
                "jabatans.*" => "exists:jabatans,id",
            ]);

            if ($validator->fails()) {
                return response()->json(["success" => false, "message" => "Validation failed", "errors" => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $karyawan = Karyawan::create([
                "nama" => $request->nama,
                "email" => $request->email,
                "username" => $request->username,
                "password" => Hash::make($request->password),
                "unit_id" => $request->unit_id,
                "tanggal_bergabung" => $request->tanggal_bergabung,
            ]);

            // Attach jabatans
            $karyawan->jabatans()->attach($request->jabatans);

            DB::commit();

            // Optionally log the user in immediately after registration
            // $token = Auth::guard("api")->login($karyawan);
            // return $this->respondWithCookie($token); // Assuming respondWithCookie exists in AuthController or here

            return response()->json(["success" => true, "message" => "Registration successful", "data" => $karyawan->load(["unit", "jabatans"])], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Registration error: " . $e->getMessage());
            return response()->json(["success" => false, "message" => "Registration failed: " . $e->getMessage()], 500);
        }
    }

    // Helper function to get Units and Jabatans for the registration form
    public function getFormData()
    {
        try {
            $units = Unit::select("id", "nama")->get();
            $jabatans = Jabatan::select("id", "nama")->get();
            return response()->json([
                "success" => true,
                "data" => [
                    "units" => $units,
                    "jabatans" => $jabatans,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching registration form data: " . $e->getMessage());
            return response()->json(["success" => false, "message" => "Failed to load form data"], 500);
        }
    }
}

