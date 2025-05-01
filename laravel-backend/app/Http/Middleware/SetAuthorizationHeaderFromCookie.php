<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetAuthorizationHeaderFromCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if Authorization header already exists
        if (!$request->headers->has('Authorization')) {
            // Get the token name from config
            $tokenName = config('jwt.cookie.token_name', 'jwt_token');
            
            // Check if the JWT cookie exists
            if ($request->hasCookie($tokenName)) {
                $token = $request->cookie($tokenName);
                // Set the Authorization header
                $request->headers->set('Authorization', 'Bearer ' . $token);
            }
        }

        return $next($request);
    }
}

