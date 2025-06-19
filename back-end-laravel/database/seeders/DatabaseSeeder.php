<?php

namespace Database\Seeders;

use App\Models\Reason;
use App\Models\Service;
use App\Models\User;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'admin@gmail.com',
        //     'password' => 'admin',
        // ]);
        File::deleteDirectory('public/storage/galery');
        File::makeDirectory('public/storage/galery');
        Storage::deleteDirectory('galery');

        $this->call(RoleSeeder::class);
        $this->call(UserSeeder::class);
        // $this->call( CompanySeeder::class);
        // $this->call( ContractSeeder::class);
  

    }
}
