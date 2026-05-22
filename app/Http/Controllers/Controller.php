<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

abstract class Controller
{
    protected function successResponse(string $message, mixed $value = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'status' => "TRUE",
            'message' => $message,
            'value' => $value,
        ], $code);
    }

    protected function errorResponse(string $message, mixed $value = null, int $code = 400): JsonResponse
    {
        return response()->json([
            'status' => "FALSE",
            'message' => $message,
            'value' => $value,
        ], $code);
    }
}
