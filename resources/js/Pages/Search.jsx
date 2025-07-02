import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
    Search, 
    BookOpen, 
    TrendingUp,
    Tag
} from 'lucide-react';

export default function SearchPage({ query = '' }) {
    const [searchQuery, setSearchQuery] = useState(query);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.visit(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Sample popular searches (sẽ được thay thế bằng data thực từ backend)
    const popularManga = [
        'One Piece', 'Naruto', 'Attack on Titan', 'Demon Slayer', 'My Hero Academia'
    ];

    const popularGenres = [
        'Action', 'Romance', 'Comedy', 'Drama', 'Fantasy', 'Adventure', 'Supernatural'
    ];

    return (
        <AppLayout>
            <Head title={`Tìm kiếm${query ? `: ${query}` : ''}`} />

            <div className="container mx-auto px-4 py-8">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-6">Tìm kiếm</h1>
                    
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm manga, tác giả, thể loại..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSearch}>
                            <Search className="h-4 w-4 mr-2" />
                            Tìm kiếm
                        </Button>
                    </div>
                </div>

                {/* Search Results */}
                {query ? (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">
                                Kết quả tìm kiếm cho "{query}"
                            </h2>
                            <p className="text-muted-foreground">
                                Đang phát triển... Tính năng tìm kiếm sẽ được hoàn thiện trong Phase 3
                            </p>
                        </div>

                        <div className="text-center py-12">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Tính năng đang phát triển</h3>
                            <p className="text-muted-foreground mb-4">
                                Search functionality sẽ được implement trong Phase 3 với backend integration
                            </p>
                            <Button asChild variant="outline">
                                <Link href="/">
                                    Quay về trang chủ
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* No Search Query - Show Popular */
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Manga phổ biến
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {popularManga.map((manga, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery(manga);
                                            router.visit(`/search?q=${encodeURIComponent(manga)}`);
                                        }}
                                    >
                                        <BookOpen className="h-3 w-3 mr-1" />
                                        {manga}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Tag className="h-5 w-5 text-primary" />
                                Thể loại phổ biến
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {popularGenres.map((genre, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery(genre);
                                            router.visit(`/search?q=${encodeURIComponent(genre)}`);
                                        }}
                                    >
                                        <Tag className="h-3 w-3 mr-1" />
                                        {genre}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-2">💡 Gợi ý tìm kiếm</h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Tìm theo tên manga: "One Piece", "Naruto"</li>
                                    <li>• Tìm theo tác giả: "Eiichiro Oda", "Masashi Kishimoto"</li>
                                    <li>• Tìm theo thể loại: "Action", "Romance", "Comedy"</li>
                                    <li>• Sử dụng Ctrl/Cmd + K để mở search nhanh</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
} 