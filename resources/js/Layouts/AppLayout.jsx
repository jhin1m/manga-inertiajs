import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import SearchDialog from '@/Components/Common/SearchDialog';
import Footer from '@/Components/Layout/Footer';
import Header from '@/Components/Layout/Header';
import { Breadcrumb } from '@/Components/Layout/Breadcrumb';

export function AppLayout({ children, header, breadcrumbItems = [], hideHeader = false }) {
    const [searchOpen, setSearchOpen] = useState(false);

    // Keyboard shortcut for search (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen bg-background max-w-7xl mx-auto">
            {/* Header - Hide when hideHeader is true */}
            {!hideHeader && (
                <Header onSearchOpen={() => setSearchOpen(true)} />
            )}

            {/* Page Header */}
            {header && (
                <div className="border-b bg-muted/40">
                    <div className="container mx-auto px-4 py-6">
                        {header}
                    </div>
                </div>
            )}

            {/* Breadcrumb Navigation */}
            {breadcrumbItems.length > 0 && (
                <div className="border-b bg-muted/20">
                    <div className="container mx-auto px-4 py-3">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Search Dialog */}
            <SearchDialog 
                open={searchOpen} 
                setOpen={setSearchOpen}
            />
        </div>
    );
} 