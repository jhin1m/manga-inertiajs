// Demo file - Cách sử dụng Breadcrumb component và BreadcrumbBuilder helper

import { BreadcrumbBuilder } from './Breadcrumb';
import { BookOpen, User, Tag } from 'lucide-react';

// ===== EXAMPLE 1: Sử dụng Breadcrumb component trực tiếp =====

// Trong page component:
export function MangaDetailPage({ manga }) {
    const breadcrumbItems = [
        { label: 'Thư viện', href: '/manga', icon: BookOpen },
        { label: manga.title, href: `/manga/${manga.slug}` }
    ];

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            {/* Page content */}
        </AppLayout>
    );
}

// ===== EXAMPLE 2: Sử dụng BreadcrumbBuilder helper =====

export function ChapterReaderPage({ manga, chapter }) {
    const breadcrumbItems = new BreadcrumbBuilder()
        .add('Thư viện', '/manga', BookOpen)
        .addManga(manga)
        .addChapter(chapter)
        .build();

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            {/* Reader content */}
        </AppLayout>
    );
}

// ===== EXAMPLE 3: Genre page với nhiều levels =====

export function GenrePage({ genre, subGenre = null }) {
    const builder = new BreadcrumbBuilder()
        .add('Thể loại', '/genres', Tag);
    
    if (subGenre) {
        builder
            .addGenre(genre)
            .addGenre(subGenre);
    } else {
        builder.addGenre(genre);
    }

    const breadcrumbItems = builder.build();

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            {/* Genre content */}
        </AppLayout>
    );
}

// ===== EXAMPLE 4: Author page =====

export function AuthorPage({ author }) {
    const breadcrumbItems = [
        { label: 'Tác giả', href: '/authors', icon: User },
        { label: author.name, href: `/authors/${author.slug}` }
    ];

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            {/* Author content */}
        </AppLayout>
    );
}

// ===== EXAMPLE 5: Deep nested navigation =====

export function DeepNestedPage() {
    const breadcrumbItems = new BreadcrumbBuilder()
        .add('Thư viện', '/manga', BookOpen)
        .add('Action', '/genres/action', Tag)
        .add('Shounen', '/genres/action/shounen', Tag)
        .add('One Piece', '/manga/one-piece')
        .add('Chapter 1000', '/manga/one-piece/chapter/1000')
        .build();

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            {/* Deep content */}
        </AppLayout>
    );
}

// ===== NOTES =====

/*
Features của Breadcrumb component:

1. **Responsive Design:**
   - Mobile: Hiển thị Home + ... + Current (với drawer cho hidden items)
   - Desktop: Hiển thị Home + ... + Current (với dropdown cho hidden items)

2. **Auto-collapse:**
   - Mobile: Collapse khi > 2 items
   - Desktop: Collapse khi > 3 items

3. **Smart truncation:**
   - Text tự động truncate với max-width responsive
   - Mobile: 120px, Desktop: 200px

4. **Icon support:**
   - Mỗi breadcrumb item có thể có icon
   - Home luôn có Home icon

5. **Helper methods:**
   - BreadcrumbBuilder.addManga(manga)
   - BreadcrumbBuilder.addChapter(chapter)  
   - BreadcrumbBuilder.addGenre(genre)
   - BreadcrumbBuilder.add(label, href, icon)

6. **Accessibility:**
   - Screen reader support
   - Proper ARIA labels
   - Keyboard navigation

Usage trong AppLayout:
- Truyền breadcrumbItems prop vào AppLayout
- Breadcrumb sẽ tự động hiển thị giữa header và main content
- Nếu không có breadcrumbItems thì sẽ ẩn breadcrumb section
*/ 