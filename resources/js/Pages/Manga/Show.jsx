import { Head, Link } from '@inertiajs/react'
import { AppLayout } from '@/Layouts/AppLayout'
import { MangaHeader } from '@/Components/Manga/MangaHeader'
import { MangaInfo } from '@/Components/Manga/MangaInfo'
import { ChapterList } from '@/Components/Manga/ChapterList'
import { BreadcrumbBuilder } from '@/Components/Layout/Breadcrumb'
import SeoHead from '@/Components/SeoHead'

export default function MangaShow({ manga, chapters, seo, translations }) {
    // Sử dụng BreadcrumbBuilder để tạo breadcrumb
    const breadcrumbItems = new BreadcrumbBuilder()
        .addMangaList()
        .addManga(manga)
        .build();

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            <SeoHead seo={seo} />
            <Head title={manga.name} />
            
            <div className="container mx-auto px-4 py-6">
                {/* Manga Header - Cover + Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 mb-8">
                    <MangaHeader manga={manga} translations={translations} />
                </div>

                {/* Manga Info - Description + Genres */}
                <MangaInfo manga={manga} translations={translations} />

                {/* Chapter List */}
                <ChapterList 
                    chapters={chapters}
                    manga={manga}
                    translations={translations}
                />
            </div>
        </AppLayout>
    );
} 