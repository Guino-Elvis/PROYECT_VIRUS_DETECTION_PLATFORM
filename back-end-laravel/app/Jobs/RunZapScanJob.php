<?php

namespace App\Jobs;

use App\Models\Project;
use App\Models\KeyProject;
use App\Models\Scan;
use App\Models\Vulnerability;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class RunZapScanJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $scanId;

    public function __construct($scanId)
    {
        $this->scanId = $scanId;
    }

    // public function handle()
    // {
    //     $scan = Scan::findOrFail($this->scanId);
    //     $project = $scan->project;

    //     DB::beginTransaction();

    //     try {
    //         $keyProject = $scan->keyProject;

    //         if (!$keyProject || ($keyProject->expires_at && $keyProject->expires_at->isPast())) {
    //             throw new \Exception("El proyecto no tiene una clave activa o está expirada.");
    //         }

    //         $zapUrl = config('zap.api_url');
    //         $apiKey = config('zap.api_key');
    //         $target = $project->target_url;

    //         // Probar conexión con la URL destino
    //         if (!Http::timeout(10)->get($target)->successful()) {
    //             throw new \Exception("No se puede acceder al objetivo ($target).");
    //         }

    //         $scan->update([
    //             'status'     => 'running',
    //             'started_at' => now(),
    //         ]);

    //         // === Spider ===
    //         $spiderResp = Http::get("$zapUrl/JSON/spider/action/scan", [
    //             'url' => $target,
    //             'apikey' => $apiKey,
    //         ]);

    //         $spiderScanId = $spiderResp['scan'] ?? null;
    //         if (!$spiderScanId) throw new \Exception("Error al iniciar el spidering.");

    //         do {
    //             sleep(5);
    //             $statusResp = Http::get("$zapUrl/JSON/spider/view/status", [
    //                 'scanId' => $spiderScanId,
    //                 'apikey' => $apiKey,
    //             ]);
    //             $progress = (int) ($statusResp['status'] ?? 0);
    //             $scan->update(['progress' => intval($progress * 0.3)]);
    //         } while ($progress < 100);

    //         // === Active Scan ===
    //         $activeResp = Http::get("$zapUrl/JSON/ascan/action/scan", [
    //             'url' => $target,
    //             'recurse' => true,
    //             'inScopeOnly' => false,
    //             'apikey' => $apiKey,
    //         ]);

    //         $zapScanId = $activeResp['scan'] ?? null;
    //         if (!$zapScanId) throw new \Exception("No se pudo iniciar el escaneo activo.");

    //         do {
    //             sleep(5);
    //             $statusResp = Http::get("$zapUrl/JSON/ascan/view/status", [
    //                 'scanId' => $zapScanId,
    //                 'apikey' => $apiKey,
    //             ]);
    //             $progress = (int) ($statusResp['status'] ?? 0);
    //             $scan->update([
    //                 'progress' => intval(30 + ($progress * 0.7)),
    //             ]);
    //         } while ($progress < 100);

    //         // === Obtener alertas ===
    //         $alertsResp = Http::get("$zapUrl/JSON/core/view/alerts", [
    //             'baseurl' => $target,
    //             'start' => 0,
    //             'count' => 1000,
    //             'apikey' => $apiKey,
    //         ]);

    //         $alerts = $alertsResp['alerts'] ?? [];

    //         $scan->update([
    //             'zap_scan_id' => $zapScanId,
    //             'status' => 'completed',
    //             'progress' => 100,
    //             'finished_at' => now(),
    //             'results' => $alerts,
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
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         $scan->update([
    //             'status' => 'failed',
    //             'progress' => 0,
    //             'finished_at' => now(),
    //             'error_message' => $e->getMessage(),
    //         ]);
    //     }
    // }

    public function handle()
    {
        $scan = Scan::findOrFail($this->scanId);
        $project = $scan->project;

        // Variables temporales (en memoria)
        $finalProgress = 0;
        $status = 'failed';
        $alerts = [];
        $startedAt = now();
        $finishedAt = null;
        $zapScanId = null;
        $errorMessage = null;

        try {
            $keyProject = $scan->keyProject;
            if (!$keyProject || ($keyProject->expires_at && $keyProject->expires_at->isPast())) {
                throw new \Exception("El proyecto no tiene una clave activa o está expirada.");
            }

            $zapUrl = config('zap.api_url');
            $apiKey = config('zap.api_key');
            $target = $project->target_url;

            if (!Http::timeout(10)->get($target)->successful()) {
                throw new \Exception("No se puede acceder al objetivo ($target).");
            }

            // === SPIDER ===
            $spiderResp = Http::get("$zapUrl/JSON/spider/action/scan", [
                'url' => $target,
                'apikey' => $apiKey,
            ]);

            $spiderScanId = $spiderResp['scan'] ?? null;
            if (!$spiderScanId) {
                throw new \Exception("Error al iniciar el spidering.");
            }

            do {
                sleep(5);
                $statusResp = Http::get("$zapUrl/JSON/spider/view/status", [
                    'scanId' => $spiderScanId,
                    'apikey' => $apiKey,
                ]);
                $progress = (int) ($statusResp['status'] ?? 0);
                $finalProgress = intval($progress * 0.3); // No se guarda aún
            } while ($progress < 100);

            // === ACTIVE SCAN ===
            $activeResp = Http::get("$zapUrl/JSON/ascan/action/scan", [
                'url' => $target,
                'recurse' => true,
                'inScopeOnly' => false,
                'apikey' => $apiKey,
            ]);

            $zapScanId = $activeResp['scan'] ?? null;
            if (!$zapScanId) {
                throw new \Exception("No se pudo iniciar el escaneo activo.");
            }

            do {
                sleep(5);
                $statusResp = Http::get("$zapUrl/JSON/ascan/view/status", [
                    'scanId' => $zapScanId,
                    'apikey' => $apiKey,
                ]);
                $progress = (int) ($statusResp['status'] ?? 0);
                $finalProgress = intval(30 + ($progress * 0.7));
            } while ($progress < 100);

            // === ALERTAS ===
            $alertsResp = Http::get("$zapUrl/JSON/core/view/alerts", [
                'baseurl' => $target,
                'start' => 0,
                'count' => 1000,
                'apikey' => $apiKey,
            ]);

            $alerts = $alertsResp['alerts'] ?? [];
            $status = 'completed';
            $finalProgress = 100;
            $finishedAt = now();

            // ✅ Guardado final en una transacción
            DB::beginTransaction();

            $scan->update([
                'status' => $status,
                'progress' => $finalProgress,
                'started_at' => $startedAt,
                'finished_at' => $finishedAt,
                'zap_scan_id' => $zapScanId,
                'results' => $alerts,
            ]);

            foreach ($alerts as $alert) {
                Vulnerability::create([
                    'scan_id'     => $scan->id,
                    'plugin_id'   => $alert['pluginId'] ?? '',
                    'name'        => $alert['name'] ?? '',
                    'risk'        => $alert['risk'] ?? 'Informational',
                    'confidence'  => $alert['confidence'] ?? 'Medium',
                    'description' => $alert['description'] ?? '',
                    'url'         => $alert['url'] ?? '',
                    'parameter'   => $alert['param'] ?? '',
                    'solution'    => $alert['solution'] ?? '',
                    'evidence'    => $alert['evidence'] ?? '',
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $errorMessage = $e->getMessage();
            $finishedAt = now();

            // ❗ solo se guarda el error si algo falla
            $scan->update([
                'status' => 'failed',
                'progress' => 0,
                'started_at' => $startedAt,
                'finished_at' => $finishedAt,
                'error_message' => $errorMessage,
            ]);
        }
    }
}
