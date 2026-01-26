# Personal Profile Website

Trang web portfolio cá nhân với các tính năng:
- Giới thiệu thông tin cá nhân (tên, tuổi, nghề nghiệp)
- Kinh nghiệm làm việc và học tập
- Thành tích đạt được
- Kỹ năng lập trình
- 100 điều muốn làm (Bucket List)
- Gallery hình ảnh các địa điểm đã đến

## Cách sử dụng

### 1. Cập nhật thông tin cá nhân

Mở file `index.html` và thay thế các placeholder:
- `[Tên của bạn]` - Tên của bạn
- `[Tuổi của bạn]` - Tuổi
- `[Nghề nghiệp]` - Nghề nghiệp
- `[Thành phố, Việt Nam]` - Địa điểm
- Cập nhật các thông tin công việc, học tập, thành tích

### 2. Thêm ảnh đại diện

Đặt ảnh đại diện vào: `images/avatar.jpg`

### 3. Thêm hình ảnh địa điểm du lịch

Cấu trúc thư mục hình ảnh:
```
images/
├── avatar.jpg
└── travel/
    ├── hanoi/
    │   ├── 1.jpg
    │   ├── 2.jpg
    │   └── ...
    ├── hoian/
    ├── dalat/
    ├── phuquoc/
    ├── sapa/
    ├── halong/
    ├── tokyo/
    ├── seoul/
    ├── singapore/
    └── bangkok/
```

### 4. Tùy chỉnh danh sách 100 điều muốn làm

Mở file `script.js` và chỉnh sửa mảng `bucketListData`:
```javascript
const bucketListData = [
    { id: 1, text: "Mô tả điều muốn làm", category: "travel", completed: false },
    // travel: Du lịch
    // career: Sự nghiệp
    // personal: Cá nhân
];
```

### 5. Thêm địa điểm du lịch mới

1. Thêm HTML card vào section `#travel` trong `index.html`
2. Thêm data ảnh vào object `photoData` trong `script.js`
3. Tạo thư mục ảnh tương ứng trong `images/travel/`

## Chạy website

Chỉ cần mở file `index.html` trong trình duyệt, hoặc sử dụng live server:

```bash
# Với Python
python -m http.server 8000

# Với Node.js (cần cài live-server)
npx live-server
```

## Tính năng

- Responsive design - Hiển thị tốt trên mọi thiết bị
- Smooth scroll navigation
- Animated statistics counter
- Skill progress bars animation
- Filter bucket list theo category
- Photo gallery với lightbox
- Tab navigation cho experience section

## Công nghệ sử dụng

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript
- Google Fonts (Poppins, Playfair Display)
- Font Awesome Icons
