import { Link } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/ui/pagination';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';

export function Paginator({ paginator, translations = {}, className, preserveScroll = false }) {
    const isMobile = useIsMobile();
    const t = {
        previous: translations.pagination?.previous || 'Previous',
        next: translations.pagination?.next || 'Next',
    };

    if (!paginator || !paginator.links || paginator.links.length <= 3) {
        return null;
    }

    return (
        <Pagination className={cn("mt-6", className)}>
            <PaginationContent>
                {paginator.links.map((link, index) => {
                    // On mobile, limit the number of page links shown
                    if (isMobile) {
                        const currentPage = paginator.current_page;
                        const isFirstOrLastLink = index === 0 || index === paginator.links.length - 1;
                        
                        if (!isFirstOrLastLink) {
                            const pageNum = parseInt(link.label);
                            // Hide links that are not the ellipsis and are too far from the current page
                            if (!isNaN(pageNum) && Math.abs(pageNum - currentPage) > 1) {
                                return null; // Show only current, one page before, and one page after
                            }
                        }
                    }

                    // Handle Previous link
                    if (index === 0) {
                        const prevLinkProps = link.url ? { as: Link, href: link.url } : { as: 'button' };
                        return (
                            <PaginationItem key="prev">
                                <PaginationPrevious
                                    {...prevLinkProps}
                                    preserveScroll={preserveScroll}
                                    disabled={!link.url}
                                >
                                    {t.previous}
                                </PaginationPrevious>
                            </PaginationItem>
                        );
                    }
                    // Handle Next link
                    if (index === paginator.links.length - 1) {
                        const nextLinkProps = link.url ? { as: Link, href: link.url } : { as: 'button' };
                        return (
                            <PaginationItem key="next">
                                <PaginationNext
                                    {...nextLinkProps}
                                    preserveScroll={preserveScroll}
                                    disabled={!link.url}
                                >
                                    {t.next}
                                </PaginationNext>
                            </PaginationItem>
                        );
                    }
                    // Handle Ellipsis
                    if (link.label.includes('...')) {
                        return (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }
                    // Handle Page number links
                    return (
                        <PaginationItem key={link.label}>
                            <PaginationLink
                                as={Link}
                                href={link.url}
                                preserveScroll={preserveScroll}
                                isActive={link.active}
                            >
                                {link.label}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
            </PaginationContent>
        </Pagination>
    );
}