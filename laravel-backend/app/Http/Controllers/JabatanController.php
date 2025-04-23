<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Jabatan;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class JabatanController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $jabatans = Jabatan::all();
            return response()->json([
                'success' => true,
                'data' => $jabatans
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching jabatans: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data jabatan'
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
                'nama' => 'required|string|max:255|unique:jabatans'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            $jabatan = Jabatan::create([
                'nama' => $request->nama
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Jabatan berhasil ditambahkan',
                'data' => $jabatan
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating jabatan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan jabatan'
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
            $jabatan = Jabatan::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $jabatan
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching jabatan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Jabatan tidak ditemukan'
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
                'nama' => 'required|string|max:255|unique:jabatans,nama,' . $id
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            $jabatan = Jabatan::findOrFail($id);
            $jabatan->update([
                'nama' => $request->nama
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Jabatan berhasil diperbarui',
                'data' => $jabatan
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating jabatan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui jabatan'
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
            $jabatan = Jabatan::findOrFail($id);
            
            // Check if jabatan is being used by any karyawan
            if ($jabatan->karyawans()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jabatan tidak dapat dihapus karena sedang digunakan oleh karyawan'
                ], 422);
            }
            
            $jabatan->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Jabatan berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting jabatan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus jabatan'
            ], 500);
        }
    }
}
