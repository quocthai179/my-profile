// ================================
// Blog: danh sách bài + trang đọc bài
// ================================
const MONTHS_VI = (d) => {
    const [y, m, day] = d.split('-');
    return `${parseInt(day, 10)}/${parseInt(m, 10)}/${y}`;
};

const readingTime = (html) => {
    const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
};

const esc = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const sorted = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

function postCard(p) {
    return `
        <a class="post-card" href="post.html?p=${encodeURIComponent(p.slug)}">
            <div class="post-cover"><i class="fas ${esc(p.cover || 'fa-pen')}"></i></div>
            <div class="post-body">
                <div class="post-meta">
                    <span class="post-category">${esc(p.category)}</span>
                    <span><i class="far fa-calendar"></i> ${MONTHS_VI(p.date)}</span>
                    <span><i class="far fa-clock"></i> ${readingTime(p.content)} phút đọc</span>
                </div>
                <h3 class="post-title">${esc(p.title)}</h3>
                <p class="post-excerpt">${esc(p.excerpt)}</p>
                <div class="post-tags">${p.tags.map(t => `<span class="tech-tag">${esc(t)}</span>`).join('')}</div>
            </div>
        </a>`;
}

// ---------- Trang chủ blog ----------
const postList = document.getElementById('post-list');
if (postList) {
    const filters = document.getElementById('post-filters');
    const search = document.getElementById('post-search');
    const empty = document.getElementById('post-empty');
    let category = 'all';

    const categories = [...new Set(sorted.map(p => p.category))];
    filters.innerHTML = ['all', ...categories].map(c =>
        `<button class="filter-btn${c === 'all' ? ' active' : ''}" data-cat="${esc(c)}">${c === 'all' ? 'Tất cả' : esc(c)}</button>`
    ).join('');

    const render = () => {
        const q = search.value.trim().toLowerCase();
        const items = sorted.filter(p =>
            (category === 'all' || p.category === category) &&
            (!q || (p.title + ' ' + p.excerpt + ' ' + p.tags.join(' ')).toLowerCase().includes(q))
        );
        postList.innerHTML = items.map(postCard).join('');
        empty.hidden = items.length > 0;
    };

    filters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        category = btn.dataset.cat;
        render();
    });
    search.addEventListener('input', render);
    render();
}

// ---------- Trang đọc bài ----------
const article = document.getElementById('article');
if (article) {
    const slug = new URLSearchParams(location.search).get('p');
    const idx = sorted.findIndex(p => p.slug === slug);
    if (idx === -1) {
        article.innerHTML = `
            <div class="post-notfound">
                <h1>Không tìm thấy bài viết</h1>
                <p><a href="index.html">← Quay lại danh sách bài viết</a></p>
            </div>`;
    } else {
        const p = sorted[idx];
        document.title = `${p.title} - Thái's Blog`;
        const newer = sorted[idx - 1], older = sorted[idx + 1];
        article.innerHTML = `
            <a class="back-link" href="index.html"><i class="fas fa-arrow-left"></i> Tất cả bài viết</a>
            <header class="article-header">
                <div class="post-meta">
                    <span class="post-category">${esc(p.category)}</span>
                    <span><i class="far fa-calendar"></i> ${MONTHS_VI(p.date)}</span>
                    <span><i class="far fa-clock"></i> ${readingTime(p.content)} phút đọc</span>
                </div>
                <h1>${esc(p.title)}</h1>
                <div class="post-tags">${p.tags.map(t => `<span class="tech-tag">${esc(t)}</span>`).join('')}</div>
            </header>
            <div class="article-content">${p.content}</div>
            <nav class="article-nav">
                ${older ? `<a href="post.html?p=${encodeURIComponent(older.slug)}"><small>← Bài trước</small><span>${esc(older.title)}</span></a>` : '<span></span>'}
                ${newer ? `<a class="next" href="post.html?p=${encodeURIComponent(newer.slug)}"><small>Bài sau →</small><span>${esc(newer.title)}</span></a>` : '<span></span>'}
            </nav>`;
    }
}
