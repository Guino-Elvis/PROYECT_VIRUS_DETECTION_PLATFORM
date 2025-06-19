<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    
    public function index()
    {
       
        $user =  User::find(Auth::id());
        // Obtener todos los roles
        $rolesQuery = Role::query();
    
        // Si NO es admin, excluir el rol "Administrador"
        if (!$user->roles->contains('name', 'Administrador')) {
            $rolesQuery->where('name', '!=', 'Administrador');
        }
    
        $roles = $rolesQuery->get();
    
        return response()->json([
            'status' => true,
            'roles' => $roles,
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
