<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
class ApiMenuRolController extends Controller
{
    public function getMenu()
    {
        // Obtener el usuario autenticado
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
    
        // Leer el JSON desde resources/data/menu.json
        $jsonPath = resource_path('data/menu.json');
    
        if (!File::exists($jsonPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }
    
        $content = File::get($jsonPath);
        $menus = json_decode($content, true);
    
        if (!$menus) {
            return response()->json(['error' => 'Error al leer el menú'], 500);
        }
    
        // Obtener el rol del usuario
        $userRole = $user->roles->pluck('name')->first();
    
        // 🔥 Filtrar menús principales asegurando que si no tienen 'roles', al menos un submenú sea visible
        $filteredMenus = array_filter($menus, function ($menu) use ($userRole) {
            if (isset($menu['roles'])) {
                return in_array($userRole, $menu['roles']); // Filtrar por rol si existe
            }
    
            // Si no tiene "roles", solo mostrarlo si hay al menos un submenú visible
            if (isset($menu['submenu'])) {
                $visibleSubmenus = array_filter($menu['submenu'], function ($submenu) use ($userRole) {
                    return in_array($userRole, $submenu['roles']);
                });
                return !empty($visibleSubmenus);
            }
    
            return false; // Si no tiene roles ni submenús válidos, se elimina
        });
    
        // 🔥 Filtrar submenús
        $filteredMenus = array_map(function ($menu) use ($userRole) {
            if (isset($menu['submenu'])) {
                $menu['submenu'] = array_values(array_filter($menu['submenu'], function ($submenu) use ($userRole) {
                    return in_array($userRole, $submenu['roles']);
                }));
    
                // 🔥 Si no quedan submenús visibles, eliminamos la clave "submenu"
                if (empty($menu['submenu'])) {
                    unset($menu['submenu']);
                }
            }
    
            return $menu;
        }, $filteredMenus);
    
        // 🔥 Eliminar "roles" antes de enviar la respuesta
        $filteredMenus = array_map(function ($menu) {
            unset($menu['roles']);
            if (isset($menu['submenu'])) {
                $menu['submenu'] = array_map(function ($submenu) {
                    unset($submenu['roles']);
                    return $submenu;
                }, $menu['submenu']);
            }
            return $menu;
        }, array_values($filteredMenus));
    
        return response()->json($filteredMenus);
    }
    
    
    
}
