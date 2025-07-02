# 🗺️ Lộ trình phát triển Manga Reader

## 📊 Tình trạng hiện tại
- ✅ Database schema hoàn chỉnh (6 tables)
- ✅ Models với relationships đầy đủ
- ✅ Performance indexes tối ưu
- ✅ Authentication system (Laravel Breeze)
- ✅ React + InertiaJS setup cơ bản
- ✅ Tailwind CSS styling

---

## 🚀 Phase 1: Backend Foundation (Week 1-2)

### 🎯 Mục tiêu
Xây dựng nền tảng backend với Web Controllers và Services sử dụng InertiaJS

### 📋 Tasks

#### 1.1 Web Controllers với Inertia Responses
- [ ] **MangaController** - Web controller với Inertia responses
  - `index()` - Render MangaIndex với data: manga list, filters, pagination
  - `show()` - Render MangaShow với data: manga detail, chapters
  - `store()` - Xử lý form submission tạo manga mới (admin)
  - `update()` - Xử lý form submission cập nhật manga (admin)
  - `destroy()` - Xóa manga và redirect (admin)

- [ ] **ChapterController** - Quản lý chapters với Inertia
  - `index()` - Render ChapterIndex với chapters của manga
  - `show()` - Render ChapterReader với chapter detail và pages
  - `store()` - Xử lý form submission tạo chapter
  - `update()` - Xử lý form submission cập nhật chapter
  - `destroy()` - Xóa chapter và redirect

- [ ] **PageController** - Quản lý pages với Inertia
  - `index()` - Render PageManager với pages của chapter
  - `store()` - Xử lý upload pages (multipart form)
  - `destroy()` - Xóa page và redirect

- [ ] **TaxonomyController** - Quản lý genres, tags, authors
  - `index()` - Render TaxonomyIndex với taxonomies
  - `show()` - Render TaxonomyShow với terms và manga
  - CRUD operations với Inertia responses

#### 1.2 Request Validation
- [ ] **MangaRequest** - Validation rules cho manga
- [ ] **ChapterRequest** - Validation rules cho chapters
- [ ] **PageRequest** - Validation rules cho pages
- [ ] **TaxonomyRequest** - Validation rules cho taxonomies

#### 1.3 Services
- [ ] **MangaService** - Business logic cho manga operations
- [ ] **ChapterService** - Business logic cho chapter operations
- [ ] **FileUploadService** - Xử lý upload và storage files
- [ ] **SearchService** - Logic tìm kiếm và filtering

#### 1.4 Sample Data
- [ ] **MangaSeeder** - Tạo sample manga data với đầy đủ thông tin
- [ ] **ChapterSeeder** - Tạo sample chapters với pages
- [ ] **PageSeeder** - Tạo sample page data
- [ ] Liên kết manga với taxonomies (genres, authors, tags)

### 🎁 Deliverables
- Web controllers với Inertia responses hoạt động đầy đủ
- Sample data để test trên frontend
- Form validation working

---

## 🎨 Phase 2: Frontend Core (Week 3-4)

### 🎯 Mục tiêu
Setup shadcn/ui và xây dựng components layout cho frontend React

### 📋 Tasks

#### 2.1 Shadcn/UI Setup
- [ ] **Install shadcn/ui** - Setup shadcn/ui với Tailwind CSS
- [ ] **Configure components** - Setup components.json và utils
- [ ] **Base components** - Install Button, Card, Input, Badge, Avatar
- [ ] **Navigation components** - Install NavigationMenu, Breadcrumb, Sheet
- [ ] **Data components** - Install Table, Pagination, Dialog, Tabs
- [ ] **Form components** - Install Form, Select, Checkbox, RadioGroup
- [ ] **Feedback components** - Install Toast, Alert, Skeleton, Progress

#### 2.2 Layout System với Shadcn/UI
- [ ] **AppLayout** - Layout chính sử dụng shadcn/ui components
- [ ] **Header** - NavigationMenu với Command search, DropdownMenu user
- [ ] **Sidebar** - Sheet component cho mobile, ScrollArea cho filters
- [ ] **Footer** - Simple footer với shadcn/ui styling
- [ ] **Breadcrumb** - Breadcrumb component cho navigation

#### 2.3 Manga Components với Shadcn/UI
- [ ] **MangaCard** - Card component với Badge, Avatar, Button
- [ ] **MangaList** - Grid layout với shadcn/ui Card components
- [ ] **MangaDetail** - Tabs, Badge, Button, Separator components
- [ ] **MangaFilters** - Select, Checkbox, RadioGroup, Slider components
- [ ] **MangaSearch** - Command component với search suggestions

#### 2.4 Chapter Components với Shadcn/UI
- [ ] **ChapterList** - Table hoặc Card layout với Pagination
- [ ] **ChapterCard** - Card với Progress, Badge components
- [ ] **ChapterReader** - Custom reader với shadcn/ui controls
- [ ] **PageNavigation** - Button, Slider components cho navigation

#### 2.5 Common Components từ Shadcn/UI
- [ ] **LoadingSpinner** - Skeleton components cho loading states
- [ ] **Pagination** - Pagination component cho lists
- [ ] **Modal** - Dialog component cho confirmations
- [ ] **Toast** - Toast notifications system từ shadcn/ui
- [ ] **ImageWithFallback** - Custom component với shadcn/ui styling

#### 2.6 Pages Components với Shadcn/UI
- [x] **Home Basic** - Homepage cơ bản với Card, Badge, Button layouts
- [ ] **Home Advanced** - Homepage với Hot Slider + Sidebar + Rankings
- [ ] **MangaIndex** - Browse page với Table, Pagination, Filters
- [ ] **MangaShow** - Detail page với Tabs, Badge, Button components
- [ ] **ChapterShow** - Reader page với custom controls + shadcn/ui
- [ ] **Search** - Search page với Command, Card components
- [ ] **NotFound** - 404 page với shadcn/ui styling

#### 2.7 Home Advanced Layout (New)
- [ ] **Hot Manga Slider** - Horizontal scroll với responsive breakpoints
  - Mobile: 2 items (`w-[calc(50%-8px)]`)
  - Tablet: 3 items (`w-[calc(33.333%-16px)]`)
  - Desktop: 5 items (`w-[calc(20%-16px)]`)
  - Large: 6 items (`w-[calc(16.666%-16px)]`)
- [ ] **Main Grid Layout** - CSS Grid `grid-cols-1 lg:grid-cols-[2fr_1fr]`
- [ ] **Latest Update Grid** - Responsive manga grid với hover effects
- [ ] **Sidebar Components**:
  - Rankings Card với top manga list
  - Recent Comments Card với avatar + preview
  - Recommended Manga Card với ratings + genres
- [ ] **Responsive Behavior** - Mobile/Tablet/Desktop optimized
- [ ] **Animations** - Smooth transitions và hover effects

### 🎁 Deliverables
- Shadcn/ui setup hoàn chỉnh với all essential components
- Responsive layout system sử dụng shadcn/ui components
- Custom manga components built trên shadcn/ui foundation
- Basic navigation working với Inertia + shadcn/ui

---

## ⚡ Phase 3: Core Features (Week 5-6)

### 🎯 Mục tiêu
Implement các tính năng chính của manga reader

### 📋 Tasks

#### 3.1 Manga Listing & Filtering
- [ ] **Homepage** - Featured manga, latest updates, popular
- [ ] **Browse page** - All manga với advanced filtering
- [ ] **Search functionality** - Full-text search manga, authors
- [ ] **Filter system** - Theo genre, status, rating, year
- [ ] **Sort options** - Popular, latest, alphabetical, rating
- [ ] **Pagination** - Efficient pagination với Inertia

#### 3.2 Manga Detail Page
- [ ] **Manga info display** - Cover, description, metadata
- [ ] **Chapter list** - Organized chapter listing
- [ ] **Related manga** - Suggestions based on genres
- [ ] **Tags & genres** - Clickable navigation tags
- [ ] **Statistics** - Views, favorites, chapters count

#### 3.3 Chapter Reader
- [ ] **Page viewer** - Optimized image display
- [ ] **Navigation controls** - Previous/Next page, chapter
- [ ] **Reading modes** - Single page, continuous scroll
- [ ] **Zoom functionality** - Zoom in/out với smooth controls
- [ ] **Keyboard shortcuts** - Arrow keys, spacebar navigation
- [ ] **Progress tracking** - Reading progress persistence

#### 3.4 Search & Discovery
- [ ] **Advanced search** - Multiple criteria search
- [ ] **Auto-suggestions** - Search autocomplete với Inertia
- [ ] **Popular searches** - Trending keywords display
- [ ] **Genre browsing** - Browse by categories

### 🎁 Deliverables
- Fully functional manga reader
- Advanced search và filtering
- Responsive reader trên all devices

---

## 🔧 Phase 4: Advanced Features (Week 7-8)

### 🎯 Mục tiêu
Thêm các tính năng nâng cao và admin panel

### 📋 Tasks

#### 4.1 File Upload System
- [ ] **Image upload** - Manga covers upload
- [ ] **Bulk upload** - Multiple pages upload
- [ ] **Image processing** - Resize, optimize, WebP conversion
- [ ] **Storage management** - Local/S3 storage options
- [ ] **Image validation** - File types, sizes, dimensions

#### 4.2 User Features
- [ ] **Favorites system** - Save favorite manga
- [ ] **Reading history** - Track reading progress
- [ ] **Bookmarks** - Bookmark specific chapters/pages
- [ ] **User profiles** - Basic profile management
- [ ] **Reading preferences** - Reading mode, theme settings

#### 4.3 Admin Panel
- [ ] **Dashboard** - Statistics overview, recent activity
- [ ] **Manga management** - CRUD operations với forms
- [ ] **Chapter management** - Upload, edit chapters
- [ ] **User management** - User roles, permissions
- [ ] **Content moderation** - Approve/reject submissions

#### 4.4 Content Management
- [ ] **Taxonomy management** - Manage genres, tags, authors
- [ ] **Bulk operations** - Mass updates, imports
- [ ] **Import/Export** - Data migration tools
- [ ] **Content validation** - Quality checks, duplicate detection

### 🎁 Deliverables
- Complete admin panel với Inertia
- File upload system working
- User management features

---

## 🚀 Phase 5: Optimization & Polish (Week 9-10)

### 🎯 Mục tiêu
Tối ưu hiệu suất và hoàn thiện ứng dụng

### 📋 Tasks

#### 5.1 Performance Optimization
- [ ] **Caching strategy** - Redis caching cho data
- [ ] **Image optimization** - WebP, lazy loading, CDN
- [ ] **Database optimization** - Query optimization, indexing
- [ ] **Inertia optimization** - Partial reloads, prefetching
- [ ] **Code splitting** - Lazy load React components

#### 5.2 SEO & Accessibility
- [ ] **Meta tags** - Dynamic SEO tags với Inertia
- [ ] **Sitemap** - XML sitemap generation
- [ ] **Schema markup** - Structured data cho manga
- [ ] **Accessibility** - ARIA labels, keyboard navigation
- [ ] **PWA features** - Service worker, offline reading

#### 5.3 Testing & Quality
- [ ] **Unit tests** - Backend logic testing với Pest
- [ ] **Feature tests** - Controller testing với Inertia
- [ ] **Frontend tests** - React component testing
- [ ] **E2E tests** - User flow testing với Playwright
- [ ] **Performance testing** - Load testing, optimization

#### 5.4 Production Ready
- [ ] **Error handling** - Comprehensive error pages
- [ ] **Logging** - Application logging và monitoring
- [ ] **Monitoring** - Health checks, performance monitoring
- [ ] **Security** - Security headers, CSRF, validation
- [ ] **Documentation** - Setup guide, deployment docs

### 🎁 Deliverables
- Production-ready manga reader
- Complete test coverage
- Deployment documentation

---

## 🛠️ Technical Stack Summary

### Backend
- **Framework**: Laravel 12
- **Database**: MySQL với optimized indexes
- **Authentication**: Laravel Sanctum (session-based)
- **File Storage**: Local/S3 với image processing
- **Caching**: Redis cho data caching
- **Queue**: Redis/Database cho background jobs

### Frontend
- **Framework**: React 18 với hooks
- **Bridge**: InertiaJS 2.0 (NO API layer)
- **UI Library**: Shadcn/ui components với Tailwind CSS
- **Styling**: Tailwind CSS với shadcn/ui theming
- **Icons**: Lucide React (từ shadcn/ui)
- **State**: React hooks + Inertia shared data
- **Build**: Vite với code splitting

### DevOps
- **Testing**: Pest PHP, Vitest, Playwright
- **CI/CD**: GitHub Actions
- **Deployment**: Laravel Forge/Docker
- **Monitoring**: Laravel Telescope, Sentry

---

## 📅 Timeline Overview

| Phase | Duration | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| 1 | Week 1-2 | Backend Foundation | Web Controllers, Services, Sample Data |
| 2 | Week 3-4 | Frontend Core | React Components, Layout, Pages |
| 3 | Week 5-6 | Core Features | Reader, Search, Filtering |
| 4 | Week 7-8 | Advanced Features | Admin panel, File upload, User features |
| 5 | Week 9-10 | Optimization | Performance, Testing, Production |

---

## 🎯 Next Steps

### Bước tiếp theo ngay (Phase 2.2):
1. **Home Advanced Layout** - Hot Slider + Sidebar components
2. **Responsive Grid System** - Mobile/Tablet/Desktop breakpoints
3. **Sidebar Cards** - Rankings, Comments, Recommendations
4. **Smooth Animations** - Hover effects và transitions
5. **Data Integration** - Connect với backend sample data

### Commands cần chạy:
```bash
# Install additional components for advanced homepage
pnpx shadcn@latest add carousel
pnpx shadcn@latest add aspect-ratio

# Create advanced homepage components
mkdir -p resources/js/Components/Home
mkdir -p resources/js/Components/Sidebar

# Test current setup
php artisan serve
pnpm run dev

# Kiểm tra sample data
php artisan tinker
>>> App\Models\Manga::with('taxonomyTerms')->take(10)->get()
```

### Example Home Advanced Layout Structure:
```jsx
// Home.jsx với advanced layout
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Star, TrendingUp, MessageCircle } from "lucide-react"

export function HomeAdvanced({ hotManga, latestUpdates, rankings, comments }) {
    return (
        <AppLayout>
            {/* Hot Manga Slider */}
            <section className="py-8">
                <div className="overflow-x-auto">
                    <div className="flex gap-4 pb-4">
                        {hotManga.map(manga => (
                            <div key={manga.id} className="w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(20%-16px)] xl:w-[calc(16.666%-16px)] flex-shrink-0">
                                <HotMangaCard manga={manga} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                {/* Latest Updates */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">Cập nhật mới nhất</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {latestUpdates.map(manga => (
                            <MangaCard key={manga.id} manga={manga} />
                        ))}
                    </div>
                </section>

                {/* Sidebar */}
                <aside className="space-y-6">
                    <RankingsCard rankings={rankings} />
                    <RecentCommentsCard comments={comments} />
                    <RecommendedCard />
                </aside>
            </div>
        </AppLayout>
    )
}
```

Sẵn sàng bắt đầu với Phase 2.2 - Home Advanced Layout không đại ca? 🚀 