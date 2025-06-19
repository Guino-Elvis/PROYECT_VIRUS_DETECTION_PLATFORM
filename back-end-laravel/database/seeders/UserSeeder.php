<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear un usuario administrador
        User::create([
            // 'dni' => '77298042',
            'name' => 'Administrator',
            // 'apellidos' => 'Administrator',
            // 'telefono' => '987654321', // Mejor poner un valor fijo si es admin
            // 'direccion' => 'Av. Principal 123, Lima',
            // 'fecha_nacimiento' => now(),
            // 'estado' => true,
            'email' => 'admin@gmail.com',
            'email_verified_at' => now(),
            'password' => Hash::make('admin'), // Mejor Hash::make() que bcrypt()
            'remember_token' => Str::random(10),
        ])->assignRole('Administrador');

        // Crear el usuario
        $user = User::create([
            'name' => 'Gloria',
            'email' => 'gloria@gmail.com',
            'email_verified_at' => now(),
            'password' => Hash::make('admin'),
            'remember_token' => Str::random(10),
        ])->assignRole('Empresa');

        // Crear la compañía asociada
        $company = Company::create([
            'ra_social' => 'GLORIA', // Cambiar por el valor real
            'ruc' => '12345678901', // Cambiar por el RUC real
            'address' => 'SAN JOSE', // Cambiar por la dirección real
            'status' => '2',
            'phone' => '123456789', // Cambiar por el teléfono real
            'email' => 'gloria@gmail.com', // Cambiar por el email de la empresa
        ]);

       
        $user->companies()->attach($company->id);

        $usersEmpresas = User::factory(2)->create()->each(function ($user) {
            $user->assignRole('Empresa');
        });

        // Crear usuarios Técnicos (Asegúrate de que el rol 'Técnico' exista en RoleSeeder)
        $usersClientes = User::factory(3)->create()->each(function ($user) {
            $user->assignRole('Cliente');
        });

        // Crear usuarios Directivos (Asegúrate de que el rol 'Directivo' exista en RoleSeeder)
        $usersUsuarios = User::factory(2)->create()->each(function ($user) {
            $user->assignRole('Usuario');
        });
    }
}
