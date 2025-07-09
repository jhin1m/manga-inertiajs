import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar.jsx";
import { Star, Heart, Sparkles } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { getContextualDefaultCover, isValidCover } from '@/lib/image-utils.jsx';

export function RecommendedCard({ recommended = [] }) {
    const { mangaTranslations = {} } = usePage().props;
    const recommendedT = mangaTranslations.recommended || {};
    if (!recommended || recommended.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {recommendedT.title || 'Đề xuất cho bạn'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <div className="text-muted-foreground">
                        {recommendedT.no_data || 'Chưa có đề xuất nào'}
                    </div>
                </CardContent>
            </Card>
        );
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
                    {recommendedT.title || 'Đề xuất cho bạn'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {recommended.map((manga) => (
                    <Link
                        key={manga.id}
                        href={route('manga.show', manga.slug)}
                        className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                        {/* Cover Image */}
                        <div className="relative flex-shrink-0">
                            <Avatar className="h-16 w-12 rounded-md">
                                {isValidCover(manga.cover) ? (
                                    <AvatarImage 
                                        src={manga.cover} 
                                        alt={manga.name}
                                        className="object-cover"
                                    />
                                ) : (
                                    <AvatarFallback className="rounded-md text-xs">
                                        {getContextualDefaultCover('comment')}
                                    </AvatarFallback>
                                )}
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
                                        {manga.reason || (recommendedT.rating_reason || 'Đánh giá :rating/5').replace(':rating', manga.rating)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}

                {/* View All Button */}
                <Link
                    href={route('manga.index', { sort: 'recommended' })}
                    className="block w-full text-center text-sm text-primary hover:underline pt-3 border-t"
                >
                    {recommendedT.view_all || 'Xem thêm đề xuất →'}
                </Link>
            </CardContent>
        </Card>
    );
} 