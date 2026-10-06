# Thái's Blog

Blog cá nhân tĩnh (HTML/CSS/JS thuần, giao diện không gian), nơi chia sẻ kiến thức, kinh nghiệm và trải nghiệm.

## Cấu trúc

| File | Vai trò |
|------|---------|
| `index.html` | Trang chủ blog: danh sách bài, lọc theo chuyên mục, tìm kiếm |
| `post.html` | Trang đọc một bài (`post.html?p=<slug>`) |
| `about.html` | Trang "Về tôi": giới thiệu, kinh nghiệm, kỹ năng, dự án, du lịch |
| `posts.js` | **Dữ liệu bài viết** — nơi bạn thêm bài mới |
| `blog.js` / `blog.css` | Logic và style của blog |
| `space.js` | Nền không gian + điều hướng (dùng chung mọi trang) |
| `about.js` / `styles.css` | Logic và style của trang "Về tôi" + style nền chung |

## Viết bài mới

Mở `posts.js`, copy một object trong mảng `POSTS`, dán lên **đầu mảng** và sửa:

```javascript
{
    slug: 'ten-bai-viet-khong-dau',   // duy nhất, dùng trong URL
    title: 'Tiêu đề bài viết',
    date: '2025-02-01',               // YYYY-MM-DD
    category: 'Kiến thức',            // tạo thành bộ lọc tự động
    tags: ['Java', 'Quarkus'],
    cover: 'fa-code',                 // icon Font Awesome cho thẻ bài
    excerpt: 'Mô tả ngắn hiển thị ở danh sách.',
    content: `<p>Nội dung HTML...</p>`
}
```

Trong `content` có thể dùng `<h2>`, `<ul>`, `<pre><code>`, `<blockquote>`, `<img>`...

## Chạy thử

```bash
python3 -m http.server 8000   # rồi mở http://localhost:8000
```

## Triển khai

Chỉ là file tĩnh nên host được trên GitHub Pages, Netlify, Vercel...
