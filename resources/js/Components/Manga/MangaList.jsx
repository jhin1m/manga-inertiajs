import React from "react";
import { Link } from "@inertiajs/react";
import { MangaCard } from "./MangaCard";
import { Card, CardContent } from "@/Components/ui/card";
import { getContextualDefaultCover, isValidCover } from "@/lib/image-utils.jsx";
import { formatRelativeTime } from "@/lib/formatters";

export function MangaList({
    mangas = [],
    variant = "grid",
    columns = "auto",
    className = "",
    showEmpty = true,
    emptyMessage = null,
    translations = {},
}) {
    const defaultEmptyMessage = emptyMessage || translations.empty_message || 'Hello World!';
    if (!mangas.length && showEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {translations.no_manga_title || '...'}
                </h3>
                <p className="text-gray-500 max-w-sm">{defaultEmptyMessage}</p>
            </div>
        );
    }

    // Grid columns configuration
    const getGridColumns = () => {
        if (columns !== "auto") return columns;

        // Default responsive grid
        return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    };

    const getListVariant = () => {
        switch (variant) {
            case "list":
                return "grid grid-cols-1 md:grid-cols-2 gap-3";
            case "compact":
                return `grid ${getGridColumns()} gap-3`;
            case "featured":
                return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
            default:
                return `grid ${getGridColumns()} gap-4`;
        }
    };

    // List item component for horizontal layout
    const MangaListItem = ({ manga }) => {
        // Get chapters to display (use recent_chapters if available, otherwise latest_chapter)
        const chaptersToShow =
            manga.recent_chapters?.length > 0
                ? manga.recent_chapters
                : manga.latest_chapter
                ? [manga.latest_chapter]
                : [];

        return (
            <Card className="group hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden">
                <div className="flex">
                    {/* Cover Image - Full bleed */}
                    <div className="w-26 h-40 bg-muted flex-shrink-0 overflow-hidden">
                        <Link href={route("manga.show", manga.slug)}>
                            {isValidCover(manga.cover) ? (
                                <img
                                    src={manga.cover}
                                    alt={manga.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                getContextualDefaultCover("list")
                            )}
                        </Link>
                    </div>

                    {/* Content */}
                    <CardContent className="p-3 flex-1 min-w-0">
                        <Link href={route("manga.show", manga.slug)}>
                            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                {manga.name}
                            </h3>
                        </Link>

                        <div className="space-y-1">
                            {chaptersToShow
                                .slice(0, 3)
                                .map((chapter, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between text-xs pt-0.5"
                                    >
                                        <Link
                                            href={
                                                chapter.slug
                                                    ? route(
                                                          "manga.chapters.show",
                                                          [
                                                              manga.slug,
                                                              chapter.slug,
                                                          ]
                                                      )
                                                    : route(
                                                          "manga.show",
                                                          manga.slug
                                                      )
                                            }
                                            className="flex items-center justify-between w-full text-primary truncate border border-primary/20 px-2 py-0.5 rounded-xl hover:border-primary/40 hover:bg-secondary"
                                        >
                                            <span className="flex-1 truncate">
                                                {chapter.title ||
                                                    `Chapter ${
                                                        chapter.chapter_number ||
                                                        chapter.number
                                                    }`}
                                            </span>
                                            <span className="text-muted-foreground ml-2 flex-shrink-0">
                                                {formatRelativeTime(
                                                    chapter.updated_at ||
                                                        chapter.created_at
                                                )}
                                            </span>
                                        </Link>
                                    </div>
                                ))}
                            {chaptersToShow.length === 0 && (
                                <div className="text-xs text-muted-foreground">
                                    {translations.no_chapters || 'No chapters yet'}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </div>
            </Card>
        );
    };

    return (
        <div className={`${getListVariant()} ${className}`}>
            {mangas.map((manga) =>
                variant === "list" ? (
                    <MangaListItem key={manga.id} manga={manga} />
                ) : (
                    <MangaCard
                        key={manga.id}
                        manga={manga}
                        variant={variant}
                        className={variant === "featured" ? "h-full" : ""}
                        translations={translations}
                    />
                )
            )}
        </div>
    );
}
