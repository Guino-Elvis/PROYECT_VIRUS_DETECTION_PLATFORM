<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\api\ApiKeyProjectRequest;
use App\Models\KeyProject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ApiKeyKeyProjectController extends Controller
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

        // $query = Delivered_food::query();

        if ($user->hasRole('Administrador')) {
            $query = KeyProject::with('project');
        } else {
            $query = KeyProject::whereHas('project', function ($projectQuery) use ($user) {
                $projectQuery->whereHas('company', function ($companyQuery) use ($user) {
                    $companyQuery->whereIn('company_id', $user->companies->pluck('id'));
                });
            })->with('project');
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('target_url', 'LIKE', "%{$search}%");

                $q->orWhereHas('company', function ($subQuery) use ($search) {
                    $subQuery->where('ra_social', 'LIKE', "%{$search}%")
                        ->orWhere('ruc', 'LIKE', "%{$search}%");
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
        $delivered_foos = $query->orderBy('created_at', $sortOrder)->paginate($perPage);
        return response()->json($delivered_foos, Response::HTTP_OK);
    }

    public function store(ApiKeyProjectRequest $request)
    {
        DB::beginTransaction();
        try {
            $KeyProject = KeyProject::create($request->all());
            DB::commit();
            return response()->json([
                'message' => "Key creado correctamente",
                'KeyProject' => $KeyProject
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => "Error al crear key",
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show($id)
    {
        $user =  User::find(Auth::id());
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], Response::HTTP_UNAUTHORIZED);
        }

        if ($user->hasRole('Administrador')) {
            $query = KeyProject::with('project');
        } else {
            $query = KeyProject::whereHas('project', function ($projectQuery) use ($user) {
                $projectQuery->whereHas('company', function ($companyQuery) use ($user) {
                    $companyQuery->whereIn('company_id', $user->companies->pluck('id'));
                });
            })->with('project');
        }
        
        $KeyProject = $query->find($id);

        if (!$KeyProject) {
            return response()->json(['error' => 'key no encontrado'], 404);
        }
        return response()->json(['data' => $KeyProject], 200);
    }

    public function update(ApiKeyProjectRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $KeyProject = KeyProject::find($id);
            if (!$KeyProject) {
                return response()->json(['error' => 'Key no encontrado'], 404);
            }
            $KeyProject->update($request->all());
            DB::commit();
            return response()->json([
                'message' => "Key actualizado satisfactoriamente",
                'KeyProject' => $KeyProject
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => "Error al actualizar key",
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $KeyProject = KeyProject::find($id);
            if (!$KeyProject) {
                return response()->json(['error' => 'Key no encontrado'], 404);
            }
            $KeyProject->delete();
            DB::commit();
            return response()->json([
                'message' => "Key eliminado satisfactoriamente"
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => "Error al eliminar key",
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
