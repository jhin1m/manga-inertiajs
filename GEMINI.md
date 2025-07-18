## 1. Chiến lược Đa ngôn ngữ (Localization)

*   **Phương pháp:** Backend-driven localization. Toàn bộ quá trình dịch thuật được xử lý ở phía Laravel. Frontend (React) chỉ nhận và hiển thị các chuỗi đã được dịch sẵn.
*   **File ngôn ngữ:**
    *   Sử dụng các file `.php` trong thư mục `resources/lang/` (ví dụ: `resources/lang/vi/manga.php`, `resources/lang/en/page.php`).
    *   **Không sử dụng** các file `.json` cho localization frontend.
*   **Cách sử dụng:**
    *   **Backend:** Sử dụng helper `__()` của Laravel để lấy bản dịch (ví dụ: `__('manga.statuses.ongoing')`).
    *   **Model:** Các chuỗi hiển thị liên quan đến model (ví dụ: trạng thái của Manga) được xử lý thông qua **Eloquent Accessors** (ví dụ: `statusLabel()` trong `App\Models\Manga.php`) để tự động dịch khi truy cập thuộc tính ảo (ví dụ: `$manga->status_label`).
    *   **Controller:** Truyền các chuỗi đã dịch (hoặc các đối tượng model đã có accessor) xuống frontend thông qua props của Inertia.
    *   **Frontend (React):** Các component React chỉ nhận và hiển thị các chuỗi đã được dịch từ props. Không có logic dịch thuật nào trong frontend.
*   **Thay đổi ngôn ngữ:** Ngôn ngữ của toàn bộ website được kiểm soát bởi cấu hình `locale` trong `config/app.php`. Người dùng không thể tự thay đổi ngôn ngữ trên website.