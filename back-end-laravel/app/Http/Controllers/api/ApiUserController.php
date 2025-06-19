<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Response;


class ApiUserController extends Controller
{
    public function index()
    {
        $users = User::with(['companies', 'roles'])->get(); 
        return response()->json($users, Response::HTTP_OK);
    }

    public function show($id)
    {
        $user = User::with(['companies', 'roles'])->find($id);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        return response()->json($user, Response::HTTP_OK);
    }
}
