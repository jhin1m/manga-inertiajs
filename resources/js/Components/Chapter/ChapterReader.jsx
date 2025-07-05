export function ChapterReader({ pages }) {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="space-y-2">
                {pages.map((page, index) => (
                    <div key={page.id} className="flex justify-center">
                        <img
                            src={page.image_url}
                            alt={`Trang ${page.page_number}`}
                            className="max-w-full h-auto shadow-sm"
                            loading={index < 3 ? 'eager' : 'lazy'}
                            onError={(e) => {
                                e.target.src = `https://via.placeholder.com/800x1200/f8f9fa/6c757d?text=Trang+${page.page_number}`
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
} 