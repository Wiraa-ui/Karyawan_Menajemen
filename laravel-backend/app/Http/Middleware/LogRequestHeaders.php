<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogRequestHeaders
{
    /**
     * Handle an incoming request.
     *
     * Logs all request headers, focusing on the Cookie header.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        Log::debug('Incoming Request Headers:', $request->headers->all());
        Log::debug('Cookie Header specifically: ' . $request->header('Cookie'));
        Log::debug('Has jwt_token cookie?: ' . ($request->hasCookie('jwt_token') ? 'Yes' : 'No'));

        return $next($request);
    }
}

