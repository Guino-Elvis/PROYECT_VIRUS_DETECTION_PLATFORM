<?php

namespace App\Http\Requests\api;

use Illuminate\Foundation\Http\FormRequest;

class ApiProjectRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|nullable|exists:companies,id',
            'name'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_url' => 'required|url',
        ];
    }
}
