<?php

use App\Http\Controllers\api\ApiAuthController;
use App\Http\Controllers\api\ApiCompanyController;
use App\Http\Controllers\api\ApiKeyKeyProjectController;
use App\Http\Controllers\api\ApiMenuRolController;
use App\Http\Controllers\api\ApiProjectController;
use App\Http\Controllers\api\ApiScanController;
use App\Http\Controllers\api\ApiUserAdministrationCompanyController;
use App\Http\Controllers\api\ApiUserController;
use App\Http\Controllers\api\ApiVulnerabilityController;
use App\Http\Controllers\api\RoleController;
use Illuminate\Support\Facades\Route;



Route::post('/auth/register', [ApiAuthController::class, 'createUser']);
Route::post('/auth/login', [ApiAuthController::class, 'loginUser']);

Route::prefix('admin')->middleware('auth:sanctum')->group(function () {


    Route::get('data/menu', [ApiMenuRolController::class, 'getMenu']);
    Route::post('/auth/logout', [ApiAuthController::class, 'logoutUser'])->middleware('can:auth.logout');
    Route::post('/auth/refresh', [ApiAuthController::class, 'refresh'])->middleware('can:auth.refresh');
    Route::get('/auth/user', [ApiAuthController::class, 'getUserData'])->middleware('can:auth.me');


    Route::apiResource('role',  RoleController::class)->middleware('can:admin.roles');
    Route::apiResource('users',  ApiUserController::class)->middleware('can:admin.users');
    Route::apiResource('companies', ApiCompanyController::class)->middleware('can:admin.companies');
    Route::apiResource('administration_user',  ApiUserAdministrationCompanyController::class)->middleware('can:admin.usercompanies');

    Route::apiResource('projects', ApiProjectController::class)->middleware('can:admin.projects');
    Route::apiResource('key_projects', ApiKeyKeyProjectController::class)->middleware('can:admin.key.projects');
    Route::apiResource('scans', ApiScanController::class)->middleware('can:admin.scans');
    
    Route::apiResource('vulneravilities', ApiVulnerabilityController::class)->middleware('can:admin.vulneravilitiess');





});
