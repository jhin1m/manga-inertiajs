import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Breadcrumb as ShadcnBreadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb.jsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { 
    Sheet, 
    SheetContent, 
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from "@/Components/ui/sheet.jsx";
import { VisuallyHidden } from "@/Components/ui/visually-hidden.jsx";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ChevronDown, Home } from 'lucide-react';

export function Breadcrumb({ items = [], className = "" }) {
    const { breadcrumbTranslations = {} } = usePage().props;
    const isMobile = useIsMobile();
    
    // Luôn có Home làm item đầu tiên
    const allItems = [
        { label: breadcrumbTranslations.home || 'Trang chủ', href: route('home'), icon: Home },
        ...items
    ];

    // Số items hiển thị trước khi collapse
    const ITEMS_TO_DISPLAY = isMobile ? 2 : 3;

    // Helper function để render icon
    const renderIcon = (IconComponent, className = "mr-1 h-4 w-4") => {
        if (!IconComponent) return null;
        return React.createElement(IconComponent, { className });
    };

    // Nếu ít items thì hiển thị tất cả
    if (allItems.length <= ITEMS_TO_DISPLAY) {
        return (
            <ShadcnBreadcrumb className={className}>
                <BreadcrumbList>
                    {allItems.map((item, index) => {
                        const isLast = index === allItems.length - 1;
                        return (
                            <React.Fragment key={index}>
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage className="flex items-center">
                                            {renderIcon(item.icon)}
                                            <span className="max-w-[150px] sm:max-w-[200px] truncate">
                                                {item.label}
                                            </span>
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link 
                                                href={item.href}
                                                className="flex items-center hover:text-foreground"
                                            >
                                                {renderIcon(item.icon)}
                                                <span className="max-w-[120px] sm:max-w-[150px] truncate">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && <BreadcrumbSeparator />}
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </ShadcnBreadcrumb>
        );
    }

    // Nếu nhiều items thì sử dụng dropdown/drawer
    const hiddenItems = allItems.slice(1, -1);
    const firstItem = allItems[0];
    const lastItem = allItems[allItems.length - 1];

    if (isMobile) {
        // Mobile: Sử dụng Sheet (drawer)
        return (
            <ShadcnBreadcrumb className={className}>
                <BreadcrumbList>
                    {/* Home */}
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={firstItem.href} className="flex items-center">
                                {renderIcon(firstItem.icon)}
                                <span className="sr-only sm:not-sr-only sm:inline">
                                    {firstItem.label}
                                </span>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    
                    {hiddenItems.length > 0 && (
                        <React.Fragment>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 text-muted-foreground hover:text-foreground"
                                            aria-label={breadcrumbTranslations.more || 'Xem thêm'}
                                        >
                                            <BreadcrumbEllipsis className="h-4 w-4" />
                                            <span className="sr-only">{breadcrumbTranslations.more || 'Xem thêm'}</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="h-[300px]">
                                        <VisuallyHidden>
                                            <SheetTitle>{breadcrumbTranslations.navigation || 'Đường dẫn'}</SheetTitle>
                                            <SheetDescription>
                                                Danh sách đường dẫn điều hướng
                                            </SheetDescription>
                                        </VisuallyHidden>
                                        <div className="py-4">
                                            <h3 className="font-semibold mb-4">{breadcrumbTranslations.navigation || 'Đường dẫn'}</h3>
                                            <div className="space-y-2">
                                                {hiddenItems.map((item, index) => (
                                                    <Link
                                                        key={index}
                                                        href={item.href}
                                                        className="flex items-center p-2 rounded-md hover:bg-accent transition-colors"
                                                    >
                                                        {renderIcon(item.icon, "mr-2 h-4 w-4")}
                                                        <span className="truncate">{item.label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </BreadcrumbItem>
                        </React.Fragment>
                    )}
                    
                    {/* Current page */}
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="flex items-center">
                            {renderIcon(lastItem.icon)}
                            <span className="max-w-[120px] truncate">
                                {lastItem.label}
                            </span>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </ShadcnBreadcrumb>
        );
    }

    // Desktop: Sử dụng DropdownMenu
    return (
        <ShadcnBreadcrumb className={className}>
            <BreadcrumbList>
                {/* Home */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={firstItem.href} className="flex items-center">
                            {renderIcon(firstItem.icon)}
                            {firstItem.label}
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                
                {hiddenItems.length > 0 && (
                    <React.Fragment>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 text-muted-foreground hover:text-foreground"
                                        aria-label={breadcrumbTranslations.more || 'Xem thêm'}
                                    >
                                        <BreadcrumbEllipsis className="h-4 w-4" />
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                        <span className="sr-only">{breadcrumbTranslations.more || 'Xem thêm'}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    {hiddenItems.map((item, index) => (
                                        <DropdownMenuItem key={index} asChild>
                                            <Link href={item.href} className="flex items-center">
                                                {renderIcon(item.icon, "mr-2 h-4 w-4")}
                                                <span className="truncate">{item.label}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                    </React.Fragment>
                )}
                
                {/* Current page */}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center">
                        {renderIcon(lastItem.icon)}
                        <span className="max-w-[200px] truncate">
                            {lastItem.label}
                        </span>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </ShadcnBreadcrumb>
    );
}

// Helper component để tạo breadcrumb items dễ dàng hơn với Ziggy
export function BreadcrumbBuilder() {
    const { breadcrumbTranslations = {} } = usePage().props;
    const items = [];
    
    const builder = {
        add: (label, href, icon = null) => {
            items.push({ label, href, icon });
            return builder;
        },
        
        addManga: (manga) => {
            items.push({ 
                label: manga.name || manga.title, 
                href: route('manga.show', manga.slug),
                icon: null 
            });
            return builder;
        },
        
        addChapter: (chapter, manga) => {
            const chapterNumber = chapter.chapter_number || chapter.number;
            const chapterSlug = chapter.slug || chapterNumber;
            const mangaSlug = manga?.slug || chapter.manga_slug;
            
            items.push({ 
                label: (breadcrumbTranslations.chapter_prefix || 'Chương :number').replace(':number', chapterNumber), 
                href: route('manga.chapters.show', [mangaSlug, chapterSlug]),
                icon: null 
            });
            return builder;
        },
        
        addGenre: (genre) => {
            items.push({ 
                label: genre.name, 
                href: route('genre.show', genre.slug),
                icon: null 
            });
            return builder;
        },
        
        addAuthor: (author) => {
            items.push({ 
                label: author.name, 
                href: route('author.show', author.slug),
                icon: null 
            });
            return builder;
        },
        
        addArtist: (artist) => {
            items.push({ 
                label: artist.name, 
                href: route('artist.show', artist.slug),
                icon: null 
            });
            return builder;
        },
        
        addTag: (tag) => {
            items.push({ 
                label: tag.name, 
                href: route('tag.show', tag.slug),
                icon: null 
            });
            return builder;
        },
        
        addMangaList: () => {
            items.push({
                label: breadcrumbTranslations.manga_list || 'Danh sách manga',
                href: route('manga.index'),
                icon: null
            });
            return builder;
        },
        
        addChapterList: (manga) => {
            items.push({
                label: breadcrumbTranslations.chapter_list || 'Danh sách chương',
                href: route('manga.chapters.index', manga.slug),
                icon: null
            });
            return builder;
        },
        
        addSearch: (query = '') => {
            items.push({
                label: query ? (breadcrumbTranslations.search_results || 'Kết quả tìm kiếm') : (breadcrumbTranslations.search || 'Tìm kiếm'),
                href: route('search', query ? { q: query } : {}),
                icon: null
            });
            return builder;
        },
        
        build: () => items
    };
    
    return builder;
}

// Default export for backward compatibility
export default Breadcrumb;