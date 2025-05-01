<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash; // Use Hash facade for password checking
use Tymon\JWTAuth\Facades\JWTAuth; // Import JWTAuth facade
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Cookie; // Import Cookie facade
use Illuminate\Support\Str; // Import Str facade
// use Illuminate\Routing\Controllers\HasMiddleware; // Remove HasMiddleware import
// use Illuminate\Routing\Controllers\Middleware; // Remove Middleware import

class AuthController extends Controller // Remove HasMiddleware implementation
{
    // Remove the constructor that applied middleware
    // public function __construct()
    // {
    //     // Apply auth:api middleware to all methods except login
    //     $this->middleware("auth:api", ["except" => ["login"]]);
    // }

    /**
     * Get a JWT via given credentials (username or email) and set it as an HttpOnly cookie.
     * MODIFIED: Compares plain text password for development purposes.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            // Validate input: accept either email or username as login_identifier
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                "login_identifier" => "required|string",
                "password" => "required|string",
            ]);

            if ($validator->fails()) {
                 return response()->json(["message" => "Validation failed", "errors" => $validator->errors()], 422);
            }

            // Determine if the login identifier is an email or username
            $loginField = filter_var($request->login_identifier, FILTER_VALIDATE_EMAIL) ? "email" : "username";

            // Find the user by email or username
            $user = Karyawan::where($loginField, $request->login_identifier)->first();

            // Check if user exists and if the password matches using Hash::check
            if (!$user || !Hash::check($request->password, $user->password)) { // Use Hash::check for secure comparison
                // Log failed attempt for security monitoring (optional but recommended)
                Log::warning("Login attempt failed for identifier: " . $request->login_identifier);
                return response()->json(["message" => "Unauthorized"], 401);
            }

            // Manually log in the user for the 'api' guard
            Auth::guard("api")->login($user);

            // Generate JWT token for the authenticated user
            if (! $token = JWTAuth::fromUser($user)) {
                 Log::error("Could not create token for user ID: " . $user->id);
                 return response()->json(["message" => "Could not create token"], 500);
            }

            // Catat login
            if ($user instanceof Karyawan) {
                 $user->logins()->create(["waktu_login" => now()]);
            }

            // Return user info and set the token in an HttpOnly cookie
            return $this->respondWithCookie($token);

        } catch (JWTException $e) {
            Log::error("Could not create token: " . $e->getMessage());
            return response()->json(["message" => "Could not create token"], 500);
        } catch (\Exception $e) {
            Log::error("Login error: " . $e->getMessage());
            // Provide a more generic error message in production
            return response()->json(["message" => "Login failed due to an internal error."], 500);
        }
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request) // Inject Request
    {
        // Log received cookies for debugging
        $jwtCookie = $request->cookie(config("jwt.cookie.token_name", "jwt_token"));
        Log::info("[AUTH DEBUG] /me endpoint hit.");
        Log::info("[AUTH DEBUG] JWT Cookie (".config("jwt.cookie.token_name", "jwt_token")."): ", [$jwtCookie ? "Present" : "Missing"]);
        // Optionally log the first few chars of the cookie value if present, be careful with sensitive data
        // if ($jwtCookie) {
        //     Log::info("[AUTH DEBUG] JWT Cookie Value (start): " . substr($jwtCookie, 0, 10) . "...");
        // }

        try {
            $user = Auth::guard("api")->user();
            if ($user) {
                Log::info("[AUTH DEBUG] User successfully authenticated via guard.", ["user_id" => $user->id]);
                return response()->json($user);
            } else {
                Log::warning("[AUTH DEBUG] Auth guard returned null user despite cookie potentially present.");
                return response()->json(["message" => "User not authenticated"], 401);
            }
        } catch (\Exception $e) {
            Log::error("[AUTH DEBUG] Error fetching user: " . $e->getMessage());
            return response()->json(["message" => "Error fetching user"], 500);
        }
    }

    /**
     * Log the user out (Invalidate the token and clear the cookie).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        try {
            Auth::guard("api")->logout(); // Invalidates the token
            
            // Create a cookie with the same name but expired to clear it
            $cookie = Cookie::forget(config("jwt.cookie.token_name", "jwt_token"));

            return response()->json(["message" => "Successfully logged out"])->withCookie($cookie);
        } catch (\Exception $e) {
            Log::error("Logout error: " . $e->getMessage());
            return response()->json(["message" => "Logout failed"], 500);
        }
    }

    /**
     * Refresh a token and set it as an HttpOnly cookie.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        try {
            // Refresh the token. The middleware should have already validated the existing token (from cookie).
            $newToken = Auth::guard("api")->refresh();
            return $this->respondWithCookie($newToken);
        } catch (JWTException $e) {
             Log::error("Could not refresh token: " . $e->getMessage());
            // If refresh fails (e.g., token expired past refresh TTL), clear the cookie
            $cookie = Cookie::forget(config("jwt.cookie.token_name", "jwt_token"));
            return response()->json(["message" => "Could not refresh token"], 401)->withCookie($cookie);
        } catch (\Exception $e) {
            Log::error("Refresh error: " . $e->getMessage());
            return response()->json(["message" => "Refresh failed"], 500);
        }
    }

    /**
     * Prepare the JSON response with user data and set the JWT cookie.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithCookie($token)
    {
        $user = Auth::guard("api")->user();
        $ttl = Auth::guard("api")->factory()->getTTL(); // TTL in minutes
        
        // Create the HttpOnly cookie
        $cookie = cookie(
            config("jwt.cookie.token_name", "jwt_token"), // Cookie name from config
            $token, // Token value
            $ttl, // Expiry time in minutes
            config("jwt.cookie.path", "/"), // Path
            config("jwt.cookie.domain", null), // Domain
            config("jwt.cookie.secure", env("JWT_COOKIE_SECURE", true)), // Secure (HTTPS only) - Use env variable
            config("jwt.cookie.http_only", true), // HttpOnly
            false, // Raw
            config("jwt.cookie.same_site", env("JWT_COOKIE_SAMESITE", "none")) // SameSite attribute from config/env
        );

        return response()->json([
            // No token in body, only user info
            "user" => [
                "id" => $user->id,
                "nama" => $user->nama,
                "email" => $user->email, // Include email in response
                "username" => $user->username
            ]
        ])->withCookie($cookie); // Attach the cookie to the response
    }
}

