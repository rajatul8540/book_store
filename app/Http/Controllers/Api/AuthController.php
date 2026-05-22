<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    private function validateRequest($request, $rules, $messages)
    {
        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return $this->errorResponse(
                'Validation error',
                $validator->errors(),
                422
            );
        }

        return null;
    }

    private function createUser($request)
    {
        return User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
    }

    public function login(Request $request)
    {
        $validation = $this->validateRequest(
            $request,
            [
                'email' => 'required|email',
                'password' => 'required',
            ],
            [
                'email.required' => 'Email is required',
                'email.email' => 'Enter a valid email address',
                'password.required' => 'Password is required',
            ]
        );

        if ($validation) {
            return $validation;
        }

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return $this->errorResponse(
                'Invalid credentials',
                null,
                401
            );
        }

        return $this->successResponse(
            'Login successful',
            [
                'token' => $token,
                'user' => JWTAuth::user(),
            ]
        );
    }

    public function register(Request $request)
    {
        $validation = $this->validateRequest(
            $request,
            [
                'name' => 'required|string|min:3|max:50',
                'email' => 'required|email|unique:users,email',
                'password' => [
                    'required',
                    'min:8',
                    'regex:/[A-Z]/',
                    'regex:/[a-z]/',
                    'regex:/[0-9]/',
                ],
            ],
            [
                'name.required' => 'Name is required',
                'name.min' => 'Name must be at least 3 characters',
                'email.required' => 'Email is required',
                'email.email' => 'Enter a valid email address',
                'email.unique' => 'Email already exists',
                'password.required' => 'Password is required',
                'password.min' => 'Password must be at least 8 characters',
                'password.regex' =>
                    'Password must contain uppercase, lowercase, and number',
            ]
        );

        if ($validation) {
            return $validation;
        }

        $user = $this->createUser($request);

        return $this->successResponse(
            'User registered successfully',
            [
                'user' => $user,
            ],
            201
        );
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            return $this->errorResponse(
                'Unable to logout',
                null,
                401
            );
        }

        return $this->successResponse('Logout successful');
    }

    public function profile()
    {
        return $this->successResponse(
            'User fetched successfully',
            JWTAuth::user()
        );
    }
}