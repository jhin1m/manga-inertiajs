<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChapterRequest extends FormRequest
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
        $mangaId = $this->route('manga')?->id;
        $chapterId = $this->route('chapter')?->id;

        return [
            'title' => 'required|string|max:' . config('upload.validation.chapter_title_max'),
            'chapter_number' => [
                'required',
                'numeric',
                'min:' . config('upload.validation.chapter_number_min'),
                Rule::unique('chapters')
                    ->where('manga_id', $mangaId)
                    ->ignore($chapterId)
            ],
            'volume_number' => 'nullable|integer|min:' . config('upload.validation.volume_number_min'),
            'published_at' => 'nullable|date|before_or_equal:now',
            'views' => 'nullable|integer|min:0'
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Tiêu đề chương là bắt buộc.',
            'title.max' => 'Tiêu đề chương không được vượt quá 255 ký tự.',
            'chapter_number.required' => 'Số chương là bắt buộc.',
            'chapter_number.numeric' => 'Số chương phải là một số.',
            'chapter_number.min' => 'Số chương không được nhỏ hơn 0.',
            'chapter_number.unique' => 'Số chương này đã tồn tại cho manga này.',
            'volume_number.integer' => 'Số tập phải là một số nguyên.',
            'volume_number.min' => 'Số tập phải lớn hơn 0.',
            'published_at.date' => 'Ngày xuất bản phải là một ngày hợp lệ.',
            'published_at.before_or_equal' => 'Ngày xuất bản không được lớn hơn ngày hiện tại.',
            'views.integer' => 'Số lượt xem phải là một số nguyên.',
            'views.min' => 'Số lượt xem không được nhỏ hơn 0.'
        ];
    }

    public function attributes(): array
    {
        return [
            'title' => 'tiêu đề chương',
            'chapter_number' => 'số chương',
            'volume_number' => 'số tập',
            'published_at' => 'ngày xuất bản',
            'views' => 'số lượt xem'
        ];
    }
}
