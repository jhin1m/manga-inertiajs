import { Head, Link } from '@inertiajs/react'
import { AppLayout } from '@/Layouts/AppLayout'
import { MangaHeader } from '@/Components/Manga/MangaHeader'
import { MangaInfo } from '@/Components/Manga/MangaInfo'
import { ChapterList } from '@/Components/Manga/ChapterList'
import { 
    Breadcrumb, 
    BreadcrumbItem, 
    BreadcrumbLink, 
    BreadcrumbList, 
    BreadcrumbPage, 
    BreadcrumbSeparator 
} from '@/Components/ui/breadcrumb'

export default function MangaShow({ manga, chapters }) {
    return (
        <AppLayout>
            <Head title={manga.name} />
            
            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Trang chủ</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/manga">Manga</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{manga.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Manga Header - Cover + Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 mb-8">
                    <MangaHeader manga={manga} />
                </div>

                {/* Manga Info - Description + Genres */}
                <MangaInfo manga={manga} />

                {/* Chapter List */}
                <ChapterList manga={manga} chapters={chapters} />
            </div>
        </AppLayout>
    )
} 