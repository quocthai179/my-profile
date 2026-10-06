// ================================
// Space Background Effects
// ================================

// Create dynamic stars
function createStars() {
    const spaceBg = document.querySelector('.space-bg');
    if (!spaceBg) return;

    const starsContainer = document.createElement('div');
    starsContainer.className = 'dynamic-stars';
    starsContainer.style.cssText = 'position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none;';

    // Create 150 random stars
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 3 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 3;

        // Random star colors (white, blue, yellow, pink)
        const colors = ['#ffffff', '#a0d2ff', '#fff8dc', '#ffb6c1', '#e6e6fa'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        star.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${x}%;
            top: ${y}%;
            animation: starTwinkle ${duration}s ease-in-out ${delay}s infinite;
            box-shadow: 0 0 ${size * 2}px ${color};
        `;

        starsContainer.appendChild(star);
    }

    spaceBg.appendChild(starsContainer);

    // Add star twinkle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes starTwinkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.8); }
        }
    `;
    document.head.appendChild(style);
}

// Create random shooting stars
function createShootingStars() {
    const spaceBg = document.querySelector('.space-bg');
    if (!spaceBg) return;

    setInterval(() => {
        const shootingStar = document.createElement('div');
        const startX = Math.random() * 100;
        const startY = Math.random() * 50;

        shootingStar.style.cssText = `
            position: absolute;
            width: 150px;
            height: 2px;
            background: linear-gradient(90deg, rgba(255,255,255,0.9), rgba(168,85,247,0.5), transparent);
            left: ${startX}%;
            top: ${startY}%;
            transform: rotate(-45deg);
            animation: shootStar 1s ease-out forwards;
            pointer-events: none;
            border-radius: 2px;
            box-shadow: 0 0 10px rgba(255,255,255,0.5);
        `;

        spaceBg.appendChild(shootingStar);

        // Remove after animation
        setTimeout(() => {
            shootingStar.remove();
        }, 1000);
    }, 4000); // New shooting star every 4 seconds

    // Add shooting star animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shootStar {
            0% {
                opacity: 1;
                transform: rotate(-45deg) translateX(0);
            }
            100% {
                opacity: 0;
                transform: rotate(-45deg) translateX(500px);
            }
        }
    `;
    document.head.appendChild(style);
}

// Parallax effect for planets on mouse move
function initParallax() {
    const planets = document.querySelectorAll('.planet');
    const nebulas = document.querySelectorAll('.nebula');

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        planets.forEach((planet, index) => {
            const speed = (index + 1) * 20;
            const x = mouseX * speed;
            const y = mouseY * speed;
            planet.style.transform = `translate(${x}px, ${y}px)`;
        });

        nebulas.forEach((nebula, index) => {
            const speed = (index + 1) * 10;
            const x = mouseX * speed;
            const y = mouseY * speed;
            nebula.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Initialize space effects
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    createShootingStars();
    initParallax();
});

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

