import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar.jsx";
import { MessageCircle, Clock } from "lucide-react";
import { Link } from "@inertiajs/react";
import { formatRelativeTime } from "@/lib/formatters";

export function RecentCommentsCard({ comments = [] }) {
    if (!comments || comments.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        Bình luận gần đây
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <div className="text-muted-foreground">
                        Chưa có bình luận nào
                    </div>
                </CardContent>
            </Card>
        );
    }



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
                {comments.map((comment) => (
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
                                href={`/manga/${comment.manga.slug}/chapters/${comment.chapter.slug || 'chapter-' + comment.chapter.chapter_number}`}
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