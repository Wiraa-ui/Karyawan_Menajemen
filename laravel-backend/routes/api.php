<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KaryawanController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\JabatanController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Berikut adalah endpoint API untuk aplikasi manajemen karyawan
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes dengan Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Karyawan routes
    Route::apiResource('karyawans', KaryawanController::class)->except(['create', 'edit']);
    
    // Unit routes
    Route::apiResource('units', UnitController::class)->except(['create', 'edit']);
    
    // Jabatan routes
    Route::apiResource('jabatans', JabatanController::class)->except(['create', 'edit']);
    
    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'index']);
});