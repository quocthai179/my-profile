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
