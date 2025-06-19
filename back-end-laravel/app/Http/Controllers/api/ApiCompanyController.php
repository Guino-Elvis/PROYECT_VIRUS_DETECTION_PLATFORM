<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\api\ApiCompanyRequest;
use App\Models\Company;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ApiCompanyController extends Controller
{
    public function index()
    {
      
        // $userId = Auth::id();
        // $user = User::find($userId); 
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


        // $query = User::find($user->id)->companies();


        if ($user->hasRole('Administrador')) {
            $query = Company::query();
        } else {
            $query = $user->companies();
            // $query = User::find($user->id)->companies();
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ra_social', 'LIKE', "%{$search}%")
                    ->orWhere('ruc', 'LIKE', "%{$search}%");
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
        $companies = $query->orderBy('created_at', $sortOrder)->paginate($perPage);
        $companies->map(function ($company) {
            $company->image_url = $company->image ? Storage::url($company->image->url) : null;
            return $company;
        });

        return response()->json($companies, Response::HTTP_OK);
    }

    public function store(ApiCompanyRequest $request)
    {
     
        $user =  User::find(Auth::id());
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], Response::HTTP_UNAUTHORIZED);
        }
    
        // 🔹 Crear la empresa con los datos del request
        $company = Company::create($request->all());
    
        // 🔹 Asociar la empresa con el usuario autenticado en la tabla pivote
        $user->companies()->attach($company->id);
    
        // 🔹 Guardar imagen si se proporciona
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('galery', 'public');
            $image = $company->image()->create(['url' => $imagePath]);
            $company->image_url = Storage::url($image->url);
        }
    
        return response()->json([
            'message' => "Registro creado satisfactoriamente",
            'company' => $company->load('image')
        ], Response::HTTP_CREATED);
    }
    

    public function show($id)
    {
        $companies = Company::find($id);
        $companies->map(function ($company) {
            $company->image_url = $company->image ? Storage::url($company->image->url) : null;
            return $company;
        });

        if (!$companies) {
            return response()->json(['message' => "No se encontró el ID especificado."], Response::HTTP_NOT_FOUND);
        }

        return response()->json($companies, Response::HTTP_OK);
    }

    public function update(ApiCompanyRequest $request, $id)
    {
    
        $user =  User::find(Auth::id());
    
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], Response::HTTP_UNAUTHORIZED);
        }
    
        $company = Company::find($id);
    
        if (!$company) {
            return response()->json(['message' => "No se encontró el ID especificado."], Response::HTTP_NOT_FOUND);
        }
    
        // 🔹 Actualizar los datos de la empresa (excepto la imagen)
        $company->update($request->except('image'));
    
        // 🔹 Asociar el usuario a la empresa en la tabla pivote si no está vinculado
        if (!$user->companies()->where('company_id', $company->id)->exists()) {
            $user->companies()->attach($company->id);
        }
    
        // 🔹 Manejo de imagen (si se envía una nueva imagen)
        if ($request->hasFile('image')) {
            if ($company->image) {
                // Eliminar la imagen anterior
                $existingImagePath = $company->image->url;
                if (Storage::disk('public')->exists($existingImagePath)) {
                    Storage::disk('public')->delete($existingImagePath);
                }
                $company->image->delete();
            }
            // Subir nueva imagen
            $imagePath = $request->file('image')->store('galery', 'public');
            $image = $company->image()->create(['url' => $imagePath]);
            $company->image_url = Storage::url($image->url);
        }
    
        return response()->json([
            'message' => "Registro actualizado satisfactoriamente",
            'company' => $company->load('image')
        ], Response::HTTP_OK);
    }
    

    public function destroy($id)
    {
        $companies = Company::find($id);

        if (!$companies) {
            return response()->json([
                'message' => "No se encontró el ID especificado para eliminar."
            ], Response::HTTP_NOT_FOUND);
        }
        if ($companies->image) {
            Storage::disk('public')->delete($companies->image->url);
            $companies->image()->delete();
        }

        $companies->delete();

        return response()->json([
            'message' => "Registro eliminado satisfactoriamente"
        ], Response::HTTP_OK);
    }
}
