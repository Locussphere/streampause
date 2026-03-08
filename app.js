/* ═══════════════════════════════════════════════
   StreamPause — app.js
   ═══════════════════════════════════════════════ */

// ── Load screens.json and boot the app ──────────
fetch('screens.json')
  .then(res => {
    if (!res.ok) throw new Error('Could not load screens.json');
    return res.json();
  })
  .then(data => {
    applyConfig(data.site, data.stats);
    buildCards(data.screens);
    initScrollReveal();
    initCursor();
  })
  .catch(err => {
    console.error('StreamPause error:', err);
    document.getElementById('cardsGrid').innerHTML =
      `<p style="color:#6b6b8a;grid-column:1/-1;text-align:center;padding:40px 0">
        ⚠️ Could not load screens.json — make sure you're serving this over a local server or hosting it online.
      </p>`;
  });

// ── Apply site config from JSON ─────────────────
function applyConfig(site, stats) {
  // Title & meta
  document.title = `${site.title} — BRB Screens for Streamers`;
  document.querySelector('.logo').innerHTML =
    site.title.replace('Pause', '<span>Pause</span>');
  document.querySelector('.nav-badge').textContent = site.badge;
  document.querySelector('.hero-sub').textContent = site.description;
  document.querySelector('.footer-logo').innerHTML =
    site.title.replace('Pause', '<span>Pause</span>');
  document.querySelector('.footer-tagline').textContent = site.footer;

  // Stats bar
  const statEls = document.querySelectorAll('.stat');
  stats.forEach((s, i) => {
    if (!statEls[i]) return;
    statEls[i].querySelector('.stat-num').textContent = s.value;
    statEls[i].querySelector('.stat-label').textContent = s.label;
  });
}

// ── Build card grid from screens array ──────────
function buildCards(screens) {
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';

  screens.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'brb-card';
    card.innerHTML = `
      <div class="card-preview" id="preview-${i}">
        <div class="iframe-loading" id="loading-${i}">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
        <iframe
          src="${s.url}"
          title="${s.name} preview"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          onload="iframeLoaded(${i})"
          onerror="iframeError(${i})"
        ></iframe>
        <div class="card-preview-overlay" onclick="openModal('${s.url}', '${s.name}')">
          <div class="preview-play-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f5a0" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-info">
          <div class="card-name">${s.name}</div>
          <div class="card-meta">${s.meta}</div>
          <div class="card-tags">
            ${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="card-action">
          <button class="icon-btn" title="Full preview" onclick="openModal('${s.url}', '${s.name}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="icon-btn" title="Copy link" onclick="copyLink(this, '${s.url}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
    scaleIframe(i);
  });

  window.addEventListener('resize', () => {
    screens.forEach((_, i) => scaleIframe(i));
  });
}

// ── Scale iframes to fit the card preview ───────
function scaleIframe(i) {
  const wrapper = document.getElementById(`preview-${i}`);
  if (!wrapper) return;
  const iframe = wrapper.querySelector('iframe');
  if (!iframe) return;
  const scale = wrapper.clientWidth / 1920;
  iframe.style.transform = `scale(${scale})`;
  iframe.style.height = (wrapper.clientHeight / scale) + 'px';
}

function iframeLoaded(i) {
  const el = document.getElementById(`loading-${i}`);
  if (el) el.classList.add('hidden');
}

function iframeError(i) {
  const el = document.getElementById(`loading-${i}`);
  if (el) el.innerHTML =
    '<span style="font-size:0.72rem;color:#6b6b8a;letter-spacing:1px">Preview unavailable</span>';
}

// ── Modal ────────────────────────────────────────
const modal      = document.getElementById('modalOverlay');
const modalIframe = document.getElementById('modalIframe');
const modalTitle  = document.getElementById('modalTitle');

function openModal(url, name) {
  modalIframe.src = url;
  modalTitle.textContent = name;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  modalIframe.src = '';
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Copy link ────────────────────────────────────
function copyLink(btn, url) {
  navigator.clipboard.writeText(url).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '✓';
    btn.style.color = '#00f5a0';
    btn.style.borderColor = 'rgba(0,245,160,0.5)';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 1500);
  });
}

// ── Scroll reveal ────────────────────────────────
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 100);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(r => obs.observe(r));
}

// ── Custom cursor ────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .brb-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '20px'; cursor.style.height = '20px';
      ring.style.width    = '56px'; ring.style.height   = '56px';
      ring.style.borderColor = 'rgba(0,245,160,0.7)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '12px'; cursor.style.height = '12px';
      ring.style.width    = '36px'; ring.style.height   = '36px';
      ring.style.borderColor = 'rgba(0,245,160,0.4)';
    });
  });
}
