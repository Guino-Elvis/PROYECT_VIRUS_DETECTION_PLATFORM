<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\api\ApiScanRequest;
use App\Jobs\RunZapScanJob;
use App\Models\KeyProject;
use App\Models\Project;
use App\Models\Scan;
use App\Models\User;
use App\Models\Vulnerability;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApiScanController extends Controller
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
            $query = Scan::with('project');
        } else {
            $query = Scan::whereHas('project', function ($projectQuery) use ($user) {
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


    // public function store(Request $request)
    // {
    //     DB::beginTransaction();

    //     try {
    //         $projectId = $request->input('project_id');
    //         $project = Project::findOrFail($projectId);

    //         $keyProject = KeyProject::where('project_id', $project->id)
    //             ->where('active', true)
    //             ->where(function ($query) {
    //                 $query->whereNull('expires_at')
    //                     ->orWhere('expires_at', '>', now());
    //             })->first();

    //         if (!$keyProject) {
    //             return response()->json([
    //                 'error' => 'El proyecto no tiene una clave activa o está expirada',
    //             ], 422);
    //         }

    //         $zapUrl = config('zap.api_url');
    //         $apiKey = config('zap.api_key');
    //         $target = $project->target_url;

    //         // Incluir en contexto para evitar errores comunes
    //         Http::get("$zapUrl/JSON/context/action/includeInContext", [
    //             'contextName' => 'Default Context',
    //             'regex'       => $target . '.*',
    //             'apikey'      => $apiKey,
    //         ]);

    //         // --- SPIDER ---
    //         $spiderResponse = Http::get("$zapUrl/JSON/spider/action/scan", [
    //             'url'    => $target,
    //             'apikey' => $apiKey,
    //         ]);

    //         $spiderScanId = $spiderResponse['scan'] ?? null;
    //         if (!$spiderScanId) {
    //             Log::error('Spider error response', $spiderResponse->json());
    //             throw new \Exception("No se pudo iniciar el spidering en ZAP.");
    //         }

    //         do {
    //             sleep(5);
    //             $statusSpider = Http::get("$zapUrl/JSON/spider/view/status", [
    //                 'scanId' => $spiderScanId,
    //                 'apikey' => $apiKey,
    //             ]);
    //             $spiderProgress = (int) ($statusSpider['status'] ?? 0);
    //         } while ($spiderProgress < 100);

    //         // --- ESCANEO ACTIVO ---
    //         $scanResponse = Http::get("$zapUrl/JSON/ascan/action/scan", [
    //             'url'          => $target,
    //             'recurse'      => true,
    //             'inScopeOnly'  => false,
    //             'apikey'       => $apiKey,
    //         ]);

    //         $scanData = $scanResponse->json();
    //         $zapScanId = $scanData['scan'] ?? null;

    //         if (!$zapScanId) {
    //             Log::error('Active scan error response', $scanData);
    //             throw new \Exception("No se pudo iniciar el escaneo activo en ZAP.");
    //         }

    //         $startedAt = now();

    //         do {
    //             sleep(5);
    //             $statusCheck = Http::get("$zapUrl/JSON/ascan/view/status", [
    //                 'scanId' => $zapScanId,
    //                 'apikey' => $apiKey,
    //             ]);
    //             $progress = (int) ($statusCheck['status'] ?? 0);
    //         } while ($progress < 100);

    //         $finishedAt = now();

    //         // --- ALERTAS ---
    //         $alertsResponse = Http::get("$zapUrl/JSON/core/view/alerts", [
    //             'baseurl' => $target,
    //             'start'   => 0,
    //             'count'   => 1000,
    //             'apikey'  => $apiKey,
    //         ]);

    //         $alerts = $alertsResponse['alerts'] ?? [];

    //         // --- GUARDAR RESULTADO ---
    //         $scan = Scan::create([
    //             'project_id'     => $project->id,
    //             'key_project_id' => $keyProject->id,
    //             'zap_scan_id'    => $zapScanId,
    //             'status'         => 'completed',
    //             'started_at'     => $startedAt,
    //             'finished_at'    => $finishedAt,
    //             'results'        => $alerts,
    //         ]);

    //         foreach ($alerts as $alert) {
    //             Vulnerability::create([
    //                 'scan_id'    => $scan->id,
    //                 'plugin_id'  => $alert['pluginId'] ?? '',
    //                 'name'       => $alert['name'] ?? '',
    //                 'risk'       => $alert['risk'] ?? 'Informational',
    //                 'confidence' => $alert['confidence'] ?? 'Medium',
    //                 'description' => $alert['description'] ?? '',
    //                 'url'        => $alert['url'] ?? '',
    //                 'parameter'  => $alert['param'] ?? '',
    //                 'solution'   => $alert['solution'] ?? '',
    //                 'evidence'   => $alert['evidence'] ?? '',
    //             ]);
    //         }

    //         DB::commit();

    //         return response()->json([
    //             'message' => 'Escaneo completado con éxito',
    //             'scan'    => $scan->load('vulnerabilities'),
    //         ], 201);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         Log::error('Error en escaneo ZAP', [
    //             'message' => $e->getMessage(),
    //             'trace'   => $e->getTraceAsString(),
    //         ]);
    //         return response()->json([
    //             'error'   => 'Error durante el escaneo',
    //             'details' => $e->getMessage(),
    //         ], 500);
    //     }
    // }



    public function store(Request $request)
    {
        $projectId = $request->input('project_id');

        $keyProject = KeyProject::where('project_id', $projectId)
            ->where('active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        if (!$keyProject) {
            return response()->json([
                'error' => 'El proyecto no tiene una clave activa válida.'
            ], 400);
        }

        $scan = Scan::create([
            'project_id'     => $projectId,
            'key_project_id' => $keyProject->id,
            'status'         => 'pending',
            'progress'       => 0,
        ]);

        dispatch(new RunZapScanJob($scan->id));

        return response()->json([
            'message' => 'Escaneo iniciado en segundo plano.',
            'scan_id' => $scan->id
        ]);
    }

    public function getScanProgress($id)
    {
        $scan = Scan::find($id);

        if (!$scan) {
            return response()->json([
                'error' => 'Scan no encontrado'
            ], 404);
        }

        return response()->json([
            'status'   => $scan->status,
            'progress' => $scan->progress,
            'started_at' => $scan->started_at,
            'finished_at' => $scan->finished_at,
        ]);
    }


    public function show($id)
    {
        $user =  User::find(Auth::id());
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], Response::HTTP_UNAUTHORIZED);
        }
        if ($user->hasRole('Administrador')) {
            $query = Scan::with('project');
        } else {
            $query = Scan::whereHas('project', function ($projectQuery) use ($user) {
                $projectQuery->whereHas('company', function ($companyQuery) use ($user) {
                    $companyQuery->whereIn('company_id', $user->companies->pluck('id'));
                });
            })->with('project');
        }

        $Scan = $query->find($id);

        if (!$Scan) {
            return response()->json(['error' => 'Scan no encontrado'], 404);
        }
        return response()->json(['data' => $Scan], 200);
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $Scan = Scan::find($id);
            if (!$Scan) {
                return response()->json(['error' => 'Scan no encontrado'], 404);
            }
            DB::commit();
            return response()->json([
                'message' => "Scan actualizado satisfactoriamente",
                'Scan' => $Scan
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => "Error al actualizar el Scan",
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $Scan = Scan::find($id);
            if (!$Scan) {
                return response()->json(['error' => 'Scan no encontrado'], 404);
            }
            $Scan->delete();
            DB::commit();
            return response()->json([
                'message' => "Scan eliminado satisfactoriamente"
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => "Error al eliminar el Scan",
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
