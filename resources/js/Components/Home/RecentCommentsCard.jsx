import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar.jsx";
import { MessageCircle, Clock } from "lucide-react";
import { Link } from "@inertiajs/react";
import { formatRelativeTime } from "@/lib/formatters";

export function RecentCommentsCard({ comments = [] }) {
    // Demo data nếu không có data từ backend
    const defaultComments = [
        {
            id: 1,
            user: {
                name: "Manga Fan",
                avatar: "/api/placeholder/32/32"
            },
            manga: {
                name: "One Piece",
                slug: "one-piece"
            },
            chapter: {
                chapter_number: 1098
            },
            content: "Chapter này hay quá! Luffy đã mạnh hơn rất nhiều so với trước...",
            created_at: "2024-01-15T10:30:00Z"
        },
        {
            id: 2,
            user: {
                name: "Otaku King",
                avatar: "/api/placeholder/32/32"
            },
            manga: {
                name: "Attack on Titan",
                slug: "attack-on-titan"
            },
            chapter: {
                chapter_number: 139
            },
            content: "Kết thúc perfect! Không thể tốt hơn được nữa rồi",
            created_at: "2024-01-15T09:15:00Z"
        },
        {
            id: 3,
            user: {
                name: "Reader Pro",
                avatar: "/api/placeholder/32/32"
            },
            manga: {
                name: "Naruto",
                slug: "naruto"
            },
            chapter: {
                chapter_number: 700
            },
            content: "Sasuke vs Naruto battle cuối cùng quá epic!",
            created_at: "2024-01-15T08:45:00Z"
        },
        {
            id: 4,
            user: {
                name: "Manga Lover",
                avatar: "/api/placeholder/32/32"
            },
            manga: {
                name: "Dragon Ball",
                slug: "dragon-ball"
            },
            chapter: {
                chapter_number: 42
            },
            content: "Goku lúc nhỏ dễ thương quá đi mất",
            created_at: "2024-01-15T07:20:00Z"
        }
    ];

    const displayComments = comments.length > 0 ? comments : defaultComments;



    const truncateContent = (content, maxLength = 60) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + "...";
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Bình luận gần đây
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {displayComments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                        {/* User Info */}
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage 
                                    src={comment.user.avatar} 
                                    alt={comment.user.name}
                                />
                                <AvatarFallback className="text-xs">
                                    {comment.user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                                {comment.user.name}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(comment.created_at)}
                            </div>
                        </div>

                        {/* Comment Content */}
                        <div className="pl-8">
                            <p className="text-sm text-muted-foreground mb-1">
                                {truncateContent(comment.content)}
                            </p>
                            <Link
                                href={`/manga/${comment.manga.slug}/chapter/${comment.chapter.chapter_number}`}
                                className="text-xs text-primary hover:underline"
                            >
                                {comment.manga.name} - Chapter {comment.chapter.chapter_number}
                            </Link>
                        </div>
                    </div>
                ))}

                {/* View All Button */}
                <Link
                    href="/comments"
                    className="block w-full text-center text-sm text-primary hover:underline pt-3 border-t"
                >
                    Xem tất cả bình luận →
                </Link>
            </CardContent>
        </Card>
    );
} 