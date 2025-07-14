import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from "@/Components/ui/button.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar.jsx";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu.jsx";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet.jsx";
import { ScrollArea } from "@/Components/ui/scroll-area.jsx";
import { Separator } from "@/Components/ui/separator.jsx";
import { 
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/Components/ui/navigation-menu.jsx";
import { 
    Home, 
    Search, 
    Library, 
    Settings, 
    LogOut, 
    Menu,
    Heart,
    History,
    Star
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Header({ onSearchOpen }) {
    const { auth, appName, layoutTranslations = {} } = usePage().props;
    const user = auth?.user;
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigationItems = [
        { name: layoutTranslations.home || 'Home', href: route('home'), icon: Home, current: route().current('home') },
        { name: layoutTranslations.library || 'Library', href: route('manga.index'), icon: Library, current: route().current('manga.*') },
        { name: layoutTranslations.search || 'Search', href: route('search'), icon: Search, current: route().current('search') },
    ];

    const userMenuItems = user ? [
        { name: layoutTranslations.favorites || 'Favorites', href: route('favorites'), icon: Heart },
        { name: layoutTranslations.history || 'History', href: route('history'), icon: History },
        { name: layoutTranslations.ratings || 'Ratings', href: route('ratings'), icon: Star },
    ] : [];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center space-x-4">
                    <Link href={route('home')} className="flex items-center space-x-2">
                        <ApplicationLogo className="h-8 w-8 text-primary" />
                        <span className="font-bold text-xl text-primary">{appName || 'MangaReader'}</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        {navigationItems.map((item) => (
                            <NavigationMenuItem key={item.name}>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href={item.href}
                                        className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${
                                            item.current ? 'text-primary' : 'text-foreground'
                                        }`}
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.name}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Search Button */}
                <div className="flex-1 max-w-md mx-4 hidden md:flex">
                    <Button
                        variant="outline"
                        className="w-full justify-start text-muted-foreground"
                        onClick={onSearchOpen}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        <span className="flex-1 text-left">{layoutTranslations.search_placeholder || 'Search manga...'}</span>
                        <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 hidden sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>
                </div>

                {/* User Menu / Auth Buttons */}
                <div className="flex items-center space-x-4">
                    {/* Mobile Search Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={onSearchOpen}
                    >
                        <Search className="h-5 w-5" />
                        <span className="sr-only">{layoutTranslations.search || 'Search'}</span>
                    </Button>

                    {user ? (
                        <>
                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {userMenuItems.map((item) => (
                                        <DropdownMenuItem key={item.name} asChild>
                                            <Link href={item.href} className="flex items-center">
                                                <item.icon className="mr-2 h-4 w-4" />
                                                <span>{item.name}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('profile.edit')} className="flex items-center">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>{layoutTranslations.settings || 'Settings'}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex items-center w-full"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>{layoutTranslations.logout || 'Logout'}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center space-x-2">
                            <Button variant="ghost" asChild>
                                <Link href={route('login')}>{layoutTranslations.login || 'Login'}</Link>
                            </Button>
                            <Button asChild>
                                <Link href={route('register')}>{layoutTranslations.register || 'Register'}</Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu Trigger */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                className="md:hidden"
                                size="icon"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">{layoutTranslations.toggle_menu || 'Toggle menu'}</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <div className="flex flex-col h-full">
                                {/* Mobile Logo */}
                                <div className="flex items-center space-x-2 pb-4">
                                    <ApplicationLogo className="h-6 w-6 text-primary" />
                                    <span className="font-bold text-lg text-primary">{appName || 'MangaReader'}</span>
                                </div>
                                
                                <Separator />

                                {/* Mobile Navigation */}
                                <ScrollArea className="flex-1 py-4">
                                    <div className="space-y-2">
                                        {navigationItems.map((item) => (
                                            <Button
                                                key={item.name}
                                                variant={item.current ? "secondary" : "ghost"}
                                                className="w-full justify-start"
                                                asChild
                                            >
                                                <Link href={item.href}>
                                                    <item.icon className="mr-2 h-4 w-4" />
                                                    {item.name}
                                                </Link>
                                            </Button>
                                        ))}
                                        
                                        {user && (
                                            <>
                                                <Separator className="my-4" />
                                                <div className="space-y-2">
                                                    {userMenuItems.map((item) => (
                                                        <Button
                                                            key={item.name}
                                                            variant="ghost"
                                                            className="w-full justify-start"
                                                            asChild
                                                        >
                                                            <Link href={item.href}>
                                                                <item.icon className="mr-2 h-4 w-4" />
                                                                {item.name}
                                                            </Link>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </ScrollArea>

                                {/* Mobile User Section */}
                                <div className="border-t pt-4">
                                    {user ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 px-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <Button variant="ghost" className="w-full justify-start" asChild>
                                                <Link href={route('profile.edit')}>
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    {layoutTranslations.settings || 'Settings'}
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" className="w-full justify-start" asChild>
                                                <Link
                                                    href={route('logout')}
                                                    method="post"
                                                    as="button"
                                                >
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    {layoutTranslations.logout || 'Đăng xuất'}
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Button className="w-full" asChild>
                                                <Link href={route('login')}>{layoutTranslations.login || 'Login'}</Link>
                                            </Button>
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href={route('register')}>{layoutTranslations.register || 'Register'}</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}