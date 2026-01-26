// ================================
// Navigation
// ================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ================================
// Stats Counter Animation
// ================================
const statNumbers = document.querySelectorAll('.stat-number');

const animateStats = () => {
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCount = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.ceil(current);
                requestAnimationFrame(updateCount);
            } else {
                stat.textContent = target;
            }
        };

        updateCount();
    });
};

// Intersection Observer for stats
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const aboutStats = document.querySelector('.about-stats');
if (aboutStats) {
    statsObserver.observe(aboutStats);
}

// ================================
// Skills Progress Animation
// ================================
const skillBars = document.querySelectorAll('.skill-progress');

const animateSkills = () => {
    skillBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        bar.style.width = `${progress}%`;
    });
};

const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateSkills();
            skillsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const skillsSection = document.querySelector('.skills');
if (skillsSection) {
    skillsObserver.observe(skillsSection);
}

// ================================
// Tabs (Experience Section)
// ================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// ================================
// Bucket List
// ================================
const bucketListData = [
    // Du lịch
    { id: 1, text: "Đi du lịch Nhật Bản vào mùa hoa anh đào", category: "travel", completed: true },
    { id: 2, text: "Khám phá Santorini, Hy Lạp", category: "travel", completed: false },
    { id: 3, text: "Trekking lên đỉnh Fansipan", category: "travel", completed: true },
    { id: 4, text: "Đến thăm Grand Canyon, Mỹ", category: "travel", completed: false },
    { id: 5, text: "Du lịch bụi châu Âu 1 tháng", category: "travel", completed: false },
    { id: 6, text: "Xem cực quang ở Iceland", category: "travel", completed: false },
    { id: 7, text: "Lặn biển ở Great Barrier Reef", category: "travel", completed: false },
    { id: 8, text: "Đi phượt xuyên Việt", category: "travel", completed: true },
    { id: 9, text: "Thăm Machu Picchu, Peru", category: "travel", completed: false },
    { id: 10, text: "Safari ở châu Phi", category: "travel", completed: false },

    // Sự nghiệp
    { id: 11, text: "Thành thạo 5 ngôn ngữ lập trình", category: "career", completed: true },
    { id: 12, text: "Xây dựng một startup công nghệ", category: "career", completed: false },
    { id: 13, text: "Đạt chứng chỉ AWS Solutions Architect", category: "career", completed: true },
    { id: 14, text: "Làm việc tại công ty công nghệ lớn", category: "career", completed: false },
    { id: 15, text: "Mentor cho 10 lập trình viên mới", category: "career", completed: true },
    { id: 16, text: "Xuất bản một cuốn sách về lập trình", category: "career", completed: false },
    { id: 17, text: "Đóng góp cho 20 dự án open source", category: "career", completed: false },
    { id: 18, text: "Xây dựng ứng dụng có 1 triệu người dùng", category: "career", completed: false },
    { id: 19, text: "Thuyết trình tại hội nghị công nghệ quốc tế", category: "career", completed: false },
    { id: 20, text: "Hoàn thành 100 dự án freelance", category: "career", completed: true },

    // Cá nhân
    { id: 21, text: "Học chơi piano", category: "personal", completed: true },
    { id: 22, text: "Chạy marathon", category: "personal", completed: false },
    { id: 23, text: "Học nấu 50 món ăn", category: "personal", completed: true },
    { id: 24, text: "Đọc 200 cuốn sách", category: "personal", completed: false },
    { id: 25, text: "Học một ngôn ngữ mới (Tiếng Nhật)", category: "personal", completed: false },
    { id: 26, text: "Nhảy dù", category: "personal", completed: false },
    { id: 27, text: "Học lướt sóng", category: "personal", completed: false },
    { id: 28, text: "Viết nhật ký mỗi ngày trong 1 năm", category: "personal", completed: true },
    { id: 29, text: "Học yoga và thiền", category: "personal", completed: true },
    { id: 30, text: "Chụp ảnh với camera chuyên nghiệp", category: "personal", completed: true },

    // Thêm các mục khác
    { id: 31, text: "Xây dựng hệ thống smart home", category: "personal", completed: false },
    { id: 32, text: "Học vẽ digital art", category: "personal", completed: false },
    { id: 33, text: "Tham gia hackathon và giành giải", category: "career", completed: true },
    { id: 34, text: "Đến thăm Silicon Valley", category: "travel", completed: false },
    { id: 35, text: "Học làm video YouTube", category: "personal", completed: false },
    { id: 36, text: "Xây dựng portfolio website đẹp", category: "career", completed: true },
    { id: 37, text: "Đạt 1000 followers trên GitHub", category: "career", completed: false },
    { id: 38, text: "Học machine learning", category: "career", completed: true },
    { id: 39, text: "Tham gia chương trình tình nguyện", category: "personal", completed: true },
    { id: 40, text: "Đi hiking ở Himalaya", category: "travel", completed: false },

    { id: 41, text: "Học nhảy một điệu nhảy", category: "personal", completed: false },
    { id: 42, text: "Xem World Cup trực tiếp", category: "travel", completed: false },
    { id: 43, text: "Viết blog công nghệ 100 bài", category: "career", completed: false },
    { id: 44, text: "Học đầu tư chứng khoán", category: "personal", completed: true },
    { id: 45, text: "Tạo một khóa học online", category: "career", completed: false },
    { id: 46, text: "Đến Paris xem tháp Eiffel", category: "travel", completed: false },
    { id: 47, text: "Học chơi cờ vua giỏi", category: "personal", completed: false },
    { id: 48, text: "Nuôi một thú cưng", category: "personal", completed: true },
    { id: 49, text: "Tham gia workshop nước ngoài", category: "career", completed: false },
    { id: 50, text: "Đi balloon ride ở Cappadocia", category: "travel", completed: false },

    { id: 51, text: "Hoàn thành khóa học blockchain", category: "career", completed: false },
    { id: 52, text: "Đến Venice, Ý", category: "travel", completed: false },
    { id: 53, text: "Học làm bánh", category: "personal", completed: true },
    { id: 54, text: "Chơi golf", category: "personal", completed: false },
    { id: 55, text: "Đến Dubai", category: "travel", completed: false },
    { id: 56, text: "Xây dựng một game mobile", category: "career", completed: false },
    { id: 57, text: "Học pha cà phê chuyên nghiệp", category: "personal", completed: false },
    { id: 58, text: "Đến Maldives", category: "travel", completed: false },
    { id: 59, text: "Tham gia cuộc thi code quốc tế", category: "career", completed: false },
    { id: 60, text: "Học bơi thành thạo", category: "personal", completed: true },

    { id: 61, text: "Xem concert ca sĩ yêu thích", category: "personal", completed: true },
    { id: 62, text: "Đến Sydney Opera House", category: "travel", completed: false },
    { id: 63, text: "Học hát", category: "personal", completed: false },
    { id: 64, text: "Viết một ứng dụng AI", category: "career", completed: false },
    { id: 65, text: "Đến New York", category: "travel", completed: false },
    { id: 66, text: "Học võ thuật", category: "personal", completed: false },
    { id: 67, text: "Tham gia cộng đồng tech local", category: "career", completed: true },
    { id: 68, text: "Đến London", category: "travel", completed: false },
    { id: 69, text: "Học mix nhạc", category: "personal", completed: false },
    { id: 70, text: "Xây dựng hệ thống CI/CD hoàn chỉnh", category: "career", completed: true },

    { id: 71, text: "Đi cắm trại ở rừng", category: "travel", completed: true },
    { id: 72, text: "Học thiết kế UI/UX", category: "career", completed: false },
    { id: 73, text: "Xem pháo hoa năm mới ở Singapore", category: "travel", completed: false },
    { id: 74, text: "Học tiếng Hàn cơ bản", category: "personal", completed: false },
    { id: 75, text: "Tạo một podcast về tech", category: "career", completed: false },
    { id: 76, text: "Đến Angkor Wat, Campuchia", category: "travel", completed: true },
    { id: 77, text: "Học chơi guitar", category: "personal", completed: false },
    { id: 78, text: "Hoàn thành 50 dự án side project", category: "career", completed: false },
    { id: 79, text: "Đến Bali, Indonesia", category: "travel", completed: true },
    { id: 80, text: "Học nấu món Nhật", category: "personal", completed: false },

    { id: 81, text: "Xây dựng một chatbot AI", category: "career", completed: false },
    { id: 82, text: "Đến Hong Kong", category: "travel", completed: true },
    { id: 83, text: "Tập gym đều đặn 6 tháng", category: "personal", completed: true },
    { id: 84, text: "Học Kubernetes", category: "career", completed: false },
    { id: 85, text: "Đến Amsterdam", category: "travel", completed: false },
    { id: 86, text: "Tổ chức một buổi workshop", category: "career", completed: true },
    { id: 87, text: "Học làm sushi", category: "personal", completed: false },
    { id: 88, text: "Đến Barcelona", category: "travel", completed: false },
    { id: 89, text: "Viết một thư viện open source", category: "career", completed: false },
    { id: 90, text: "Học chụp ảnh phong cảnh", category: "personal", completed: true },

    { id: 91, text: "Đến Cairo xem Kim tự tháp", category: "travel", completed: false },
    { id: 92, text: "Học React Native", category: "career", completed: true },
    { id: 93, text: "Đạt cân nặng lý tưởng", category: "personal", completed: false },
    { id: 94, text: "Đến Prague, Séc", category: "travel", completed: false },
    { id: 95, text: "Hoàn thành chứng chỉ PMP", category: "career", completed: false },
    { id: 96, text: "Học lái xe", category: "personal", completed: true },
    { id: 97, text: "Đến Switzerland xem núi Alps", category: "travel", completed: false },
    { id: 98, text: "Xây dựng một SaaS product", category: "career", completed: false },
    { id: 99, text: "Học thiền mindfulness", category: "personal", completed: true },
    { id: 100, text: "Sống một cuộc sống có ý nghĩa", category: "personal", completed: false }
];

const bucketGrid = document.getElementById('bucket-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const completedCount = document.getElementById('completed-count');
const progressPercent = document.getElementById('progress-percent');
const progressFill = document.getElementById('bucket-progress-fill');

function renderBucketList(filter = 'all') {
    let filteredItems = bucketListData;

    if (filter === 'completed') {
        filteredItems = bucketListData.filter(item => item.completed);
    } else if (filter === 'pending') {
        filteredItems = bucketListData.filter(item => !item.completed);
    } else if (filter !== 'all') {
        filteredItems = bucketListData.filter(item => item.category === filter);
    }

    bucketGrid.innerHTML = filteredItems.map(item => `
        <div class="bucket-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
            <span class="bucket-check">
                <i class="fas fa-check"></i>
            </span>
            <span class="bucket-number">${item.id}.</span>
            <span class="bucket-text">${item.text}</span>
            <span class="bucket-category">${getCategoryLabel(item.category)}</span>
        </div>
    `).join('');

    updateProgress();
}

function getCategoryLabel(category) {
    const labels = {
        travel: 'Du lịch',
        career: 'Sự nghiệp',
        personal: 'Cá nhân'
    };
    return labels[category] || category;
}

function updateProgress() {
    const completed = bucketListData.filter(item => item.completed).length;
    const total = bucketListData.length;
    const percent = Math.round((completed / total) * 100);

    completedCount.textContent = completed;
    progressPercent.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderBucketList(btn.getAttribute('data-filter'));
    });
});

// Initialize bucket list
renderBucketList();

// ================================
// Travel Section
// ================================
const travelTabs = document.querySelectorAll('.travel-tab');
const travelRegions = document.querySelectorAll('.travel-region');

travelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const region = tab.getAttribute('data-region');

        travelTabs.forEach(t => t.classList.remove('active'));
        travelRegions.forEach(r => r.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(region).classList.add('active');
    });
});

// ================================
// Photo Gallery Data
// ================================
const photoData = {
    // Vietnam
    hanoi: {
        title: "Hà Nội - Thủ đô ngàn năm văn hiến",
        photos: [
            { src: "images/travel/hanoi/1.jpg", caption: "Hồ Hoàn Kiếm" },
            { src: "images/travel/hanoi/2.jpg", caption: "Văn Miếu Quốc Tử Giám" },
            { src: "images/travel/hanoi/3.jpg", caption: "Phố cổ Hà Nội" },
            { src: "images/travel/hanoi/4.jpg", caption: "Lăng Bác" }
        ]
    },
    hoian: {
        title: "Hội An - Phố cổ đèn lồng",
        photos: [
            { src: "images/travel/hoian/1.jpg", caption: "Phố cổ về đêm" },
            { src: "images/travel/hoian/2.jpg", caption: "Chùa Cầu" },
            { src: "images/travel/hoian/3.jpg", caption: "Đèn lồng Hội An" },
            { src: "images/travel/hoian/4.jpg", caption: "Biển An Bàng" }
        ]
    },
    dalat: {
        title: "Đà Lạt - Thành phố ngàn hoa",
        photos: [
            { src: "images/travel/dalat/1.jpg", caption: "Hồ Xuân Hương" },
            { src: "images/travel/dalat/2.jpg", caption: "Vườn hoa thành phố" },
            { src: "images/travel/dalat/3.jpg", caption: "Đồi chè Cầu Đất" },
            { src: "images/travel/dalat/4.jpg", caption: "Thác Datanla" }
        ]
    },
    phuquoc: {
        title: "Phú Quốc - Đảo ngọc",
        photos: [
            { src: "images/travel/phuquoc/1.jpg", caption: "Bãi Sao" },
            { src: "images/travel/phuquoc/2.jpg", caption: "Hoàng hôn Dinh Cậu" },
            { src: "images/travel/phuquoc/3.jpg", caption: "Cáp treo Hòn Thơm" },
            { src: "images/travel/phuquoc/4.jpg", caption: "Safari Phú Quốc" }
        ]
    },
    sapa: {
        title: "Sapa - Thị trấn trong sương",
        photos: [
            { src: "images/travel/sapa/1.jpg", caption: "Ruộng bậc thang" },
            { src: "images/travel/sapa/2.jpg", caption: "Đỉnh Fansipan" },
            { src: "images/travel/sapa/3.jpg", caption: "Bản Cát Cát" },
            { src: "images/travel/sapa/4.jpg", caption: "Nhà thờ đá Sapa" }
        ]
    },
    halong: {
        title: "Vịnh Hạ Long - Di sản thế giới",
        photos: [
            { src: "images/travel/halong/1.jpg", caption: "Toàn cảnh vịnh" },
            { src: "images/travel/halong/2.jpg", caption: "Hang Sửng Sốt" },
            { src: "images/travel/halong/3.jpg", caption: "Đảo Ti Tốp" },
            { src: "images/travel/halong/4.jpg", caption: "Du thuyền trên vịnh" }
        ]
    },
    // World
    tokyo: {
        title: "Tokyo, Nhật Bản",
        photos: [
            { src: "images/travel/tokyo/1.jpg", caption: "Shibuya Crossing" },
            { src: "images/travel/tokyo/2.jpg", caption: "Senso-ji Temple" },
            { src: "images/travel/tokyo/3.jpg", caption: "Tokyo Tower" },
            { src: "images/travel/tokyo/4.jpg", caption: "Hoa anh đào" }
        ]
    },
    seoul: {
        title: "Seoul, Hàn Quốc",
        photos: [
            { src: "images/travel/seoul/1.jpg", caption: "Gyeongbokgung Palace" },
            { src: "images/travel/seoul/2.jpg", caption: "N Seoul Tower" },
            { src: "images/travel/seoul/3.jpg", caption: "Bukchon Hanok Village" },
            { src: "images/travel/seoul/4.jpg", caption: "Myeongdong" }
        ]
    },
    singapore: {
        title: "Singapore",
        photos: [
            { src: "images/travel/singapore/1.jpg", caption: "Marina Bay Sands" },
            { src: "images/travel/singapore/2.jpg", caption: "Gardens by the Bay" },
            { src: "images/travel/singapore/3.jpg", caption: "Sentosa Island" },
            { src: "images/travel/singapore/4.jpg", caption: "Merlion Park" }
        ]
    },
    bangkok: {
        title: "Bangkok, Thái Lan",
        photos: [
            { src: "images/travel/bangkok/1.jpg", caption: "Grand Palace" },
            { src: "images/travel/bangkok/2.jpg", caption: "Wat Arun" },
            { src: "images/travel/bangkok/3.jpg", caption: "Chatuchak Market" },
            { src: "images/travel/bangkok/4.jpg", caption: "Khao San Road" }
        ]
    }
};

// ================================
// Photo Modal
// ================================
const photoModal = document.getElementById('photo-modal');
const modalTitle = document.getElementById('modal-title');
const modalGallery = document.getElementById('modal-gallery');
const modalClose = document.querySelector('.modal-close');
const placeCards = document.querySelectorAll('.place-card');

let currentPhotos = [];
let currentPhotoIndex = 0;

placeCards.forEach(card => {
    card.addEventListener('click', () => {
        const place = card.getAttribute('data-place');
        const data = photoData[place];

        if (data) {
            modalTitle.textContent = data.title;
            currentPhotos = data.photos;

            modalGallery.innerHTML = data.photos.map((photo, index) => `
                <img src="${photo.src}"
                     alt="${photo.caption}"
                     data-index="${index}"
                     onerror="this.src='https://via.placeholder.com/200x150?text=${encodeURIComponent(photo.caption)}'">
            `).join('');

            // Add click events to gallery images
            const galleryImages = modalGallery.querySelectorAll('img');
            galleryImages.forEach(img => {
                img.addEventListener('click', () => {
                    currentPhotoIndex = parseInt(img.getAttribute('data-index'));
                    openLightbox();
                });
            });

            photoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

modalClose.addEventListener('click', () => {
    photoModal.classList.remove('active');
    document.body.style.overflow = '';
});

photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal) {
        photoModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ================================
// Lightbox
// ================================
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

function openLightbox() {
    const photo = currentPhotos[currentPhotoIndex];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.caption;
    lightboxImage.onerror = function() {
        this.src = `https://via.placeholder.com/800x600?text=${encodeURIComponent(photo.caption)}`;
    };
    lightbox.classList.add('active');
}

function closeLightbox() {
    lightbox.classList.remove('active');
}

function showPrevPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
    openLightbox();
}

function showNextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
    openLightbox();
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrevPhoto);
lightboxNext.addEventListener('click', showNextPhoto);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevPhoto();
        if (e.key === 'ArrowRight') showNextPhoto();
    }
    if (photoModal.classList.contains('active') && e.key === 'Escape') {
        photoModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ================================
// Smooth Scroll for Navigation
// ================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ================================
// Scroll Animations
// ================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply to sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(section);
});

// Hero section should be visible immediately
document.querySelector('.hero').style.opacity = '1';
document.querySelector('.hero').style.transform = 'translateY(0)';

console.log('Portfolio website loaded successfully!');
