<?php

namespace App\Http\Requests\api;

use Illuminate\Foundation\Http\FormRequest;

class ApiKeyProjectRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        // $keyProjectId = $this->route('key_project');
        return [
            'company_id'  => 'required|exists:companies,id',
            'project_id'  => 'required|exists:projects,id',
            // 'key' => 'required|string|max:255|unique:key_projects,key,' . $keyProjectId,
            'active'      => 'required|boolean',
            'expires_at'  => 'nullable|date',
        ];
    }
}
