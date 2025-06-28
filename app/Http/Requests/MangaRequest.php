<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MangaRequest extends FormRequest
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

        return [
            'name' => 'required|string|max:255',
            'alternative_names' => 'nullable|array',
            'description' => 'nullable|string',
            'status' => 'required|in:ongoing,completed,hiatus,cancelled',
            'cover' => 'nullable|string|max:500',
            'slug' => 'required|string|unique:mangas,slug,' . $mangaId,
            'rating' => 'nullable|numeric|min:0|max:10',
            'total_rating' => 'nullable|integer|min:0',
            'views' => 'nullable|integer|min:0',
            'genre_ids' => 'nullable|array',
            'genre_ids.*' => 'exists:taxonomy_terms,id',
            'author_ids' => 'nullable|array',
            'author_ids.*' => 'exists:taxonomy_terms,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:taxonomy_terms,id'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên manga là bắt buộc.',
            'name.max' => 'Tên manga không được vượt quá 255 ký tự.',
            'alternative_names.array' => 'Tên thay thế phải là một mảng.',
            'status.required' => 'Trạng thái manga là bắt buộc.',
            'status.in' => 'Trạng thái manga phải là một trong: đang tiến hành, hoàn thành, tạm dừng, đã hủy.',
            'cover.max' => 'URL ảnh bìa không được vượt quá 500 ký tự.',
            'slug.required' => 'Slug là bắt buộc.',
            'slug.unique' => 'Slug này đã được sử dụng.',
            'rating.numeric' => 'Đánh giá phải là một số.',
            'rating.min' => 'Đánh giá không được nhỏ hơn 0.',
            'rating.max' => 'Đánh giá không được lớn hơn 10.',
            'total_rating.integer' => 'Tổng đánh giá phải là một số nguyên.',
            'total_rating.min' => 'Tổng đánh giá không được nhỏ hơn 0.',
            'views.integer' => 'Số lượt xem phải là một số nguyên.',
            'views.min' => 'Số lượt xem không được nhỏ hơn 0.',
            'genre_ids.array' => 'Danh sách thể loại phải là một mảng.',
            'genre_ids.*.exists' => 'Thể loại được chọn không tồn tại.',
            'author_ids.array' => 'Danh sách tác giả phải là một mảng.',
            'author_ids.*.exists' => 'Tác giả được chọn không tồn tại.',
            'tag_ids.array' => 'Danh sách tag phải là một mảng.',
            'tag_ids.*.exists' => 'Tag được chọn không tồn tại.'
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'tên manga',
            'alternative_names' => 'tên thay thế',
            'description' => 'mô tả',
            'status' => 'trạng thái',
            'cover' => 'ảnh bìa',
            'slug' => 'slug',
            'rating' => 'đánh giá',
            'total_rating' => 'tổng đánh giá',
            'views' => 'số lượt xem',
            'genre_ids' => 'thể loại',
            'author_ids' => 'tác giả',
            'tag_ids' => 'tag'
        ];
    }
}
