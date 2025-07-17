import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar.jsx";
import { Star, TrendingUp, Medal, Crown, Award } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { formatViews } from "@/lib/formatters";

export function RankingsCard({ rankings = [] }) {
    const { mangaTranslations = {} } = usePage().props;
    const rankingsT = mangaTranslations.rankings || {};
    if (!rankings || rankings.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        {rankingsT.title || 'Xếp hạng Manga'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <div className="text-muted-foreground">
                        {rankingsT.no_data || 'Chưa có dữ liệu xếp hạng'}
                    </div>
                </CardContent>
            </Card>
        );
    }

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
                    {rankingsT.title || 'Xếp hạng Manga'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {rankings.map((manga) => (
                    <Link
                        key={manga.id}
                        href={route('manga.show', manga.slug)}
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
                                <AvatarFallback className="rounded-md bg-muted">
                                    <img src="/default.jpg" alt="Manga cover placeholder" className="w-full h-full object-contain p-1" />
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
                                    {formatViews(manga.views)} {rankingsT.views || 'lượt xem'}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* View All Button */}
                <Link
                    href={route('manga.index', { sort: 'popular' })}
                    className="block w-full text-center text-sm text-primary hover:underline pt-2 border-t"
                >
                    {rankingsT.view_all || 'Xem tất cả xếp hạng →'}
                </Link>
            </CardContent>
        </Card>
    );
}
 