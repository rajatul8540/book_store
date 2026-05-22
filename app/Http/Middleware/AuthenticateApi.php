<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApi
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            if (!JWTAuth::parseToken()->authenticate()) {
                return $this->unauthorized();
            }
        } catch (TokenExpiredException) {
            return $this->unauthorized('Token expired');
        } catch (TokenInvalidException) {
            return $this->unauthorized('Token invalid');
        } catch (JWTException) {
            return $this->unauthorized('Token not provided');
        }

        return $next($request);
    }

    private function unauthorized(string $message = 'Unauthenticated'): Response
    {
        return response()->json([
            'status' => "FALSE",
            'message' => $message,
            'value' => null,
        ], 401);
    }
}
