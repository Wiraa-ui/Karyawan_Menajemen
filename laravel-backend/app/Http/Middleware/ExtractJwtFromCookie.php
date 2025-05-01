<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExtractJwtFromCookie
{
    /**
     * Handle an incoming request.
     *
     * Extracts the JWT token from the cookie and sets it as the Authorization header.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tokenName = config("jwt.cookie.token_name", "jwt_token");

        if ($request->hasCookie($tokenName)) {
            $token = $request->cookie($tokenName);
            // Ensure the Authorization header is not already set
            if (!$request->headers->has("Authorization")) {
                $request->headers->set("Authorization", "Bearer " . $token);
            }
        }

        return $next($request);
    }
}

