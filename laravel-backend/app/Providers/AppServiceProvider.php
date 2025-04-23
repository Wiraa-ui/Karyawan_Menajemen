<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Paksa HTTPS jika aplikasi berjalan di production
        // if ($this->app->environment('production')) {
        //     URL::forceScheme('https');
        // }

        // Atur timezone ke WITA (Asia/Makassar)
        date_default_timezone_set('Asia/Makassar');
    }
}
