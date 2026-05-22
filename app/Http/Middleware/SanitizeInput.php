<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    private array $except = [
        'password',
        'password_confirmation',
        'cover_image',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $request->merge($this->clean($request->all()));

        return $next($request);
    }

    private function clean(array $input): array
    {
        foreach ($input as $key => $value) {
            if (in_array($key, $this->except, true) || $value instanceof UploadedFile) {
                continue;
            }

            if (is_array($value)) {
                $input[$key] = $this->clean($value);
                continue;
            }

            if (is_string($value)) {
                $input[$key] = trim(strip_tags($value));
            }
        }

        return $input;
    }
}
