// ================================
// Cosmos: black hole, gravity & lensing background
// - Newtonian gravity (a = GM / r^2) on orbiting particles
// - Keplerian accretion disk (omega ~ r^-1.5) with Doppler beaming
// - Gravitational lensing of background stars (r' = r + rs^2 / r)
// - Mouse acts as a secondary gravity well
// ================================
(function () {
    const spaceBg = document.querySelector('.space-bg');
    if (!spaceBg) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'cosmos-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    spaceBg.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    let W, H, dpr;
    const bh = { x: 0, y: 0, rs: 40, mass: 1 };   // black hole (rs = Schwarzschild radius, px)
    const GM = 9000;                              // gravitational parameter (px^3 / s^2)
    const mouse = { x: -9999, y: -9999, active: false };
    let stars = [];
    let disk = [];
    let bodies = [];

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bh.rs = Math.max(22, Math.min(W, H) * (isMobile ? 0.07 : 0.07));
        bh.x = W * (isMobile ? 0.72 : 0.8);
        bh.y = H * 0.3;
        initStars();
        initDisk();
    }

    // ---------- Background stars (lensed around the black hole) ----------
    function initStars() {
        const n = isMobile ? 120 : 260;
        stars = [];
        for (let i = 0; i < n; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                z: Math.random() * 0.8 + 0.2,           // depth -> parallax strength
                r: Math.random() * 1.2 + 0.3,
                tw: Math.random() * Math.PI * 2,
                hue: [210, 200, 45, 330, 260, 0][Math.floor(Math.random() * 6)]
            });
        }
    }

    // ---------- Accretion disk ----------
    function initDisk() {
        const n = isMobile ? 700 : 1800;
        disk = [];
        for (let i = 0; i < n; i++) {
            const r = bh.rs * (1.6 + Math.pow(Math.random(), 1.6) * 3.4); // dense near the hole
            disk.push({
                r,
                a: Math.random() * Math.PI * 2,
                w: Math.sqrt(GM / (r * r * r)) * 3.2,     // Kepler: omega = sqrt(GM / r^3)
                s: Math.random() * 1.1 + 0.3,
                j: (Math.random() - 0.5) * 0.12           // vertical scatter
            });
        }
    }

    // ---------- Free-falling bodies (comets / dust) ----------
    function spawnBody(initial) {
        let x, y;
        if (initial) {
            x = Math.random() * W;
            y = Math.random() * H;
        } else {
            const edge = Math.floor(Math.random() * 4);
            x = edge === 0 ? -20 : edge === 1 ? W + 20 : Math.random() * W;
            y = edge === 2 ? -20 : edge === 3 ? H + 20 : Math.random() * H;
        }
        const dx = bh.x - x, dy = bh.y - y;
        const d = Math.hypot(dx, dy) || 1;
        // near-circular tangential velocity with random eccentricity
        const v = Math.sqrt(GM / d) * (0.35 + Math.random() * 0.6);
        const dir = Math.random() < 0.5 ? 1 : -1;
        return {
            x, y,
            vx: (-dy / d) * v * dir,
            vy: (dx / d) * v * dir,
            px: x, py: y,
            hue: 190 + Math.random() * 130,
            life: 1
        };
    }

    function initBodies() {
        const n = isMobile ? 18 : 45;
        bodies = [];
        for (let i = 0; i < n; i++) bodies.push(spawnBody(true));
    }

    // ---------- Physics ----------
    function stepBodies(dt) {
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            b.px = b.x; b.py = b.y;

            let dx = bh.x - b.x, dy = bh.y - b.y;
            let d2 = dx * dx + dy * dy;
            let d = Math.sqrt(d2);

            if (d < bh.rs * 0.9) {               // crossed the event horizon
                bodies[i] = spawnBody(false);
                continue;
            }

            const inv = GM / (d2 * d);           // a = GM / r^2, normalised by r
            b.vx += dx * inv * dt;
            b.vy += dy * inv * dt;

            if (mouse.active) {                  // mouse: small secondary gravity well
                const mx = mouse.x - b.x, my = mouse.y - b.y;
                const md2 = mx * mx + my * my + 900;
                const mi = (GM * 0.12) / (md2 * Math.sqrt(md2));
                b.vx += mx * mi * dt;
                b.vy += my * mi * dt;
            }

            b.x += b.vx * dt;
            b.y += b.vy * dt;

            if (b.x < -300 || b.x > W + 300 || b.y < -300 || b.y > H + 300) {
                bodies[i] = spawnBody(false);
            }
        }
    }

    // ---------- Drawing ----------
    function lens(x, y) {
        // thin-lens approximation: r' = r + rs^2 / r
        const dx = x - bh.x, dy = y - bh.y;
        const d = Math.hypot(dx, dy);
        if (d < bh.rs * 1.05) return null;      // hidden behind the shadow
        const k = 1 + (bh.rs * bh.rs * 1.6) / (d * d);
        return { x: bh.x + dx * k, y: bh.y + dy * k };
    }

    function drawStars(t, px, py) {
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            let x = s.x + px * s.z * 18;
            let y = s.y + py * s.z * 18;
            const p = lens(x, y);
            if (!p) continue;
            const a = 0.45 + 0.4 * Math.sin(t * 0.0015 + s.tw);
            ctx.fillStyle = `hsla(${s.hue}, ${s.hue === 0 ? 0 : 70}%, 88%, ${a})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, s.r, 0, 6.2832);
            ctx.fill();
        }
    }

    function drawGlow() {
        // outer warm halo (gravitational blueshift / photon sphere glow)
        const g = ctx.createRadialGradient(bh.x, bh.y, bh.rs * 0.9, bh.x, bh.y, bh.rs * 6);
        g.addColorStop(0, 'rgba(255,170,80,0.28)');
        g.addColorStop(0.35, 'rgba(200,80,255,0.10)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, bh.rs * 6, 0, 6.2832);
        ctx.fill();
    }

    function drawDisk(dt, front) {
        const tilt = 0.28;                       // viewing inclination (y squash)
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < disk.length; i++) {
            const p = disk[i];
            if (front === 0) p.a += p.w * dt;    // advance once per frame (back pass)
            const cs = Math.cos(p.a), sn = Math.sin(p.a);
            const isFront = sn > 0;
            if (isFront !== !!front) continue;

            const x = bh.x + cs * p.r;
            const y = bh.y + sn * p.r * tilt + p.j * p.r;

            // Doppler beaming: the side moving toward us is brighter/bluer
            const beam = 0.5 + 0.5 * cs * Math.sign(p.w);
            const heat = 1 - (p.r - bh.rs * 1.6) / (bh.rs * 3.4);  // hotter near the hole
            const hue = 20 + (1 - heat) * 20 + beam * 25;
            const light = 55 + heat * 35;
            const alpha = (0.25 + heat * 0.5) * (0.4 + beam * 0.8);
            ctx.fillStyle = `hsla(${hue}, 100%, ${light}%, ${Math.min(alpha, 0.95)})`;
            ctx.fillRect(x, y, p.s * 1.6, p.s * 1.6);

            if (!isFront) {
                // lensed image of the far side arching over the top of the hole
                const k = bh.rs * 1.55 / p.r;
                const ly = bh.y - Math.abs(sn) * p.r * (0.55 + 0.45 * k);
                ctx.fillRect(bh.x + cs * p.r * 0.8, ly, p.s * 1.6, p.s * 1.6);
            }
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    function drawShadow() {
        // event horizon + photon ring
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, bh.rs, 0, 6.2832);
        ctx.fillStyle = '#000';
        ctx.fill();
        const ring = ctx.createRadialGradient(bh.x, bh.y, bh.rs * 0.96, bh.x, bh.y, bh.rs * 1.3);
        ring.addColorStop(0, 'rgba(255,230,190,0.95)');
        ring.addColorStop(0.25, 'rgba(255,150,60,0.45)');
        ring.addColorStop(1, 'rgba(255,100,30,0)');
        ctx.fillStyle = ring;
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, bh.rs * 1.3, 0, 6.2832);
        ctx.arc(bh.x, bh.y, bh.rs * 0.97, 0, 6.2832, true);
        ctx.fill();
    }

    function drawBodies() {
        ctx.lineCap = 'round';
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            const sp = Math.hypot(b.vx, b.vy);
            const g = ctx.createLinearGradient(b.x, b.y, b.x - b.vx * 0.35, b.y - b.vy * 0.35);
            g.addColorStop(0, `hsla(${b.hue},90%,75%,0.9)`);
            g.addColorStop(1, `hsla(${b.hue},90%,60%,0)`);
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(b.x - b.vx * 0.35, b.y - b.vy * 0.35);
            ctx.stroke();
            ctx.fillStyle = `hsl(${b.hue},90%,85%)`;
            ctx.beginPath();
            ctx.arc(b.x, b.y, 1 + Math.min(sp / 200, 1), 0, 6.2832);
            ctx.fill();
        }
    }

    function drawMouseWell() {
        if (!mouse.active) return;
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 70);
        g.addColorStop(0, 'rgba(168,85,247,0.22)');
        g.addColorStop(1, 'rgba(168,85,247,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 70, 0, 6.2832);
        ctx.fill();
    }

    // ---------- Equation HUD ----------
    const equations = [
        ['Newton', 'F = G·m₁·m₂ / r²'],
        ['Schwarzschild', 'r<sub>s</sub> = 2GM / c²'],
        ['Einstein', 'G<sub>μν</sub> + Λg<sub>μν</sub> = 8πG/c⁴ · T<sub>μν</sub>'],
        ['Kepler III', 'T² ∝ a³'],
        ['Hawking', 'T = ħc³ / (8πGMk<sub>B</sub>)'],
        ['Mass–energy', 'E = mc²'],
        ['Escape velocity', 'v<sub>e</sub> = √(2GM / r)'],
        ['Hubble', 'v = H₀ · d']
    ];
    const hud = document.createElement('div');
    hud.className = 'cosmos-hud';
    hud.style.cssText = 'position:absolute;left:20px;bottom:18px;max-width:80%;font:12px/1.4 "SFMono-Regular",Consolas,monospace;' +
        'color:rgba(190,170,255,0.55);letter-spacing:.04em;pointer-events:none;transition:opacity .8s;text-shadow:0 0 8px rgba(168,85,247,.5);';
    spaceBg.appendChild(hud);
    let eqIndex = 0;
    function showEquation() {
        const [name, eq] = equations[eqIndex++ % equations.length];
        hud.style.opacity = 0;
        setTimeout(() => {
            hud.innerHTML = `<span style="opacity:.6">${name}</span> &nbsp;${eq}`;
            hud.style.opacity = 1;
        }, 800);
    }

    // ---------- Main loop ----------
    let last = performance.now();
    let running = true;
    let parX = 0, parY = 0;

    function frame(t) {
        if (!running) return;
        const dt = Math.min((t - last) / 1000, 0.05);
        last = t;

        // gentle drift of the black hole + eased parallax from the mouse
        bh.y += Math.sin(t * 0.0002) * 0.06;
        const tx = mouse.active ? mouse.x / W - 0.5 : 0;
        const ty = mouse.active ? mouse.y / H - 0.5 : 0;
        parX += (tx - parX) * 0.04;
        parY += (ty - parY) * 0.04;

        ctx.clearRect(0, 0, W, H);
        drawStars(t, -parX, -parY);
        drawGlow();
        drawMouseWell();
        drawDisk(dt, 0);       // far side (behind the hole)
        drawShadow();
        drawDisk(dt, 1);       // near side (in front of the hole)
        stepBodies(dt);
        drawBodies();

        requestAnimationFrame(frame);
    }

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        if (running) { last = performance.now(); requestAnimationFrame(frame); }
    });

    resize();
    initBodies();
    showEquation();
    setInterval(showEquation, 6000);

    if (reduceMotion) {
        // static frame only
        stepBodies(0);
        drawStars(0, 0, 0); drawGlow(); drawDisk(0, 0); drawShadow(); drawDisk(0, 1); drawBodies();
    } else {
        requestAnimationFrame(frame);
    }
})();
