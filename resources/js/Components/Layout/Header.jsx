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
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/Components/ui/sheet.jsx";
import { VisuallyHidden } from "@/Components/ui/visually-hidden.jsx";
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
    Bookmark,
    History,
    Star,
    Tags,
    ChevronDown
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Header({ onSearchOpen }) {
    const { auth, appName, layoutTranslations = {}, genres = [] } = usePage().props;
    const user = auth?.user;
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [genresOpen, setGenresOpen] = useState(false);
    const [mobileGenresOpen, setMobileGenresOpen] = useState(false);

    const handleAuthClick = (e) => {
        e.preventDefault();
        alert('this function is being deployed');
    };

    const navigationItems = [
        { name: layoutTranslations.home || 'Home', href: route('home'), icon: Home, current: route().current('home') },
        { name: layoutTranslations.library || 'Library', href: route('manga.index'), icon: Library, current: route().current('manga.*') },
        { 
            name: layoutTranslations.genres || 'Genres', 
            href: '#', 
            icon: Tags, 
            current: false,
            hasDropdown: true,
            onClick: (e) => {
                e.preventDefault();
                setGenresOpen(!genresOpen);
            }
        },
        { name: layoutTranslations.bookmarks || 'Bookmarks', href: route('bookmarks'), icon: Bookmark, current: route().current('bookmarks') },
        { name: layoutTranslations.history || 'History', href: route('history'), icon: History, current: route().current('history') },
        { name: layoutTranslations.search || 'Search', href: route('search'), icon: Search, current: route().current('search') },
    ];

    // Group genres into rows of 6
    const genreRows = [];
    for (let i = 0; i < genres.length; i += 6) {
        genreRows.push(genres.slice(i, i + 6));
    }

    const userMenuItems = user ? [
        { name: layoutTranslations.favorites || 'Favorites', href: route('favorites'), icon: Heart },
        { name: layoutTranslations.ratings || 'Ratings', href: route('ratings'), icon: Star },
    ] : [];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center space-x-4">
                    <Link href={route('home')} className="flex items-center">
                        <ApplicationLogo className="h-8 text-primary" />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        {navigationItems.map((item) => (
                            <NavigationMenuItem key={item.name}>
                                {item.hasDropdown ? (
                                    <DropdownMenu open={genresOpen} onOpenChange={setGenresOpen}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none ${
                                                    item.current ? 'text-primary' : 'text-foreground'
                                                }`}
                                            >
                                                <item.icon className="mr-2 h-4 w-4" />
                                                {item.name}
                                                <ChevronDown className="ml-1 h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[600px] p-4 max-h-[400px] overflow-y-auto">
                                            <div className="space-y-3">
                                                {genreRows.map((row, rowIndex) => (
                                                    <div key={rowIndex} className="grid grid-cols-6 gap-2">
                                                        {row.map((genre) => (
                                                            <DropdownMenuItem key={genre.id} asChild>
                                                                <Link 
                                                                    href={route('genre.show', genre.slug)}
                                                                    className="flex flex-col items-center p-2 rounded-md hover:bg-accent text-center min-h-[60px] justify-center"
                                                                >
                                                                    <span className="text-xs font-medium text-foreground truncate w-full">
                                                                        {genre.name}
                                                                    </span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </div>
                                                ))}
                                                {genres.length > 0 && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link 
                                                                href={route('manga.index')}
                                                                className="w-full text-center text-primary hover:text-primary/80"
                                                            >
                                                                {layoutTranslations.view_all_genres || 'Xem tất cả thể loại'}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
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
                                )}
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
                                    {userMenuItems.length > 0 && (
                                        <>
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
                                        </>
                                    )}
                                    {userMenuItems.length === 0 && <DropdownMenuSeparator />}
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
                            <Button variant="ghost" onClick={handleAuthClick}>
                                {layoutTranslations.login || 'Login'}
                            </Button>
                            <Button onClick={handleAuthClick}>
                                {layoutTranslations.register || 'Register'}
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
                            <VisuallyHidden>
                                <SheetTitle>{layoutTranslations.navigation || 'Navigation'}</SheetTitle>
                                <SheetDescription>
                                    {layoutTranslations.mobile_menu_description || 'Mobile navigation menu'}
                                </SheetDescription>
                            </VisuallyHidden>
                            
                            <div className="flex flex-col h-full">
                                {/* Mobile Logo */}
                                <div className="flex items-center pb-4">
                                    <ApplicationLogo className="h-8 text-primary" />
                                </div>
                                
                                <Separator />

                                {/* Mobile Navigation */}
                                <ScrollArea className="flex-1 py-4">
                                    <div className="space-y-2">
                                        {navigationItems.map((item) => (
                                            item.hasDropdown ? (
                                                <div key={item.name} className="space-y-2">
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-between"
                                                        onClick={() => setMobileGenresOpen(!mobileGenresOpen)}
                                                    >
                                                        <div className="flex items-center">
                                                            <item.icon className="mr-2 h-4 w-4" />
                                                            {item.name}
                                                        </div>
                                                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileGenresOpen ? 'rotate-180' : ''}`} />
                                                    </Button>
                                                    {mobileGenresOpen && (
                                                        <div className="ml-6 max-h-60 overflow-y-auto">
                                                            <div className="grid grid-cols-2 gap-1">
                                                                {genres.map((genre) => (
                                                                    <Button
                                                                        key={genre.id}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="w-full justify-start text-sm"
                                                                        asChild
                                                                    >
                                                                        <Link href={route('genre.show', genre.slug)}>
                                                                            {genre.name}
                                                                        </Link>
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                            {genres.length > 0 && (
                                                                <>
                                                                    <Separator className="my-2" />
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="w-full justify-start text-sm text-primary"
                                                                        asChild
                                                                    >
                                                                        <Link href={route('manga.index')}>
                                                                            <Tags className="mr-2 h-3 w-3" />
                                                                            {layoutTranslations.view_all_genres || 'View All Genres'}
                                                                        </Link>
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
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
                                            )
                                        ))}
                                        
                                        {user && userMenuItems.length > 0 && (
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
                                                    {layoutTranslations.logout || 'Logout'}
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Button className="w-full" onClick={handleAuthClick}>
                                                {layoutTranslations.login || 'Login'}
                                            </Button>
                                            <Button variant="outline" className="w-full" onClick={handleAuthClick}>
                                                {layoutTranslations.register || 'Register'}
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