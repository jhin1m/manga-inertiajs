<?php

return [
    'statuses' => [
        'ongoing' => 'Đang tiến hành',
        'completed' => 'Hoàn thành',
        'hiatus' => 'Tạm dừng',
        'cancelled' => 'Đã hủy',
    ],
    'status_label' => 'Trạng thái',
    'author_label' => 'Tác giả',
    'artist_label' => 'Họa sĩ',
    'genre_label' => 'Thể loại',
    'description_label' => 'Mô tả',
    'rating_label' => 'Đánh giá',
    'views_label' => 'Lượt xem',
    'chapters_label' => 'Chương',
    'no_rating' => 'Chưa có đánh giá',
    'ratings_count' => 'lượt',
    'read_now' => 'Đọc ngay',
    'read_first' => 'Đọc từ đầu',
    'read_last' => 'Đọc chương mới',
    'favorite' => 'Yêu thích',
    'expand_more' => 'Xem thêm',
    'collapse' => 'Thu gọn',

    // Index page
    'index' => [
        'title' => 'Danh sách manga',
        'found_count' => 'Tìm thấy :count manga',
        'no_manga_found' => 'Không tìm thấy manga',
        'no_manga_message' => 'Thử thay đổi bộ lọc để tìm thêm manga',
        'empty_message' => 'Không có manga nào để hiển thị',
        'no_manga_title' => 'Chưa có manga',
        'no_chapters' => 'Chưa có chapter',
        'loading' => 'Đang tải...',
        'chapters_count' => ':count chương',
        'views_count' => ':count lượt xem',
        'sort_by' => [
            'latest' => 'Mới nhất',
            'popular' => 'Phổ biến',
            'rating' => 'Đánh giá cao',
            'title' => 'Tên A-Z',
        ],
        'filters' => [
            'title' => 'Bộ lọc',
            'reset' => 'Đặt lại',
            'sort_by' => 'Sắp xếp theo',
            'sort_placeholder' => 'Chọn cách sắp xếp',
            'status' => 'Trạng thái',
            'all' => 'Tất cả',
            'year' => 'Năm phát hành',
            'year_placeholder' => 'Chọn năm',
            'applying' => 'đang áp dụng',
            'clear_all' => 'Xóa tất cả',
            'close' => 'Đóng',
            'apply' => 'Áp dụng',
            'latest' => 'Mới nhất',
            'oldest' => 'Cũ nhất',
            'views' => 'Lượt xem nhiều nhất',
            'rating' => 'Đánh giá cao nhất',
            'name_asc' => 'Tên A-Z',
            'name_desc' => 'Tên Z-A',
        ],
    ],

    // ChapterList component
    'chapter_list' => [
        'title' => 'Danh sách chương',
        'chapter_column' => 'Chương',
        'title_column' => 'Tiêu đề',
        'updated_column' => 'Ngày cập nhật',
        'read_column' => 'Đọc',
        'read_button' => 'Đọc',
        'chapter_prefix' => 'Chương',
        'chapter_short' => 'Ch.',
        'previous' => 'Trước',
        'next' => 'Tiếp',
    ],

    // Taxonomy pages
    'taxonomy' => [
        'genre_title' => 'Thể loại: :name',
        'genre_description' => 'Danh sách manga thuộc thể loại :name',
        'author_title' => 'Tác giả: :name',
        'author_description' => 'Danh sách manga của tác giả :name',
        'artist_title' => 'Họa sĩ: :name',
        'artist_description' => 'Danh sách manga của họa sĩ :name',
        'tag_title' => 'Tag: :name',
        'tag_description' => 'Danh sách manga có tag :name',
    ],

    // Rankings Card
    'rankings' => [
        'title' => 'Xếp hạng Manga',
        'no_data' => 'Chưa có dữ liệu xếp hạng',
        'view_all' => 'Xem tất cả xếp hạng →',
        'views' => 'lượt xem',
    ],

    // Recommended Card
    'recommended' => [
        'title' => 'Đề xuất cho bạn',
        'no_data' => 'Chưa có đề xuất nào',
        'view_all' => 'Xem thêm đề xuất →',
        'rating_reason' => 'Đánh giá :rating/5',
    ],
];
