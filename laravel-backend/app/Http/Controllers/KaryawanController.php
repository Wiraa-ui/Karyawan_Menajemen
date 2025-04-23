<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Karyawan;
use App\Models\Unit;
use App\Models\Jabatan;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class KaryawanController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $karyawans = Karyawan::with(['unit', 'jabatans'])->get();
            return response()->json([
                'success' => true,
                'data' => $karyawans
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching karyawans: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data karyawan'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nama' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:karyawans',
                'password' => 'required|string|min:6',
                'unit_id' => 'required|exists:units,id',
                'tanggal_bergabung' => 'required|date',
                'jabatans' => 'required|array|min:1|max:2',
                'jabatans.*' => 'exists:jabatans,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            DB::beginTransaction();

            $karyawan = Karyawan::create([
                'nama' => $request->nama,
                'username' => $request->username,
                'password' => $request->password, // Not hashed as per requirements
                'unit_id' => $request->unit_id,
                'tanggal_bergabung' => $request->tanggal_bergabung
            ]);

            // Attach jabatans
            $karyawan->jabatans()->attach($request->jabatans);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Karyawan berhasil ditambahkan',
                'data' => $karyawan->load(['unit', 'jabatans'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating karyawan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan karyawan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $karyawan = Karyawan::with(['unit', 'jabatans'])->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $karyawan
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching karyawan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Karyawan tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nama' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:karyawans,username,' . $id,
                'password' => 'nullable|string|min:6',
                'unit_id' => 'required|exists:units,id',
                'tanggal_bergabung' => 'required|date',
                'jabatans' => 'required|array|min:1|max:2',
                'jabatans.*' => 'exists:jabatans,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            DB::beginTransaction();

            $karyawan = Karyawan::findOrFail($id);
            
            $updateData = [
                'nama' => $request->nama,
                'username' => $request->username,
                'unit_id' => $request->unit_id,
                'tanggal_bergabung' => $request->tanggal_bergabung
            ];
            
            // Only update password if provided
            if ($request->filled('password')) {
                $updateData['password'] = $request->password; // Not hashed as per requirements
            }
            
            $karyawan->update($updateData);

            // Sync jabatans
            $karyawan->jabatans()->sync($request->jabatans);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Karyawan berhasil diperbarui',
                'data' => $karyawan->fresh(['unit', 'jabatans'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating karyawan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui karyawan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();
            
            $karyawan = Karyawan::findOrFail($id);
            
            // Detach all jabatans
            $karyawan->jabatans()->detach();
            
            // Delete the karyawan
            $karyawan->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Karyawan berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting karyawan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus karyawan: ' . $e->getMessage()
            ], 500);
        }
    }
}
