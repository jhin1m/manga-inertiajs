import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
    BookOpen, 
    TrendingUp, 
    Star, 
    Users, 
    Clock,
    ArrowRight,
    Search,
    Heart
} from 'lucide-react';

export default function Home({ canLogin, canRegister }) {
    // Demo data - sẽ được thay thế bằng data thực từ backend
    const featuredManga = [
        {
            id: 1,
            title: "One Piece",
            author: "Oda Eiichiro",
            cover: "/api/placeholder/200/280",
            rating: 4.8,
            chapters: 1098,
            status: "Ongoing",
            genres: ["Action", "Adventure", "Comedy"]
        },
        {
            id: 2,
            title: "Naruto",
            author: "Masashi Kishimoto",
            cover: "/api/placeholder/200/280",
            rating: 4.7,
            chapters: 700,
            status: "Completed",
            genres: ["Action", "Adventure", "Martial Arts"]
        },
        {
            id: 3,
            title: "Attack on Titan",
            author: "Hajime Isayama",
            cover: "/api/placeholder/200/280",
            rating: 4.9,
            chapters: 139,
            status: "Completed",
            genres: ["Action", "Drama", "Fantasy"]
        }
    ];

    const stats = [
        { label: "Manga", value: "10,000+", icon: BookOpen },
        { label: "Chapters", value: "500K+", icon: Clock },
        { label: "Users", value: "1M+", icon: Users },
        { label: "Rating", value: "4.8/5", icon: Star }
    ];

    return (
        <AppLayout>
            <Head title="Trang chủ - MangaReader" />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                            Đọc Manga
                            <span className="text-primary"> Miễn Phí</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Khám phá thế giới manga với hàng ngàn truyện tranh chất lượng cao. 
                            Đọc online miễn phí với trải nghiệm tốt nhất.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="text-lg px-8" asChild>
                                <a href="/manga">
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    Khám phá ngay
                                </a>
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                                <a href="/search">
                                    <Search className="mr-2 h-5 w-5" />
                                    Tìm kiếm
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                                    <stat.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-muted-foreground">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Manga */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">
                                Manga Nổi Bật
                            </h2>
                            <p className="text-muted-foreground">
                                Những bộ manga được yêu thích nhất
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <a href="/manga">
                                Xem tất cả
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredManga.map((manga) => (
                            <Card key={manga.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="aspect-[3/4] relative bg-muted">
                                    <img 
                                        src={manga.cover} 
                                        alt={manga.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="text-white font-medium">{manga.rating}</span>
                                            <Badge variant={manga.status === 'Ongoing' ? 'default' : 'secondary'} className="ml-auto">
                                                {manga.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{manga.title}</CardTitle>
                                    <CardDescription>{manga.author}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {manga.genres.slice(0, 3).map((genre) => (
                                            <Badge key={genre} variant="outline" className="text-xs">
                                                {genre}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                        <span>{manga.chapters} chapters</span>
                                        <div className="flex items-center gap-1">
                                            <Heart className="h-4 w-4" />
                                            <span>1.2k</span>
                                        </div>
                                    </div>
                                    <Button className="w-full" asChild>
                                        <a href={`/manga/${manga.id}`}>
                                            Đọc ngay
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            Tại sao chọn MangaReader?
                        </h2>
                        <p className="text-muted-foreground">
                            Trải nghiệm đọc manga tốt nhất với các tính năng hiện đại
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                                    <BookOpen className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Thư viện khổng lồ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center">
                                    Hàng ngàn bộ manga từ các thể loại khác nhau, 
                                    cập nhật liên tục các chapter mới nhất.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Chất lượng cao</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center">
                                    Hình ảnh sắc nét, tốc độ tải nhanh, 
                                    trải nghiệm đọc mượt mà trên mọi thiết bị.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Cộng đồng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center">
                                    Tham gia cộng đồng độc giả, 
                                    chia sẻ và thảo luận về những bộ manga yêu thích.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!canLogin && (
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <Card className="max-w-2xl mx-auto text-center">
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    Bắt đầu hành trình manga của bạn
                                </CardTitle>
                                <CardDescription>
                                    Tạo tài khoản miễn phí để lưu manga yêu thích và theo dõi tiến trình đọc
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                                {canRegister && (
                                    <Button size="lg" asChild>
                                        <a href="/register">Đăng ký miễn phí</a>
                                    </Button>
                                )}
                                <Button size="lg" variant="outline" asChild>
                                    <a href="/login">Đăng nhập</a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}
        </AppLayout>
    );
} 