import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, TrendingUp, Medal, Crown, Award } from "lucide-react";
import { Link } from "@inertiajs/react";
import { formatViews } from "@/lib/formatters";

export function RankingsCard({ rankings = [] }) {
    // Demo data chỉ dùng khi không có dữ liệu từ backend
    const defaultRankings = [
        {
            id: 1,
            name: "One Piece",
            slug: "one-piece",
            cover: "/api/placeholder/60/80",
            rating: 4.9,
            views: 1250000,
            rank: 1
        },
        {
            id: 2,
            name: "Attack on Titan",
            slug: "attack-on-titan", 
            cover: "/api/placeholder/60/80",
            rating: 4.8,
            views: 1100000,
            rank: 2
        },
        {
            id: 3,
            name: "Naruto",
            slug: "naruto",
            cover: "/api/placeholder/60/80",
            rating: 4.7,
            views: 980000,
            rank: 3
        },
        {
            id: 4,
            name: "Dragon Ball",
            slug: "dragon-ball",
            cover: "/api/placeholder/60/80",
            rating: 4.6,
            views: 850000,
            rank: 4
        },
        {
            id: 5,
            name: "Death Note",
            slug: "death-note",
            cover: "/api/placeholder/60/80",
            rating: 4.5,
            views: 720000,
            rank: 5
        }
    ];

    // Ưu tiên dữ liệu từ backend, fallback về demo data
    const displayRankings = rankings.length > 0 ? rankings : defaultRankings;

    // Debug log để kiểm tra dữ liệu
    console.log('Rankings Data:', displayRankings.slice(0, 3));

    const getRankIcon = (rank) => {
        switch(rank) {
            case 1:
                return <Crown className="h-4 w-4 text-yellow-500" />;
            case 2:
                return <Medal className="h-4 w-4 text-gray-400" />;
            case 3:
                return <Award className="h-4 w-4 text-amber-600" />;
            default:
                return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
        }
    };



    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Top Manga
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {displayRankings.map((manga) => (
                    <Link
                        key={manga.id}
                        href={`/manga/${manga.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                        {/* Rank Icon */}
                        <div className="flex items-center justify-center w-6">
                            {getRankIcon(manga.rank)}
                        </div>

                        {/* Cover Image */}
                        <div className="relative flex-shrink-0">
                            <Avatar className="h-12 w-9 rounded-md">
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
                            <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                {manga.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-muted-foreground">
                                        {manga.rating}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatViews(manga.views)} views
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* View All Button */}
                <Link
                    href="/manga?sort=popular"
                    className="block w-full text-center text-sm text-primary hover:underline pt-2 border-t"
                >
                    Xem tất cả rankings →
                </Link>
            </CardContent>
        </Card>
    );
} 