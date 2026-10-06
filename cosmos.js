// ================================
// Cosmos: relativistic black hole background
//
// WebGL ray tracer. Every pixel fires a photon that is integrated through
// Schwarzschild spacetime (units: G = c = 1, r_s = 1):
//   Binet orbit equation   u'' + u = (3GM/c^2) u^2
//   Cartesian form         d^2x/dl^2 = -(3/2) r_s h^2 x / r^5,   h = |x × v|
// so the shadow, the photon ring, the lensed far side of the disk and the
// Einstein ring of the background sky all come out of the physics.
//
// Accretion disk: Novikov-Thorne / Shakura-Sunyaev temperature profile,
// Keplerian rotation, relativistic Doppler beaming and gravitational
// redshift  g = D * sqrt(1 - r_s/r).
//
// Interaction: the cursor is a point-mass lens (Einstein ring), a click
// sends a quadrupolar gravitational wave (h+ polarisation), scrolling flies
// the camera around the hole.
//
// Falls back to a 2D canvas simulation when WebGL is unavailable.
// ================================
(function () {
    'use strict';

    const spaceBg = document.querySelector('.space-bg');
    if (!spaceBg) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

    // Sgr A* (4.3e6 solar masses) for the HUD
    const RS_AU = 0.0849;
    const C_KMS = 299792.458;

    const pointer = { x: 0, y: 0, inside: false, lens: 0 };
    const ripples = [];   // { x, y, t, amp } in shader uv space

    // ================================
    // HUD: equations + live telemetry
    // ================================
    const EQUATIONS = [
        ['Einstein field equations', 'G<sub>μν</sub> + Λg<sub>μν</sub> = (8πG / c⁴) T<sub>μν</sub>'],
        ['Geodesic', 'd²x<sup>μ</sup>/dτ² + Γ<sup>μ</sup><sub>αβ</sub> ẋ<sup>α</sup>ẋ<sup>β</sup> = 0'],
        ['Photon orbit · Binet', 'u″ + u = (3GM / c²) u²'],
        ['Schwarzschild radius', 'r<sub>s</sub> = 2GM / c²'],
        ['Light deflection', 'α = 4GM / (c² b)'],
        ['Time dilation', 'dτ = dt √(1 − r<sub>s</sub> / r)'],
        ['Hawking temperature', 'T<sub>H</sub> = ħc³ / (8πGMk<sub>B</sub>)'],
        ['Bekenstein–Hawking entropy', 'S = k<sub>B</sub>c³A / (4Għ)'],
        ['Gravitational waves', '□h̄<sub>μν</sub> = −(16πG / c⁴) T<sub>μν</sub>'],
        ['Newton', 'F = G m₁m₂ / r²'],
        ['Kepler III', 'T² = 4π²a³ / GM'],
        ['Friedmann', 'H² = 8πGρ/3 − kc²/a² + Λc²/3'],
        ['Mass–energy', 'E = mc²']
    ];
    const GW_INDEX = 8;

    function buildHud(withTelemetry) {
        const el = document.createElement('div');
        el.className = 'cosmos-hud';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML =
            '<div class="cosmos-hud__bar">' +
                '<button type="button" class="cosmos-hud__title" tabindex="-1">Sgr A*</button>' +
                '<div class="cosmos-eq"><small></small><span></span></div>' +
            '</div>' +
            (withTelemetry ?
                '<div class="cosmos-hud__more"><div>' +
                    '<div class="cosmos-telemetry">' +
                        '<span>M</span><b>4.3×10⁶ M☉</b>' +
                        '<span>r<sub>s</sub></span><b>0.085 AU</b>' +
                        '<span>r</span><b data-k="r">–</b>' +
                        '<span>dτ/dt</span><b data-k="tau">–</b>' +
                        '<span>z<sub>grav</sub></span><b data-k="z">–</b>' +
                        '<span>v<sub>esc</sub></span><b data-k="vesc">–</b>' +
                        '<span>T<sub>H</sub></span><b>1.4×10⁻¹⁴ K</b>' +
                    '</div>' +
                    '<div class="cosmos-hint">di chuột · thấu kính hấp dẫn<br>click · sóng hấp dẫn<br>cuộn · bay quanh hố đen</div>' +
                '</div></div>' : '');
        // lives above the page content, so it is a compact widget rather than part of the backdrop
        document.body.appendChild(el);
        el.querySelector('.cosmos-hud__title').addEventListener('click', () => el.classList.toggle('is-open'));
        // shrink to a dot while reading so it never sits on top of the text
        const mini = () => el.classList.toggle('is-mini', window.scrollY > 40);
        window.addEventListener('scroll', mini, { passive: true });
        mini();

        const eqBox = el.querySelector('.cosmos-eq');
        const eqName = eqBox.querySelector('small');
        const eqBody = eqBox.querySelector('span');
        const fields = {};
        el.querySelectorAll('[data-k]').forEach((b) => { fields[b.dataset.k] = b; });

        let idx = 0;
        let timer = null;
        function show(i) {
            idx = i;
            eqBox.classList.add('is-out');
            setTimeout(() => {
                eqName.textContent = EQUATIONS[i][0];
                eqBody.innerHTML = EQUATIONS[i][1];
                eqBox.classList.remove('is-out');
            }, 600);
        }
        function cycle() {
            clearInterval(timer);
            if (!reduceMotion) timer = setInterval(() => show((idx + 1) % EQUATIONS.length), 7000);
        }
        eqName.textContent = EQUATIONS[0][0];
        eqBody.innerHTML = EQUATIONS[0][1];
        cycle();

        return {
            flash(i) { show(i); cycle(); },
            telemetry(r) {
                if (!fields.r) return;
                const f = Math.sqrt(1 - 1 / r);
                fields.r.textContent = r.toFixed(2) + ' rₛ · ' + (r * RS_AU).toFixed(2) + ' AU';
                fields.tau.textContent = f.toFixed(4);
                fields.z.textContent = (1 / f - 1).toFixed(4);
                fields.vesc.textContent = Math.round(C_KMS / Math.sqrt(r)).toLocaleString('en-US') + ' km/s';
            }
        };
    }

    // ================================
    // Shaders
    // ================================
    const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}`;

    const COMMON = `
float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
float hash13(vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}
vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
}
`;

    const SCENE_FRAG = `
#define MAX_STEPS 220
uniform vec2 uRes;
uniform float uTime;
uniform float uSim;
uniform vec3 uCamPos;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamFwd;
uniform vec2 uOffset;
uniform float uFocal;
uniform int uSteps;
uniform vec3 uMouse;
uniform vec4 uRipples[4];
uniform vec3 uStar;
uniform float uExposure;

const float R_IN = 3.0;      // ISCO = 3 r_s
const float R_OUT = 11.0;
const float STAR_R = 0.17;

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
            mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
        mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
            mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
        f.z);
}

float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.03 + vec3(1.7, 9.2, 3.1);
        a *= 0.5;
    }
    return v;
}

// Planck locus approximation, Kelvin -> linear RGB
vec3 blackbody(float t) {
    t = clamp(t, 800.0, 40000.0) / 100.0;
    vec3 c;
    c.r = t <= 66.0 ? 1.0 : 1.29293618606 * pow(max(t - 60.0, 1.0), -0.1332047592);
    c.g = t <= 66.0 ? 0.39008157876 * log(t) - 0.63184144378
                    : 1.12989086089 * pow(max(t - 60.0, 1.0), -0.0755148492);
    c.b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : 0.54320678911 * log(t - 10.0) - 1.19625408914);
    c = clamp(c, 0.0, 1.0);
    return c * c;
}

vec3 aces(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

// ---------- Background sky ----------
vec3 starLayer(vec3 d, float scale, float density) {
    vec3 p = d * scale;
    vec3 id = floor(p);
    vec3 h = hash33(id);
    if (h.x > density) return vec3(0.0);
    vec3 off = (hash33(id + 17.0) - 0.5) * 0.6;
    float dist = length(fract(p) - 0.5 - off);
    float size = mix(0.07, 0.17, h.y * h.y);
    float b = exp(-dist * dist / (size * size));
    float tw = 0.75 + 0.25 * sin(uTime * (0.8 + 2.5 * h.z) + h.y * 40.0);
    vec3 c = blackbody(mix(3000.0, 16000.0, h.z * h.z));
    return c * b * tw * (0.5 + 3.0 * h.y * h.y * h.y);
}

vec3 sky(vec3 d) {
    vec3 galN = normalize(vec3(0.25, 1.0, -0.4));
    float g = dot(d, galN);
    float band = exp(-g * g * 9.0);

    float n1 = fbm(d * 2.6 + vec3(0.0, 0.0, uTime * 0.004));
    float n2 = fbm(d * 6.5 + n1 * 1.8);
    vec3 blue = vec3(0.12, 0.28, 0.95);
    vec3 purple = vec3(0.50, 0.16, 0.90);
    vec3 pink = vec3(1.00, 0.30, 0.58);
    vec3 neb = mix(blue, purple, smoothstep(0.35, 0.65, n1));
    neb = mix(neb, pink, smoothstep(0.55, 0.8, n2) * 0.7);
    float dens = n2 * n2 * n2 * (0.25 + 1.8 * band);
    vec3 col = neb * dens * 0.11;

    // dust lanes + unresolved starlight of the galactic band
    float dust = smoothstep(0.42, 0.68, fbm(d * 13.0 + 4.0));
    col += vec3(0.85, 0.80, 1.0) * band * n2 * 0.035;
    col *= 1.0 - 0.75 * band * dust;

    col += starLayer(d, 80.0, 0.07);
    col += starLayer(d, 190.0, 0.10 + band * 0.25) * 0.55;
    col += starLayer(d, 430.0, 0.06 + band * 0.45) * 0.35 * (1.0 - 0.6 * dust * band);
    return col;
}

// ---------- Accretion disk ----------
float diskLayer(float lr, float ang, float seed) {
    vec3 q = vec3(cos(ang) * 2.2, sin(ang) * 2.2, lr * 7.0 + seed);
    float n = fbm(q);
    float streaks = 0.5 + 0.5 * sin(lr * 46.0 + n * 7.0);
    return n * (0.6 + 0.4 * streaks);
}

vec4 disk(vec3 p, vec3 v) {
    float r = length(p.xz);
    if (r < R_IN * 0.88 || r > R_OUT) return vec4(0.0);

    // Keplerian rotation; two time-shifted layers cross-fade so the
    // differential shear never winds up indefinitely
    float ang = atan(p.z, p.x);
    float omega = sqrt(0.5 / (r * r * r));
    const float P = 70.0;
    float t1 = mod(uSim, P);
    float t2 = mod(uSim + 0.5 * P, P);
    float w1 = 1.0 - abs(2.0 * t1 / P - 1.0);
    float lr = log(r);
    float n = mix(diskLayer(lr, ang - omega * t2, 11.0), diskLayer(lr, ang - omega * t1, 0.0), w1);

    // Novikov-Thorne temperature profile, normalised to peak = 1
    float x = R_IN / r;
    float T = pow(x, 0.75) * pow(max(1.0 - sqrt(x), 0.0), 0.25) / 0.488;

    // relativistic Doppler factor + gravitational redshift
    vec3 vdir = normalize(vec3(-p.z, 0.0, p.x));
    float beta = clamp(sqrt(0.5 / (r - 1.0)), 0.0, 0.9);
    float gam = inversesqrt(1.0 - beta * beta);
    float cosT = dot(vdir, -normalize(v));
    float D = 1.0 / (gam * (1.0 - beta * cosT));
    float g = D * sqrt(1.0 - 1.0 / r);

    vec3 bb = blackbody((1900.0 + 5600.0 * T) * g);
    float I = pow(g, 3.0) * (0.12 + T) * (0.2 + 1.6 * n * n);
    float edge = smoothstep(R_IN * 0.88, R_IN * 1.06, r) * smoothstep(R_OUT, R_OUT * 0.5, r);
    float alpha = clamp(edge * (0.2 + 1.0 * n) * (0.5 + 0.7 * T), 0.0, 0.97);
    return vec4(bb * I * edge * 2.2, alpha);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

    // gravitational waves: h+ polarisation stretches x while squeezing y
    for (int i = 0; i < 4; i++) {
        vec4 R = uRipples[i];
        float age = uTime - R.z;
        if (R.w > 0.0 && age > 0.0 && age < 5.0) {
            vec2 d = uv - R.xy;
            float dist = length(d) + 1e-4;
            float front = age * 0.5;
            float env = exp(-pow((dist - front) * 4.5, 2.0)) * (1.0 - age / 5.0) * R.w;
            float h = env * sin((dist - front) * 60.0) * 0.022;
            uv += vec2(d.x, -d.y) / dist * h;
        }
    }

    // cursor as a point-mass lens: beta = theta - theta_E^2 theta / |theta|^2
    if (uMouse.z > 0.001) {
        vec2 d = uv - uMouse.xy;
        uv -= uMouse.z * 0.0022 * d / (dot(d, d) + 0.0004);
    }

    vec3 rd = normalize(uCamFwd * uFocal + uCamRight * (uv.x - uOffset.x) + uCamUp * (uv.y - uOffset.y));
    vec3 p = uCamPos;
    vec3 v = rd;
    vec3 hv = cross(p, v);
    float h2 = dot(hv, hv);

    vec3 col = vec3(0.0);
    float trans = 1.0;
    float starGlow = 0.0;
    float jet = 0.0;
    bool captured = false;

    for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= uSteps) break;
        float r = length(p);
        float dt = clamp(0.07 * r, 0.025, 2.0);

        // null geodesic in Schwarzschild spacetime
        float r2 = r * r;
        v += -1.5 * h2 * p / (r2 * r2 * r) * dt;
        vec3 pn = p + v * dt;

        // accretion disk crossing (y = 0 plane)
        if (p.y * pn.y < 0.0) {
            vec3 hit = mix(p, pn, p.y / (p.y - pn.y));
            vec4 dk = disk(hit, v);
            col += trans * dk.rgb;
            trans *= 1.0 - dk.a;
        }

        // companion star: closest approach of this segment
        vec3 seg = pn - p;
        float ts = clamp(dot(uStar - p, seg) / max(dot(seg, seg), 1e-6), 0.0, 1.0);
        float dc = length(p + seg * ts - uStar);
        starGlow = max(starGlow, trans * (0.003 / (dc * dc + 0.003) * 0.6 + exp(-dc * 3.0) * 0.06));
        if (dc < STAR_R) {
            col += trans * vec3(0.75, 0.86, 1.0) * 3.0;
            trans = 0.0;
            break;
        }

        // relativistic polar jets (synchrotron glow)
        float ay = abs(pn.y);
        float rho = length(pn.xz);
        float w = 0.14 + 0.09 * ay;
        jet += trans * exp(-rho * rho / (w * w)) * smoothstep(1.3, 3.0, ay) * exp(-ay * 0.09)
             * (0.55 + 0.45 * sin(ay * 1.3 - uTime * 2.5)) * dt;

        p = pn;
        float rn = length(p);
        if (rn < 1.0) { captured = true; break; }
        if (rn > 48.0 && dot(p, v) > 0.0) break;
        if (trans < 0.01) break;
    }

    if (!captured && trans > 0.01) col += trans * sky(normalize(v));

    // photon ring: rays with impact parameter near b_c = 3*sqrt(3)/2 r_s wind
    // around the photon sphere and stack many images of the disk. Adding it
    // analytically keeps the ring smooth at low render resolution.
    float ring = exp(-pow((sqrt(h2) - 2.598) * 14.0, 2.0));
    col += ring * vec3(1.0, 0.78, 0.52) * (0.15 + 0.6 * trans);
    col += starGlow * vec3(0.7, 0.84, 1.0) * 1.6;
    col += jet * vec3(0.30, 0.50, 1.0) * 0.07;

    col = aces(col * uExposure);
    col = pow(col, vec3(1.0 / 2.2));
    gl_FragColor = vec4(col, 1.0);
}`;

    const BRIGHT_FRAG = `
uniform sampler2D uTex;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
    vec3 c = texture2D(uTex, vUv + uTexel * vec2(-0.5, -0.5)).rgb
           + texture2D(uTex, vUv + uTexel * vec2( 0.5, -0.5)).rgb
           + texture2D(uTex, vUv + uTexel * vec2(-0.5,  0.5)).rgb
           + texture2D(uTex, vUv + uTexel * vec2( 0.5,  0.5)).rgb;
    c *= 0.25;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    gl_FragColor = vec4(c * smoothstep(0.42, 0.95, l), 1.0);
}`;

    const BLUR_FRAG = `
uniform sampler2D uTex;
uniform vec2 uDir;
varying vec2 vUv;
void main() {
    vec2 o1 = uDir * 1.3846153846;
    vec2 o2 = uDir * 3.2307692308;
    vec3 c = texture2D(uTex, vUv).rgb * 0.2270270270;
    c += (texture2D(uTex, vUv + o1).rgb + texture2D(uTex, vUv - o1).rgb) * 0.3162162162;
    c += (texture2D(uTex, vUv + o2).rgb + texture2D(uTex, vUv - o2).rgb) * 0.0702702703;
    gl_FragColor = vec4(c, 1.0);
}`;

    const COMPOSITE_FRAG = `
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform vec2 uRes;
uniform float uTime;
uniform float uDim;
varying vec2 vUv;
void main() {
    vec2 c = vUv - 0.5;
    float ca = dot(c, c) * 0.012;
    vec3 col;
    col.r = texture2D(uScene, vUv + c * ca).r;
    col.g = texture2D(uScene, vUv).g;
    col.b = texture2D(uScene, vUv - c * ca).b;
    vec3 b = texture2D(uBloom, vUv).rgb;
    col = 1.0 - (1.0 - col) * (1.0 - b * 0.9);
    float vig = smoothstep(1.05, 0.25, length(c * vec2(uRes.x / uRes.y, 1.0)));
    col *= mix(0.45, 1.0, vig) * uDim;
    col += (hash12(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
}`;

    // ================================
    // WebGL renderer
    // ================================
    function startWebGL() {
        const canvas = document.createElement('canvas');
        canvas.className = 'cosmos-canvas';
        const opts = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' };
        const gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts);
        if (!gl) return false;

        const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        const header = 'precision ' + (hp && hp.precision > 0 ? 'highp' : 'mediump') + ' float;\n' + COMMON;

        function compile(type, src) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
                throw new Error(gl.getShaderInfoLog(s));
            }
            return s;
        }
        function program(fragSrc) {
            const p = gl.createProgram();
            gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
            gl.attachShader(p, compile(gl.FRAGMENT_SHADER, header + fragSrc));
            gl.bindAttribLocation(p, 0, 'aPos');
            gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) {
                throw new Error(gl.getProgramInfoLog(p));
            }
            const locs = {};
            return { p, u: (name) => (name in locs ? locs[name] : (locs[name] = gl.getUniformLocation(p, name))) };
        }
        function target(w, h) {
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            const fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            return { tex, fb, w, h };
        }
        function freeTarget(t) {
            if (!t) return;
            gl.deleteTexture(t.tex);
            gl.deleteFramebuffer(t.fb);
        }

        let P, scene, bloomA, bloomB;
        function setup() {
            P = {
                scene: program(SCENE_FRAG),
                bright: program(BRIGHT_FRAG),
                blur: program(BLUR_FRAG),
                comp: program(COMPOSITE_FRAG)
            };
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            scene = bloomA = bloomB = null;
        }

        try {
            setup();
        } catch (err) {
            console.warn('[cosmos] WebGL shader failed, using 2D fallback:', err);
            return false;
        }

        spaceBg.classList.add('cosmos-gl');
        spaceBg.appendChild(canvas);
        const hud = buildHud(true);

        // ---------- sizing & adaptive quality ----------
        const quality = {
            scale: isMobile ? 0.7 : 0.72,
            maxPixels: isMobile ? 360000 : 1100000,
            steps: isMobile ? 120 : 200
        };
        let W = 0, H = 0, sw = 0, sh = 0;
        const offset = [0, 0];
        let portrait = false;

        function resize() {
            W = window.innerWidth;
            H = window.innerHeight;
            const s = Math.min(quality.scale, Math.sqrt(quality.maxPixels / (W * H)));
            sw = Math.max(64, Math.round(W * s));
            sh = Math.max(64, Math.round(H * s));
            canvas.width = sw;
            canvas.height = sh;
            freeTarget(scene); freeTarget(bloomA); freeTarget(bloomB);
            scene = target(sw, sh);
            const bw = Math.max(16, sw >> 1), bh = Math.max(16, sh >> 1);
            bloomA = target(bw, bh);
            bloomB = target(bw, bh);

            // black hole sits to the right on wide screens, high and centred on portrait
            const aspect = W / H;
            offset[0] = aspect > 1.05 ? Math.min(0.46, aspect * 0.5 - 0.32) : 0;
            offset[1] = aspect > 1.05 ? -0.02 : 0.02;
            portrait = aspect < 0.8;
        }

        // ---------- camera ----------
        const cam = { pos: [0, 0, 0], right: [0, 0, 0], up: [0, 0, 0], fwd: [0, 0, 0], dist: 31 };
        let scrollTarget = 0, scrollCur = 0, mx = 0, my = 0;

        function readScroll() {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            scrollTarget = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        }

        function cross(a, b) {
            return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        }
        function norm(a) {
            const l = Math.hypot(a[0], a[1], a[2]) || 1;
            return [a[0] / l, a[1] / l, a[2] / l];
        }

        function updateCamera(dt, time) {
            scrollCur += (scrollTarget - scrollCur) * (1 - Math.exp(-dt * 2.5));
            const tx = pointer.inside ? pointer.x / W - 0.5 : 0;
            const ty = pointer.inside ? pointer.y / H - 0.5 : 0;
            mx += (tx - mx) * (1 - Math.exp(-dt * 1.5));
            my += (ty - my) * (1 - Math.exp(-dt * 1.5));

            // scrolling flies the camera around the hole and down toward the disk plane
            const s = scrollCur;
            const az = 0.55 + time * 0.012 + s * 2.4 + mx * 0.22;
            const el = 0.165 - s * 0.1 + my * 0.06;
            const dist = (31 - s * 8) * (portrait ? 1.35 : 1);
            cam.dist = dist;

            const pos = [dist * Math.cos(el) * Math.cos(az), dist * Math.sin(el), dist * Math.cos(el) * Math.sin(az)];
            const fwd = norm([-pos[0], -pos[1], -pos[2]]);
            const right = norm(cross(fwd, [0, 1, 0]));
            const up = cross(right, fwd);
            const roll = -0.1 + mx * 0.04;
            const cr = Math.cos(roll), sr = Math.sin(roll);
            cam.right = [right[0] * cr + up[0] * sr, right[1] * cr + up[1] * sr, right[2] * cr + up[2] * sr];
            cam.up = [up[0] * cr - right[0] * sr, up[1] * cr - right[1] * sr, up[2] * cr - right[2] * sr];
            cam.pos = pos;
            cam.fwd = fwd;
        }

        // ---------- render ----------
        const rippleData = new Float32Array(16);

        function draw() {
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        function bindTex(unit, tex) {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, tex);
        }

        function render(time, sim) {
            // companion blue giant on an inclined orbit outside the disk
            const th = time * (Math.PI * 2 / 75) + 2.2;
            const R = 12.5, inc = 0.42;
            const star = [R * Math.cos(th), R * Math.sin(th) * Math.sin(inc), R * Math.sin(th) * Math.cos(inc)];

            for (let i = 0; i < 4; i++) {
                const r = ripples[i];
                rippleData[i * 4] = r ? r.x : 0;
                rippleData[i * 4 + 1] = r ? r.y : 0;
                rippleData[i * 4 + 2] = r ? r.t : 0;
                rippleData[i * 4 + 3] = r ? r.amp : 0;
            }

            // 1. ray-traced scene
            let s = P.scene;
            gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fb);
            gl.viewport(0, 0, sw, sh);
            gl.useProgram(s.p);
            gl.uniform2f(s.u('uRes'), sw, sh);
            gl.uniform1f(s.u('uTime'), time);
            gl.uniform1f(s.u('uSim'), sim);
            gl.uniform3fv(s.u('uCamPos'), cam.pos);
            gl.uniform3fv(s.u('uCamRight'), cam.right);
            gl.uniform3fv(s.u('uCamUp'), cam.up);
            gl.uniform3fv(s.u('uCamFwd'), cam.fwd);
            gl.uniform2fv(s.u('uOffset'), offset);
            gl.uniform1f(s.u('uFocal'), 1.1);
            gl.uniform1i(s.u('uSteps'), quality.steps);
            gl.uniform3f(s.u('uMouse'), (pointer.x - W / 2) / H, (H / 2 - pointer.y) / H, pointer.lens);
            gl.uniform4fv(s.u('uRipples'), rippleData);
            gl.uniform3fv(s.u('uStar'), star);
            gl.uniform1f(s.u('uExposure'), 1.0);
            draw();

            // 2. bloom: bright pass + separable blur (wider horizontally = anamorphic)
            s = P.bright;
            gl.bindFramebuffer(gl.FRAMEBUFFER, bloomA.fb);
            gl.viewport(0, 0, bloomA.w, bloomA.h);
            gl.useProgram(s.p);
            bindTex(0, scene.tex);
            gl.uniform1i(s.u('uTex'), 0);
            gl.uniform2f(s.u('uTexel'), 1 / sw, 1 / sh);
            draw();

            s = P.blur;
            gl.useProgram(s.p);
            gl.uniform1i(s.u('uTex'), 0);
            for (let k = 1; k <= 3; k++) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, bloomB.fb);
                bindTex(0, bloomA.tex);
                gl.uniform2f(s.u('uDir'), (k * 1.6) / bloomA.w, 0);
                draw();
                gl.bindFramebuffer(gl.FRAMEBUFFER, bloomA.fb);
                bindTex(0, bloomB.tex);
                gl.uniform2f(s.u('uDir'), 0, k / bloomA.h);
                draw();
            }

            // 3. composite to screen
            s = P.comp;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, sw, sh);
            gl.useProgram(s.p);
            bindTex(0, scene.tex);
            bindTex(1, bloomA.tex);
            gl.uniform1i(s.u('uScene'), 0);
            gl.uniform1i(s.u('uBloom'), 1);
            gl.uniform2f(s.u('uRes'), sw, sh);
            gl.uniform1f(s.u('uTime'), time);
            gl.uniform1f(s.u('uDim'), isMobile ? 0.72 : 0.86);
            draw();
        }

        // ---------- loop ----------
        let time = 0, sim = 0, last = performance.now();
        let running = true, firstFrame = true, lost = false;
        const perf = { warm: 45, frames: 0, acc: 0 };

        // drop resolution / step count while the GPU can't hold ~40 fps
        function adapt(ms) {
            if (perf.warm > 0) { perf.warm--; return; }
            perf.acc += ms;
            if (++perf.frames < 50) return;
            const avg = perf.acc / perf.frames;
            perf.acc = perf.frames = 0;
            if (avg > 24 && quality.scale > 0.3) {
                quality.scale *= 0.8;
                quality.steps = Math.max(90, Math.round(quality.steps * 0.88));
                resize();
                perf.warm = 30;
            }
        }

        let telemetryClock = 0;
        function frame(now) {
            if (!running || lost) return;
            const ms = now - last;
            const dt = Math.min(ms / 1000, 0.1);
            last = now;
            time += dt;
            sim += dt * 2.6;

            pointer.lens += ((pointer.inside ? 1 : 0) - pointer.lens) * (1 - Math.exp(-dt * 4));
            for (let i = 0; i < ripples.length; i++) {
                if (ripples[i] && time - ripples[i].t > 5) ripples[i] = null;
            }

            updateCamera(dt, time);
            render(time, sim);
            if (firstFrame) { canvas.classList.add('is-ready'); firstFrame = false; }

            telemetryClock += dt;
            if (telemetryClock > 0.25) { hud.telemetry(cam.dist); telemetryClock = 0; }

            adapt(ms);
            requestAnimationFrame(frame);
        }

        function renderStill() {
            updateCamera(10, 0);
            render(0, 0);
            hud.telemetry(cam.dist);
            canvas.classList.add('is-ready');
        }

        // ---------- events ----------
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (lost) return;
                resize();
                readScroll();
                if (reduceMotion) renderStill();
            }, 150);
        });
        window.addEventListener('scroll', readScroll, { passive: true });

        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running && !reduceMotion && !lost) {
                last = performance.now();
                requestAnimationFrame(frame);
            }
        });

        canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            lost = true;
        });
        canvas.addEventListener('webglcontextrestored', () => {
            try {
                setup();
                lost = false;
                resize();
                last = performance.now();
                if (reduceMotion) renderStill(); else requestAnimationFrame(frame);
            } catch (err) {
                console.warn('[cosmos] could not restore WebGL context:', err);
            }
        });

        if (!reduceMotion) {
            document.addEventListener('pointermove', (e) => {
                if (e.pointerType !== 'mouse') return;
                pointer.x = e.clientX;
                pointer.y = e.clientY;
                pointer.inside = true;
            }, { passive: true });
            document.documentElement.addEventListener('mouseleave', () => { pointer.inside = false; });

            let slot = 0;
            // 'click' rather than 'pointerdown' so a touch scroll never triggers a wave
            document.addEventListener('click', (e) => {
                if (e.target.closest('a, button, input, textarea, select, label, [role="button"], .cosmos-hud')) return;
                ripples[slot] = { x: (e.clientX - W / 2) / H, y: (H / 2 - e.clientY) / H, t: time, amp: 1 };
                slot = (slot + 1) % 4;
                hud.flash(GW_INDEX);
            });
        }

        resize();
        readScroll();
        scrollCur = scrollTarget;
        if (reduceMotion) renderStill();
        else requestAnimationFrame(frame);
        return true;
    }

    // ================================
    // 2D canvas fallback (no WebGL)
    // ================================
    function start2D() {
        const canvas = document.createElement('canvas');
        canvas.className = 'cosmos-canvas is-ready';
        spaceBg.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        buildHud(false);

        const GM = 9000;
        const bh = { x: 0, y: 0, rs: 40 };
        let W, H, stars = [], disk = [];
        const bodies = [];

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            bh.rs = Math.max(22, Math.min(W, H) * 0.07);
            bh.x = W * (isMobile ? 0.72 : 0.8);
            bh.y = H * 0.3;
            stars = [];
            for (let i = 0; i < (isMobile ? 120 : 260); i++) {
                stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + 0.3, tw: Math.random() * 6.28 });
            }
            disk = [];
            for (let i = 0; i < (isMobile ? 700 : 1800); i++) {
                const r = bh.rs * (1.6 + Math.pow(Math.random(), 1.6) * 3.4);
                disk.push({ r, a: Math.random() * 6.28, w: Math.sqrt(GM / (r * r * r)) * 3.2, s: Math.random() * 1.8 + 0.5, j: (Math.random() - 0.5) * 0.12 });
            }
        }

        function spawn(initial) {
            const edge = Math.floor(Math.random() * 4);
            const x = initial ? Math.random() * W : edge === 0 ? -20 : edge === 1 ? W + 20 : Math.random() * W;
            const y = initial ? Math.random() * H : edge === 2 ? -20 : edge === 3 ? H + 20 : Math.random() * H;
            const dx = bh.x - x, dy = bh.y - y, d = Math.hypot(dx, dy) || 1;
            const v = Math.sqrt(GM / d) * (0.35 + Math.random() * 0.6) * (Math.random() < 0.5 ? 1 : -1);
            return { x, y, vx: (-dy / d) * v, vy: (dx / d) * v, hue: 190 + Math.random() * 130 };
        }

        function drawDisk(dt, front) {
            ctx.globalCompositeOperation = 'lighter';
            for (const p of disk) {
                if (!front) p.a += p.w * dt;
                const cs = Math.cos(p.a), sn = Math.sin(p.a);
                if ((sn > 0) !== front) continue;
                const heat = 1 - (p.r - bh.rs * 1.6) / (bh.rs * 3.4);
                const beam = 0.5 + 0.5 * cs;
                const alpha = Math.min((0.25 + heat * 0.5) * (0.4 + beam * 0.8), 0.95);
                ctx.fillStyle = `hsla(${20 + (1 - heat) * 20 + beam * 25},100%,${55 + heat * 35}%,${alpha})`;
                ctx.fillRect(bh.x + cs * p.r, bh.y + sn * p.r * 0.28 + p.j * p.r, p.s, p.s);
                if (!front) {
                    // lensed image of the far side arching over the hole
                    ctx.fillRect(bh.x + cs * p.r * 0.8, bh.y - Math.abs(sn) * p.r * (0.55 + 0.7 * bh.rs / p.r), p.s, p.s);
                }
            }
            ctx.globalCompositeOperation = 'source-over';
        }

        function step(dt, t) {
            ctx.clearRect(0, 0, W, H);
            for (const s of stars) {
                const dx = s.x - bh.x, dy = s.y - bh.y, d = Math.hypot(dx, dy);
                if (d < bh.rs * 1.05) continue;
                const k = 1 + (bh.rs * bh.rs * 1.6) / (d * d);
                ctx.fillStyle = `rgba(230,230,255,${0.45 + 0.4 * Math.sin(t * 0.0015 + s.tw)})`;
                ctx.beginPath();
                ctx.arc(bh.x + dx * k, bh.y + dy * k, s.r, 0, 6.2832);
                ctx.fill();
            }
            const g = ctx.createRadialGradient(bh.x, bh.y, bh.rs * 0.9, bh.x, bh.y, bh.rs * 6);
            g.addColorStop(0, 'rgba(255,170,80,0.28)');
            g.addColorStop(0.35, 'rgba(200,80,255,0.10)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(bh.x - bh.rs * 6, bh.y - bh.rs * 6, bh.rs * 12, bh.rs * 12);

            drawDisk(dt, false);
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(bh.x, bh.y, bh.rs, 0, 6.2832);
            ctx.fill();
            drawDisk(dt, true);

            for (let i = 0; i < bodies.length; i++) {
                const b = bodies[i];
                const dx = bh.x - b.x, dy = bh.y - b.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2);
                if (d < bh.rs * 0.9) { bodies[i] = spawn(false); continue; }
                b.vx += (dx * GM / (d2 * d)) * dt;
                b.vy += (dy * GM / (d2 * d)) * dt;
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                if (b.x < -300 || b.x > W + 300 || b.y < -300 || b.y > H + 300) { bodies[i] = spawn(false); continue; }
                ctx.strokeStyle = `hsla(${b.hue},90%,75%,0.7)`;
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(b.x - b.vx * 0.3, b.y - b.vy * 0.3);
                ctx.stroke();
            }
        }

        resize();
        for (let i = 0; i < (isMobile ? 18 : 45); i++) bodies.push(spawn(true));
        window.addEventListener('resize', resize);

        if (reduceMotion) { step(0, 0); return; }
        let last = performance.now(), running = true;
        function frame(t) {
            if (!running) return;
            step(Math.min((t - last) / 1000, 0.05), t);
            last = t;
            requestAnimationFrame(frame);
        }
        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) { last = performance.now(); requestAnimationFrame(frame); }
        });
        requestAnimationFrame(frame);
    }

    if (!startWebGL()) start2D();
})();
