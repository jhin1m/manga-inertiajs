# Chapter Reader Components

## Components

### ChapterReader
- Hiển thị các trang manga theo vertical scroll
- Lazy loading cho performance
- Fallback placeholder khi ảnh lỗi

### ChapterNavigation
- Sticky navigation tự động ẩn khi scroll
- Navigation buttons: Home, Previous, Chapter List, Next
- Responsive design

## Features

### Keyboard Shortcuts
- `Arrow Left` / `h`: Chương trước
- `Arrow Right` / `l`: Chương tiếp
- `Escape`: Về danh sách chương

### Auto-hide Navigation
- Ẩn navigation khi scroll xuống
- Hiện lại khi scroll lên
- Threshold: 100px

## Usage

```jsx
import { ChapterReader, ChapterNavigation } from '@/Components/Chapter'

// In your page component
<ChapterNavigation 
    manga={manga}
    chapter={chapter}
    previousChapter={previousChapter}
    nextChapter={nextChapter}
    isNavVisible={isNavVisible}
/>

<ChapterReader pages={pages} />
``` 