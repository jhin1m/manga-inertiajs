import { Head } from '@inertiajs/react'
import { AppLayout } from '@/Layouts/AppLayout'
import { BreadcrumbBuilder } from '@/Components/Layout/Breadcrumb'
import HistoryList from '@/Components/History/HistoryList'
import SeoHead from '@/Components/SeoHead'

export default function HistoryIndex({ translations = {}, seo = {} }) {
    // Build breadcrumb
    const breadcrumbItems = new BreadcrumbBuilder()
        .addCustom(translations.reading_history || 'Reading History', null)
        .build()

    // Default SEO if not provided
    const defaultSeo = {
        title: translations.history_page_title || 'Reading History',
        description: translations.history_page_description || 'View your manga reading history and progress.',
        robots: 'noindex, nofollow' // Private user data
    }

    const finalSeo = { ...defaultSeo, ...seo }

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            <SeoHead seo={finalSeo} />
            <Head title={finalSeo.title} />
            
            <div className="container mx-auto px-4 py-6">
                <HistoryList translations={translations} />
            </div>
        </AppLayout>
    )
}