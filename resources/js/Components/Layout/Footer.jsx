import { Link } from '@inertiajs/react';
import { Badge } from "@/Components/ui/badge.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Separator } from "@/Components/ui/separator.jsx";
import { Card, CardContent } from "@/Components/ui/card.jsx";
import { 
    BookOpen, 
    Heart, 
    Mail, 
    Github, 
    Twitter, 
    Facebook,
    Instagram,
    MessageCircle,
    HelpCircle,
    Shield,
    Users
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Thư viện Manga', href: '/manga', icon: BookOpen },
        { name: 'Manga mới', href: '/manga?sort=latest', icon: BookOpen },
        { name: 'Manga hot', href: '/manga?sort=popular', icon: Heart },
        { name: 'Thể loại', href: '/genres', icon: BookOpen },
    ];

    const supportLinks = [
        { name: 'Trợ giúp', href: '/help', icon: HelpCircle },
        { name: 'Liên hệ', href: '/contact', icon: Mail },
        { name: 'Báo lỗi', href: '/report', icon: MessageCircle },
        { name: 'FAQ', href: '/faq', icon: HelpCircle },
    ];

    const legalLinks = [
        { name: 'Chính sách bảo mật', href: '/privacy', icon: Shield },
        { name: 'Điều khoản sử dụng', href: '/terms', icon: Shield },
        { name: 'Bản quyền', href: '/copyright', icon: Shield },
        { name: 'Cộng đồng', href: '/community', icon: Users },
    ];

    const socialLinks = [
        { name: 'Facebook', href: '#', icon: Facebook, color: 'text-blue-600' },
        { name: 'Twitter', href: '#', icon: Twitter, color: 'text-sky-500' },
        { name: 'Instagram', href: '#', icon: Instagram, color: 'text-pink-500' },
        { name: 'Github', href: '#', icon: Github, color: 'text-gray-900' },
    ];

    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-8 lg:py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center space-x-2">
                            <ApplicationLogo className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl text-primary">MangaReader</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Nền tảng đọc manga trực tuyến hàng đầu với hàng nghìn bộ truyện chất lượng cao. 
                            Trải nghiệm đọc mượt mà trên mọi thiết bị.
                        </p>
                        
                        {/* Version & Status Badges */}
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                                v1.0.0
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                Beta
                            </Badge>
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                Online
                            </Badge>
                        </div>

                        {/* Social Media */}
                        <div className="flex space-x-2">
                            {socialLinks.map((social) => (
                                <Button
                                    key={social.name}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-accent"
                                    asChild
                                >
                                    <Link href={social.href} target="_blank" rel="noopener noreferrer">
                                        <social.icon className={`h-4 w-4 ${social.color}`} />
                                        <span className="sr-only">{social.name}</span>
                                    </Link>
                                </Button>
                            ))}
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

                    {/* Support Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">Hỗ trợ</h4>
                        <nav className="space-y-3">
                            {supportLinks.map((link) => (
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

                    {/* Legal & Community */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">Pháp lý</h4>
                        <nav className="space-y-3">
                            {legalLinks.map((link) => (
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

                <Separator className="my-8" />

                {/* Bottom Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
                        <p>© {currentYear} MangaReader. Tất cả quyền được bảo lưu.</p>
                        <span className="hidden sm:inline">•</span>
                        <p>Được xây dựng với ❤️ bằng React + Laravel</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Máy chủ hoạt động</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
} 