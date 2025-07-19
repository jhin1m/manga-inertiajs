import { Head } from '@inertiajs/react'
import { AppLayout } from '@/Layouts/AppLayout'
import { BreadcrumbBuilder } from '@/Components/Layout/Breadcrumb'
import BookmarkList from '@/Components/Bookmark/BookmarkList'
import SeoHead from '@/Components/SeoHead'

export default function BookmarksIndex({ translations = {}, seo = {} }) {
    // Build breadcrumb
    const breadcrumbItems = new BreadcrumbBuilder()
        .addCustom(translations.bookmarks || 'Bookmarks', null)
        .build()

    // Default SEO if not provided
    const defaultSeo = {
        title: translations.bookmarks_page_title || 'My Bookmarks',
        description: translations.bookmarks_page_description || 'Manage your bookmarked manga and chapters.',
        robots: 'noindex, nofollow' // Private user data
    }

    const finalSeo = { ...defaultSeo, ...seo }

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            <SeoHead seo={finalSeo} />
            <Head title={finalSeo.title} />
            
            <div className="container mx-auto px-4 py-6">
                <BookmarkList translations={translations} />
            </div>
        </AppLayout>
    )
}