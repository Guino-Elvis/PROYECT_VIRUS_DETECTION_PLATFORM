<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\api\ApiProjectRequest;
use App\Models\KeyProject;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApiProjectController extends Controller
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
            $query = Project::with('company');
        } else {
            $query = Project::whereHas('company', function ($companyQuery) use ($user) {
                $companyQuery->whereIn('company_id', $user->companies->pluck('id'));
            })->with('company');
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

    public function store(ApiProjectRequest $request)
    {
        $user =  User::find(Auth::id());


        DB::beginTransaction();
        try {

            $companyId = $request->company_id ?? optional($user->companies()->first())->id;

            if (!$companyId) {
                return response()->json([
                    'message' => "El usuario no tiene una compañía asociada y no se proporcionó una en la solicitud."
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $data = $request->all();
            $data['company_id'] = $companyId;

            $project = Project::create($data);

            $keyProject = KeyProject::create([
                'company_id' => $companyId,
                'project_id' => $project->id,
                'key'        => Str::uuid()->toString(),
                'active'     => true,
                'expires_at' => now()->addMonth(),
            ]);

            DB::commit();
            return response()->json([
                'message' => "Proyecto creado correctamente",
                'project' => $project,
                'key_project' => $keyProject
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => "Error al crear el proyecto",
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
            $query = Project::with('company', 'keyProjects');
        } else {
            $query = Project::whereHas('company', function ($companyQuery) use ($user) {
                $companyQuery->whereIn('company_id', $user->companies->pluck('id'));
            })->with('company', 'keyProjects');
        }

        $project = $query->find($id);

        if (!$project) {
            return response()->json(['error' => 'Proyecto no encontrado'], 404);
        }
        return response()->json($project, Response::HTTP_OK);
    }

    public function update(ApiProjectRequest $request, $id)
    {
        $user =  User::find(Auth::id());


        DB::beginTransaction();
        try {
            $project = Project::find($id);
            if (!$project) {
                return response()->json(['error' => 'Proyecto no encontrado'], 404);
            }

            $companyId = $request->company_id ?? optional($user->companies()->first())->id;

            if (!$companyId) {
                return response()->json([
                    'message' => "El usuario no tiene una compañía asociada y no se proporcionó una en la solicitud."
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $data = $request->all();
            $data['company_id'] = $companyId;

            $project->update($data);
            DB::commit();
            return response()->json([
                'message' => "Proyecto actualizado satisfactoriamente",
                'project' => $project
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => "Error al actualizar el proyecto",
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $project = Project::find($id);
            if (!$project) {
                return response()->json(['error' => 'Proyecto no encontrado'], 404);
            }
            $project->delete();
            DB::commit();
            return response()->json([
                'message' => "Proyecto eliminado satisfactoriamente"
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => "Error al eliminar el proyecto",
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
