<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear roles
        $role1 = Role::create(['name' => 'Administrador']);
        $role2 = Role::create(['name' => 'Empresa']);
        $role3 = Role::create(['name' => 'Cliente']);
        $role4 = Role::create(['name' => 'Usuario']);



        //autenticacion
        Permission::create(['name' => 'auth.logout', 'description' => 'Cerrar sesión'])->syncRoles([$role1, $role2, $role3, $role4]);
        Permission::create(['name' => 'auth.me', 'description' => 'Ver usuario autenticado'])->syncRoles([$role1, $role2, $role3, $role4]);
        Permission::create(['name' => 'auth.refresh', 'description' => 'Refrescar token de sesión'])->syncRoles([$role1, $role2, $role3, $role4]);
        //roles
        Permission::create(['name' => 'admin.roles', 'description' => 'Ver listado de roles'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.roles.edit', 'description' => 'Editar roles'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.roles.create', 'description' => 'Crear roles'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.roles.assign.permission', 'description' => 'Asignar permisos al rol'])->syncRoles([$role1, $role2]);
        //compañias
        Permission::create(['name' => 'admin.companies', 'description' => 'Ver listado de empresa'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.companies.create', 'description' => 'Crear empresa'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.companies.edit', 'description' => 'Editar empresa'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.companies.delete', 'description' => 'Eliminar empresa'])->syncRoles([$role1, $role2]);
        //usuarios por compañia
        Permission::create(['name' => 'admin.usercompanies', 'description' => 'Ver listado usuarios por empresa'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.usercompanies.create', 'description' => 'Crear usuarios por empresa'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.usercompanies.edit', 'description' => 'Editar usuarios por empresa'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.usercompanies.delete', 'description' => 'Eliminar usuarios por empresa'])->syncRoles([$role1, $role2]);
        //usuarios
        Permission::create(['name' => 'admin.users', 'description' => 'Ver listado de usuarios'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.users.create', 'description' => 'Crear usuarios'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.users.edit', 'description' => 'Editar usuarios'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.users.delete', 'description' => 'Eliminar usuarios'])->syncRoles([$role1, $role2]);
        //proyectos
        Permission::create(['name' => 'admin.projects', 'description' => 'Ver listado de proyectos'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.projects.create', 'description' => 'Crear proyectos'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.projects.edit', 'description' => 'Editar proyectos'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.projects.delete', 'description' => 'Eliminar proyectos'])->syncRoles([$role1, $role2]);
        //proyectos claves
        Permission::create(['name' => 'admin.key.projects', 'description' => 'Ver listado de claves de proyectos'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.key.projects.create', 'description' => 'Crear claves de proyectos'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.key.projects.edit', 'description' => 'Editar claves de proyectos'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.key.projects.delete', 'description' => 'Eliminar claves de proyectos'])->syncRoles([$role1, $role2]);
        // escaneos
        Permission::create(['name' => 'admin.scans', 'description' => 'Ver listado de escaneos'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.scans.create', 'description' => 'Crear escaneos'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.scans.edit', 'description' => 'Editar escaneos'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.scans.delete', 'description' => 'Eliminar escaneos'])->syncRoles([$role1, $role2]);
        //vulnerabilidades
        Permission::create(['name' => 'admin.vulneravilitiess', 'description' => 'Ver listado de vulnerabilidades'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.vulneravilitiess.create', 'description' => 'Crear vulnerabilidades'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.vulneravilitiess.edit', 'description' => 'Editar vulnerabilidades'])->syncRoles([$role1, $role2]);
        Permission::create(['name' => 'admin.vulneravilitiess.delete', 'description' => 'Eliminar vulnerabilidades'])->syncRoles([$role1, $role2]);

    }
}
