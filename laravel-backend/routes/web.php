<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    // Tampilkan view 'welcome' dengan variabel message dan api_root
    return view('welcome', [
        'message'  => 'API Aktif',
        'api_root' => url('/api'),
    ]);
});
