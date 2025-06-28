<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PageRequest extends FormRequest
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
        $chapterId = $this->route('chapter')?->id;
        $pageId = $this->route('page')?->id;

        $rules = [
            'image_url' => 'required|string|max:500',
            'page_number' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('pages')
                    ->where('chapter_id', $chapterId)
                    ->ignore($pageId)
            ]
        ];

        // For bulk upload
        if ($this->has('pages')) {
            $rules = [
                'pages' => 'required|array|min:1',
                'pages.*.image_url' => 'required|string|max:500',
                'pages.*.page_number' => 'required|integer|min:1'
            ];
        }

        // For file upload
        if ($this->has('images')) {
            $rules = [
                'images' => 'required|array|min:1',
                'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240' // 10MB max
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'image_url.required' => 'URL hình ảnh là bắt buộc.',
            'image_url.max' => 'URL hình ảnh không được vượt quá 500 ký tự.',
            'page_number.required' => 'Số trang là bắt buộc.',
            'page_number.integer' => 'Số trang phải là một số nguyên.',
            'page_number.min' => 'Số trang phải lớn hơn 0.',
            'page_number.unique' => 'Số trang này đã tồn tại cho chương này.',

            
            // Bulk upload messages
            'pages.required' => 'Danh sách trang là bắt buộc.',
            'pages.array' => 'Danh sách trang phải là một mảng.',
            'pages.min' => 'Phải có ít nhất 1 trang.',
            'pages.*.image_url.required' => 'URL hình ảnh cho trang :position là bắt buộc.',
            'pages.*.image_url.max' => 'URL hình ảnh cho trang :position không được vượt quá 500 ký tự.',
            'pages.*.page_number.required' => 'Số trang cho trang :position là bắt buộc.',
            'pages.*.page_number.integer' => 'Số trang cho trang :position phải là một số nguyên.',
            'pages.*.page_number.min' => 'Số trang cho trang :position phải lớn hơn 0.',

            
            // File upload messages
            'images.required' => 'Danh sách hình ảnh là bắt buộc.',
            'images.array' => 'Danh sách hình ảnh phải là một mảng.',
            'images.min' => 'Phải có ít nhất 1 hình ảnh.',
            'images.*.required' => 'Hình ảnh :position là bắt buộc.',
            'images.*.image' => 'File :position phải là một hình ảnh.',
            'images.*.mimes' => 'Hình ảnh :position phải có định dạng: jpeg, png, jpg, gif, webp.',
            'images.*.max' => 'Hình ảnh :position không được vượt quá 10MB.'
        ];
    }

    public function attributes(): array
    {
        return [
            'image_url' => 'URL hình ảnh',
            'page_number' => 'số trang',
            'pages' => 'danh sách trang',
            'images' => 'danh sách hình ảnh'
        ];
    }
}
