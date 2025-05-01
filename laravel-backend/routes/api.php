<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegisterController; // Import RegisterController
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
Route::post("/register", [RegisterController::class, "register"]);
Route::get("/register/form-data", [RegisterController::class, "getFormData"]); // Route to get form data
Route::post("/login", [AuthController::class, "login"]);

// Protected routes with JWT (auth:api)
Route::middleware("auth:api")->group(function () {
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::post("/refresh", [AuthController::class, "refresh"]);
    Route::get("/me", [AuthController::class, "me"]);

    // Karyawan routes
    Route::apiResource("karyawans", KaryawanController::class)->except(["create", "edit"]);
    
    // Unit routes
    Route::apiResource("units", UnitController::class)->except(["create", "edit"]);
    
    // Jabatan routes
    Route::apiResource("jabatans", JabatanController::class)->except(["create", "edit"]);
    
    // Dashboard routes
    Route::get("/dashboard", [DashboardController::class, "index"]);
});

