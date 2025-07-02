import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    Breadcrumb as ShadcnBreadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ChevronDown, Home } from 'lucide-react';

export default function Breadcrumb({ items = [], className = "" }) {
    const isMobile = useIsMobile();
    
    // Luôn có Home làm item đầu tiên
    const allItems = [
        { label: 'Trang chủ', href: '/', icon: Home },
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
                                        >
                                            <BreadcrumbEllipsis className="h-4 w-4" />
                                            <span className="sr-only">Xem thêm</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="h-[300px]">
                                        <div className="py-4">
                                            <h3 className="font-semibold mb-4">Đường dẫn</h3>
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
                                    >
                                        <BreadcrumbEllipsis className="h-4 w-4" />
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                        <span className="sr-only">Xem thêm</span>
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

// Helper component để tạo breadcrumb items dễ dàng hơn
export function BreadcrumbBuilder() {
    const items = [];
    
    const builder = {
        add: (label, href, icon = null) => {
            items.push({ label, href, icon });
            return builder;
        },
        addManga: (manga) => {
            items.push({ 
                label: manga.title, 
                href: `/manga/${manga.slug}`,
                icon: null 
            });
            return builder;
        },
        addChapter: (chapter) => {
            items.push({ 
                label: `Chapter ${chapter.number}`, 
                href: `/manga/${chapter.manga_slug}/chapter/${chapter.number}`,
                icon: null 
            });
            return builder;
        },
        addGenre: (genre) => {
            items.push({ 
                label: genre.name, 
                href: `/genres/${genre.slug}`,
                icon: null 
            });
            return builder;
        },
        build: () => items
    };
    
    return builder;
} 