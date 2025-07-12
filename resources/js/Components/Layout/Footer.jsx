import { Link } from '@inertiajs/react';
import { Badge } from "@/Components/ui/badge.jsx";
import { Separator } from "@/Components/ui/separator.jsx";
import { 
    BookOpen
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Manga List', href: route('manga.index'), icon: BookOpen },
        { name: 'Search', href: route('search'), icon: BookOpen },
    ];

    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <ApplicationLogo className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl text-primary">MangaReader</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Nền tảng đọc manga trực tuyến với trải nghiệm đọc mượt mà trên mọi thiết bị.
                        </p>
                        
                        {/* Version Badge */}
                        <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                                v1.0.0
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                Online
                            </Badge>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">Khám phá</h4>
                        <nav className="space-y-3">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                                >
                                    <link.icon className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                <Separator className="my-6" />

                {/* Bottom Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="text-sm text-muted-foreground">
                        <p>© {currentYear} MangaReader. Tất cả quyền được bảo lưu.</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Máy chủ hoạt động</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}