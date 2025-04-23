<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Unit;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class UnitController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $units = Unit::all();
            return response()->json([
                'success' => true,
                'data' => $units
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching units: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data unit'
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
                'nama' => 'required|string|max:255|unique:units'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            $unit = Unit::create([
                'nama' => $request->nama
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Unit berhasil ditambahkan',
                'data' => $unit
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating unit: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan unit'
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
            $unit = Unit::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $unit
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching unit: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unit tidak ditemukan'
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
                'nama' => 'required|string|max:255|unique:units,nama,' . $id
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            $unit = Unit::findOrFail($id);
            $unit->update([
                'nama' => $request->nama
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Unit berhasil diperbarui',
                'data' => $unit
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating unit: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui unit'
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
            $unit = Unit::findOrFail($id);
            
            // Check if unit is being used by any karyawan
            if ($unit->karyawans()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unit tidak dapat dihapus karena sedang digunakan oleh karyawan'
                ], 422);
            }
            
            $unit->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Unit berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting unit: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus unit'
            ], 500);
        }
    }
}
