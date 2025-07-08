import { Head } from '@inertiajs/react';

export default function SeoHead({ seo, canonical = null }) {
    if (!seo) return null;

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{seo.title}</title>
            <meta name="description" content={seo.description} />
            <meta name="keywords" content={seo.keywords} />
            <meta name="robots" content={seo.robots} />

            {/* Canonical URL */}
            {canonical && <link rel="canonical" href={canonical} />}
            {!canonical && seo.url && <link rel="canonical" href={seo.url} />}

            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={seo.title} />
            <meta property="og:description" content={seo.description} />
            <meta property="og:type" content={seo.type} />
            <meta property="og:url" content={seo.url} />
            <meta property="og:site_name" content={seo.site_name} />
            <meta property="og:locale" content={seo.locale} />
            {seo.image && <meta property="og:image" content={seo.image} />}
            {seo.image && <meta property="og:image:alt" content={seo.title} />}

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seo.title} />
            <meta name="twitter:description" content={seo.description} />
            {seo.image && <meta name="twitter:image" content={seo.image} />}

            {/* Additional Meta Tags */}
            <meta name="author" content={seo.site_name} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="language" content="Vietnamese" />
            <meta name="revisit-after" content="1 days" />

            {/* Structured Data (JSON-LD) */}
            {seo.schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(seo.schema)
                    }}
                />
            )}
        </Head>
    );
}