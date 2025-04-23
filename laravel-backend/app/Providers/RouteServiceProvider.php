<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * This namespace is applied to your controller routes.
     *
     * In addition, it is set as the root namespace for the URL generator.
     *
     * @var string|null
     */
    protected $namespace = 'App\\Http\\Controllers';

    /**
     * Define your route model bindings, pattern filters, etc.
     */
    public function boot(): void
    {
        $this->routes(function () {
            // Load API routes
            Route::prefix('api')
                ->middleware('api')
                ->namespace($this->namespace) // Apply namespace
                ->group(base_path('routes/api.php'));

            // Load Web routes
            Route::middleware('web')
                ->namespace($this->namespace) // Apply namespace
                ->group(base_path('routes/web.php'));
        });
    }
}