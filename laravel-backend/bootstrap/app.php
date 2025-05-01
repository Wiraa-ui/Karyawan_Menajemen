<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Register middleware alias
        $middleware->alias([
            'jwt.cookieparser' => \App\Http\Middleware\SetAuthorizationHeaderFromCookie::class,
        ]);

        // Add middleware to the 'api' group, ensuring it runs first
        $middleware->prependToGroup('api', [
            \App\Http\Middleware\SetAuthorizationHeaderFromCookie::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
