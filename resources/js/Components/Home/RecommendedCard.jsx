import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar.jsx";
import { Star, Heart, Sparkles } from "lucide-react";
import { Link } from "@inertiajs/react";

export function RecommendedCard({ recommended = [] }) {
    // Demo data chỉ dùng khi không có dữ liệu từ backend
    const defaultRecommended = [
        {
            id: 1,
            name: "Jujutsu Kaisen",
            slug: "jujutsu-kaisen",
            cover: "/api/placeholder/80/100",
            rating: 4.8,
            reason: "Dựa trên lịch sử đọc của bạn"
        },
        {
            id: 2,
            name: "Demon Slayer",
            slug: "demon-slayer",
            cover: "/api/placeholder/80/100",
            rating: 4.7,
            reason: "Manga trending"
        },
        {
            id: 3,
            name: "My Hero Academia",
            slug: "my-hero-academia",
            cover: "/api/placeholder/80/100",
            rating: 4.6,
            reason: "Tương tự manga đã đọc"
        },
        {
            id: 4,
            name: "Tokyo Ghoul",
            slug: "tokyo-ghoul",
            cover: "/api/placeholder/80/100",
            rating: 4.5,
            reason: "Đánh giá cao"
        }
    ];

    // Ưu tiên dữ liệu từ backend, fallback về demo data
    const displayRecommended = recommended.length > 0 ? recommended : defaultRecommended;

    // Debug log chỉ trong development
    if (process.env.NODE_ENV === 'development') {
        console.log('Recommended Data:', displayRecommended.slice(0, 3));
    }

    const getReasonIcon = (reason) => {
        if (reason && reason.includes("lịch sử")) {
            return <Heart className="h-3 w-3 text-red-500" />;
        } else if (reason && reason.includes("trending")) {
            return <Sparkles className="h-3 w-3 text-purple-500" />;
        } else if (reason && reason.includes("tương tự")) {
            return <Star className="h-3 w-3 text-blue-500" />;
        }
        return <Star className="h-3 w-3 text-yellow-500" />;
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Đề xuất cho bạn
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {displayRecommended.map((manga) => (
                    <Link
                        key={manga.id}
                        href={`/manga/${manga.slug}`}
                        className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                        {/* Cover Image */}
                        <div className="relative flex-shrink-0">
                            <Avatar className="h-16 w-12 rounded-md">
                                <AvatarImage 
                                    src={manga.cover} 
                                    alt={manga.name}
                                    className="object-cover"
                                />
                                <AvatarFallback className="rounded-md text-xs">
                                    {manga.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Manga Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                {manga.name}
                            </h4>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-2">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-muted-foreground">
                                    {manga.rating}
                                </span>
                            </div>

                            {/* Recommendation Reason */}
                            {(manga.reason || manga.rating >= 4.5) && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    {getReasonIcon(manga.reason)}
                                    <span className="line-clamp-1">
                                        {manga.reason || `Đánh giá ${manga.rating}/5`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}

                {/* View All Button */}
                <Link
                    href="/manga?sort=recommended"
                    className="block w-full text-center text-sm text-primary hover:underline pt-3 border-t"
                >
                    Xem thêm đề xuất →
                </Link>
            </CardContent>
        </Card>
    );
} 