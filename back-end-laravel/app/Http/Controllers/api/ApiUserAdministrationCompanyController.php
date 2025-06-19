<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class ApiUserAdministrationCompanyController extends Controller
{
    public function index()
    {
        $user =  User::find(Auth::id());

        if (!$user) {
            return response()->json(['error' => 'No autenticado'], Response::HTTP_UNAUTHORIZED);
        }

        $search = request()->query('search');
        $startDate = request()->query('start_date');
        $endDate = request()->query('end_date');
        $sortOrder = request()->query('sort_order', 'desc');
        $perPage = request()->query('per_page', 8);


        if (!is_numeric($perPage) || $perPage <= 0) {
            $perPage = 8;
        }


        if ($user->hasRole('Administrador')) {
       
          $query = User::with(['companies', 'roles']);
        } else {
        
            $companies = $user->companies->pluck('id');

            if ($companies->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'El usuario no tiene empresas asociadas'
                ], 404);
            }

     
            $query = User::with(['companies', 'roles'])->whereHas('companies', function ($q) use ($companies) {
                $q->whereIn('company_id', $companies);
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhereHas('companies', function ($q2) use ($search) {
                        $q2->where('ra_social', 'LIKE', "%{$search}%"); 
                    });
            });
        }
        if ($startDate) {
            $startDate = Carbon::parse($startDate)->startOfDay();
            $query->where('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $endDate = Carbon::parse($endDate)->endOfDay();
            $query->where('created_at', '<=', $endDate);
        }
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? $sortOrder : 'desc';
        $users = $query->orderBy('created_at', $sortOrder)->paginate($perPage);

        return response()->json($users, Response::HTTP_OK);
    }





    public function store(Request $request)
    {
        try {
            //Validated
            $validateUser = Validator::make(
                $request->all(),
                [
                    'role' => 'required',
                    'name' => 'required',
                    'email' => 'required|email|unique:users,email',
                    'password' => 'required',
                    //company campos
                    // 'company_id' => 'required',
                    'company_id' => 'sometimes|nullable|exists:companies,id',
                    'status' => 'required',
                ]
            );

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'validation error',
                    'errors' => $validateUser->errors()
                ], 401);
            }

            DB::beginTransaction();

            $user = User::create([
                'status' => $request->status,
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password)
            ]);
            
            $userAuth =  User::find(Auth::id());
            $companyId = $request->company_id ?? optional($userAuth->companies()->first())->id;

            if (!$companyId) {
                return response()->json([
                    'message' => "El usuario no tiene una compañía asociada y no se proporcionó una en la solicitud."
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $user->assignRole($request->role);
            $user->companies()->attach($companyId);
            // $user->companies()->attach($request->company_id);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'User Created Successfully',
                'user' => $user->load('companies'),
            ], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }


            $validateData = Validator::make($request->all(), [
                'status' => 'required',
                'role' => 'required',
                'name' => 'required',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'password' => 'nullable|min:6',
                'company_id' => 'sometimes|nullable|exists:companies,id',
            ]);

            if ($validateData->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateData->errors()
                ], 401);
            }

            DB::beginTransaction();

            $user->update([
                'status' => $request->status,
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->filled('password') ? Hash::make($request->password) : $user->password,
            ]);

            $userAuth =  User::find(Auth::id());
            $companyId = $request->company_id ?? optional($userAuth->companies()->first())->id;

            if (!$companyId) {
                return response()->json([
                    'message' => "El usuario no tiene una compañía asociada y no se proporcionó una en la solicitud."
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }


            $user->syncRoles([$request->role]);
            $user->companies()->sync([$companyId]);
            // $user->companies()->sync([$request->company_id]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Usuario actualizado correctamente',
                'user' => $user->load('companies'),
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();

            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            // Eliminar la relación con empresas antes de borrar el usuario
            $user->companies()->detach();
            $user->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Usuario eliminado correctamente'
            ], 200);
        } catch (\Throwable $th) {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => 'Error al eliminar usuario: ' . $th->getMessage()
            ], 500);
        }
    }
}
