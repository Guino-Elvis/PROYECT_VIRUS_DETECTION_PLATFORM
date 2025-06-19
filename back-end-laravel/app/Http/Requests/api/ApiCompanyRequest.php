<?php

namespace App\Http\Requests\api;

use Illuminate\Foundation\Http\FormRequest;

class ApiCompanyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ra_social' => 'required',
            'ruc' => 'required',
            'address' => 'required',
            'phone' => 'required',
            'email' => 'required',
            'status' => 'required',
        ];
    }
}
