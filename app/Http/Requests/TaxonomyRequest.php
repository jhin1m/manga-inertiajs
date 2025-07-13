<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaxonomyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Will handle authorization in controllers/middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $taxonomyId = $this->route('taxonomy')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('taxonomies')->ignore($taxonomyId),
            ],
            'type' => 'required|in:genre,author,tag,status',
            'description' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên taxonomy là bắt buộc.',
            'name.max' => 'Tên taxonomy không được vượt quá 255 ký tự.',
            'name.unique' => 'Tên taxonomy này đã tồn tại.',
            'type.required' => 'Loại taxonomy là bắt buộc.',
            'type.in' => 'Loại taxonomy phải là một trong: genre, author, tag, status.',
            'description.max' => 'Mô tả không được vượt quá 1000 ký tự.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'tên taxonomy',
            'type' => 'loại taxonomy',
            'description' => 'mô tả',
        ];
    }
}

// Separate request class for taxonomy terms
class TaxonomyTermRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Will handle authorization in controllers/middleware
    }

    public function rules(): array
    {
        $taxonomyId = $this->route('taxonomy')?->id;
        $termId = $this->route('term')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('taxonomy_terms')
                    ->where('taxonomy_id', $taxonomyId)
                    ->ignore($termId),
            ],
            'description' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên term là bắt buộc.',
            'name.max' => 'Tên term không được vượt quá 255 ký tự.',
            'name.unique' => 'Tên term này đã tồn tại trong taxonomy này.',
            'description.max' => 'Mô tả không được vượt quá 1000 ký tự.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'tên term',
            'description' => 'mô tả',
        ];
    }
}
