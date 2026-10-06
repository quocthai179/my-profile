// ================================
// Dữ liệu bài viết
// Thêm bài mới: copy một object bên dưới, đặt `slug` duy nhất rồi dán lên ĐẦU mảng.
// - date: YYYY-MM-DD
// - category: tên chuyên mục (hiển thị làm bộ lọc)
// - tags: mảng từ khóa
// - content: HTML của bài (dùng template string `...`)
// ================================
const POSTS = [
    {
        slug: 'flyway-migration-an-toan',
        title: 'Viết Flyway migration an toàn cho hệ thống đang chạy',
        date: '2025-01-15',
        category: 'Kiến thức',
        tags: ['PostgreSQL', 'Flyway', 'Backend'],
        cover: 'fa-database',
        excerpt: 'Vài nguyên tắc giúp migration cơ sở dữ liệu không làm hỏng hệ thống đang có người dùng.',
        content: `
            <p>Migration là phần dễ gây sự cố nhất khi triển khai. Dưới đây là những nguyên tắc tôi hay áp dụng khi dùng Flyway với PostgreSQL.</p>
            <h2>1. Không bao giờ sửa migration đã chạy</h2>
            <p>Flyway lưu checksum của mỗi file. Sửa file cũ sẽ làm validate thất bại ở môi trường khác. Cần thay đổi? Viết một migration mới.</p>
            <h2>2. Tách thay đổi phá vỡ thành nhiều bước</h2>
            <p>Đổi tên cột trực tiếp sẽ làm bản code cũ lỗi trong lúc deploy. Thay vào đó:</p>
            <ul>
                <li>Thêm cột mới, ghi song song cả hai cột.</li>
                <li>Sao chép dữ liệu cũ sang cột mới.</li>
                <li>Chuyển code sang đọc cột mới.</li>
                <li>Ở bản phát hành sau, xóa cột cũ.</li>
            </ul>
            <h2>3. Cẩn thận với khóa bảng</h2>
            <p>Tạo index trên bảng lớn nên dùng <code>CREATE INDEX CONCURRENTLY</code>. Lệnh này không chạy trong transaction, nên cần tách thành file riêng.</p>
            <pre><code>-- V12__add_user_email_index.sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email ON users (email);</code></pre>
            <h2>Kết</h2>
            <p>Migration tốt là migration nhàm chán: nhỏ, có thể đảo ngược về mặt logic, và không bất ngờ.</p>
        `
    },
    {
        slug: 'ghi-chep-hoc-moi-ngay',
        title: 'Ghi chép: thói quen học mỗi ngày một ít',
        date: '2025-01-05',
        category: 'Trải nghiệm',
        tags: ['Học tập', 'Thói quen'],
        cover: 'fa-lightbulb',
        excerpt: 'Học đều 30 phút mỗi ngày hiệu quả hơn học dồn cuối tuần — và cách để duy trì nó.',
        content: `
            <p>Đây là bài mẫu thuộc chuyên mục <strong>Trải nghiệm</strong>. Bạn hãy thay bằng câu chuyện của chính mình.</p>
            <h2>Nguyên tắc nhỏ</h2>
            <ul>
                <li>Đặt mục tiêu rất nhỏ để không có lý do bỏ qua.</li>
                <li>Gắn việc học vào một thói quen có sẵn (sau cà phê sáng chẳng hạn).</li>
                <li>Ghi lại điều đã học — viết ra là cách kiểm tra mình có thật sự hiểu hay không.</li>
            </ul>
            <blockquote>Đều đặn quan trọng hơn cường độ.</blockquote>
        `
    },
    {
        slug: 'chao-mung-den-voi-blog',
        title: 'Chào mừng đến với blog của tôi',
        date: '2025-01-01',
        category: 'Giới thiệu',
        tags: ['Blog'],
        cover: 'fa-rocket',
        excerpt: 'Nơi tôi chia sẻ kiến thức, kinh nghiệm và trải nghiệm trên hành trình làm kỹ sư phần mềm.',
        content: `
            <p>Xin chào! Tôi là Thái, một Backend Engineer. Blog này là nơi tôi ghi lại những gì mình học được.</p>
            <h2>Bạn sẽ tìm thấy gì ở đây?</h2>
            <ul>
                <li><strong>Kiến thức</strong>: ghi chép kỹ thuật về backend, cơ sở dữ liệu, hạ tầng.</li>
                <li><strong>Kinh nghiệm</strong>: bài học rút ra từ công việc thực tế.</li>
                <li><strong>Trải nghiệm</strong>: du lịch, sách, cuộc sống.</li>
            </ul>
            <p>Cảm ơn bạn đã ghé qua. Nếu có góp ý, hãy liên hệ qua email ở cuối trang.</p>
        `
    }
];
