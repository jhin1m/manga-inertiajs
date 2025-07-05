# Hướng dẫn Deploy Dự án Lên VPS

Tài liệu này hướng dẫn các bước cần thiết để deploy dự án sau khi đã hoàn thành các thiết lập cơ bản cho VPS (đã cài PHP, Nginx, MySQL và đã clone source code).

## Các bước thực hiện

### 1. Cài đặt Dependencies

Đầu tiên, bạn cần cài đặt các gói phụ thuộc của cả backend (Composer) và frontend (PNPM).

```bash
# Sao chép file cấu hình môi trường
cp .env.example .env

# Cài đặt các gói PHP cho production (không bao gồm dev dependencies)
composer install --no-dev --optimize-autoloader

# Cài đặt các gói JavaScript
# Sử dụng pnpm vì dự án có file pnpm-lock.yaml
pnpm install
```

### 2. Cấu hình Môi trường (.env)

Mở file `.env` và cập nhật các thông tin cần thiết:

```ini
# Sửa APP_ENV thành production và tắt debug
APP_ENV=production
APP_DEBUG=false

# Đặt URL của website
APP_URL=https://your-domain.com

# Cấu hình kết nối Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD="your_database_password"

# ... các cấu hình khác nếu cần
```

Sau khi chỉnh sửa file `.env`, hãy tạo Application Key:

```bash
php artisan key:generate
```

### 3. Chạy Database Migrations

Thực thi các file migration để tạo cấu trúc bảng trong database.

```bash
php artisan migrate --force
```

*Lưu ý: Cờ `--force` là cần thiết khi chạy ở môi trường production để xác nhận bạn thực sự muốn chạy migration.*

### 4. Build Frontend Assets

Biên dịch các tài nguyên frontend (React, CSS) cho production bằng Vite.

```bash
pnpm run build
```

### 5. Tối ưu hóa cho Production

Laravel cung cấp các lệnh để cache các file config và route, giúp tăng tốc độ ứng dụng.

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### 6. Liên kết Thư mục Storage

Tạo một symbolic link từ `public/storage` đến `storage/app/public` để các file được upload có thể truy cập từ bên ngoài.

```bash
php artisan storage:link
```

### 7. Phân quyền Thư mục

Đảm bảo web server (thường là `www-data`) có quyền ghi vào các thư mục `storage` và `bootstrap/cache`.

```bash
# Thay www-data:www-data bằng user và group của web server trên VPS của bạn
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

Sau khi hoàn thành các bước trên, dự án của bạn sẽ sẵn sàng hoạt động. Đừng quên trỏ domain vào thư mục `public` của dự án trong cấu hình Nginx.
