<?php

namespace App\Http\Requests\api;

use Illuminate\Foundation\Http\FormRequest;

class ApiScanRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'project_id'    => 'required|exists:projects,id',
            'key_project_id' => 'required|exists:key_projects,id',
            'zap_scan_id'   => 'nullable|string|max:255',
            'status'        => 'required|in:pending,running,completed,failed',
            'started_at'    => 'nullable',
            'finished_at'   => 'nullable',
            // 'results'       => 'nullable|json',
        ];
    }
}
