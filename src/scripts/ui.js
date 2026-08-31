/* ════════════════════════════════════════
   MOTION DESIGN — inicialização completa
════════════════════════════════════════ */

/* ── 1. NAV: tint + shrink no scroll ── */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (!nav) return;
  nav.style.background = y > 60 ? 'rgba(22,40,61,0.97)' : 'rgba(22,40,61,0.85)';
  nav.classList.toggle('nav--scrolled', y > 80);
}, { passive: true });

/* ── 2. Hero staggered entrance ── */
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    document.querySelector('.hero')?.classList.add('hero--loaded');
  });
});

/* ── 3. Split text (por palavras) ── */
function splitWords(el) {
  if (el.dataset.split) return;
  el.dataset.split = '1';
  /* Percorre só text nodes para preservar tags <em>, <br> etc. */
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let n;
  while ((n = walk.nextNode())) nodes.push(n);
  let wi = 0;
  nodes.forEach(node => {
    if (!node.textContent.trim()) return;
    const words = node.textContent.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    words.forEach(part => {
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else if (part) {
        const sp = document.createElement('span');
        sp.className = 'split-word';
        sp.style.setProperty('--wi', wi++);
        sp.textContent = part;
        frag.appendChild(sp);
      }
    });
    node.parentNode.replaceChild(frag, node);
  });
}

/* ── 4. IntersectionObservers ── */

/* Section titles: split + wave reveal */
const titleObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    titleObs.unobserve(e.target);
    splitWords(e.target);
    requestAnimationFrame(() => e.target.classList.add('words-revealed'));
  });
}, { threshold: 0.25, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.section-title').forEach(t => titleObs.observe(t));

/* Eyebrow + section-sub: fade up */
const subObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    subObs.unobserve(e.target);
    e.target.classList.add('visible');
  });
}, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.eyebrow, .section-sub').forEach(el => subObs.observe(el));

/* Cards gerais: staggered fade-up + scale-in */
const reveal = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.style.opacity = '1';
    e.target.style.transform = 'translateY(0) scale(1)';
    reveal.unobserve(e.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.project-card,.insight-card,.diff-card,.process-step,.service-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px) scale(0.97)';
  el.style.transition = `opacity .55s cubic-bezier(.25,1,.5,1) ${i * 0.07}s, transform .55s cubic-bezier(.25,1,.5,1) ${i * 0.07}s`;
  reveal.observe(el);
});

/* Member cards: foto reveal */
const photoObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    photoObs.unobserve(e.target);
    setTimeout(() => e.target.classList.add('photo-revealed'), 150);
  });
}, { threshold: 0.3 });
document.querySelectorAll('.member-card').forEach(c => photoObs.observe(c));

/* Browser-mock: reveal mask deslizante */
const maskObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (!e.isIntersecting) return;
    maskObs.unobserve(e.target);
    setTimeout(() => e.target.classList.add('mask-off'), i * 90);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.browser-mock').forEach(m => maskObs.observe(m));

/* ── 5. Card 3D Tilt (magnetic-hover) ── */
document.querySelectorAll('.project-card,.service-card,.diff-card,.insight-card,.member-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 9;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -9;
    card.style.transition = 'transform .08s ease, box-shadow .08s ease';
    card.style.transform  = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) scale(1.025) translateY(-4px)`;
    card.style.boxShadow  = `${-x * 1.2}px ${Math.abs(y) * 1.5}px 44px rgba(22,40,61,0.16)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .45s cubic-bezier(.25,1,.5,1), box-shadow .45s ease';
    card.style.transform  = '';
    card.style.boxShadow  = '';
  });
});

/* ── 6. Button ripple no clique ── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const rip = document.createElement('span');
    rip.className = 'btn-ripple';
    const rect = btn.getBoundingClientRect();
    rip.style.left = (e.clientX - rect.left) + 'px';
    rip.style.top  = (e.clientY - rect.top)  + 'px';
    btn.appendChild(rip);
    rip.addEventListener('animationend', () => rip.remove());
  });
});

/* ══════════════════════════════════════
   HERO MOCK STACK — card cycling
══════════════════════════════════════ */
(function () {
  const cards = Array.from(document.querySelectorAll('.mock-card'));
  const ORDER = ['front','mid','back'];

  function triggerAnim(card) {
    const pane = card.querySelector('.mock-pane');
    if (!pane) return;
    pane.classList.remove('anim-play');
    void pane.offsetWidth; /* force reflow so animation restarts */
    pane.classList.add('anim-play');
  }

  function rotate() {
    cards.forEach(c => {
      const cur = ORDER.indexOf(c.dataset.pos);
      c.dataset.pos = ORDER[(cur + 1) % 3];
    });
    /* trigger entrance on whichever card is now front */
    const front = cards.find(c => c.dataset.pos === 'front');
    if (front) triggerAnim(front);
  }

  /* click anywhere on any card → advance */
  cards.forEach(card => card.addEventListener('click', rotate));

  /* auto-advance every 3.5s */
  setInterval(rotate, 3500);

  /* initial entrance on page load */
  const initialFront = cards.find(c => c.dataset.pos === 'front');
  if (initialFront) triggerAnim(initialFront);
})();


/* ── Fechar menu mobile: ao clicar em link ou fora ── */
function closeMenu() {
  const menu = document.querySelector('.nav__links');
  const btn  = document.querySelector('.nav__hamburger');
  if (!menu.classList.contains('open')) return;
  menu.classList.remove('open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}
document.querySelectorAll('.nav__links a').forEach(link => {
  link.addEventListener('click', closeMenu);
});
document.addEventListener('click', e => {
  const menu = document.querySelector('.nav__links');
  const btn  = document.querySelector('.nav__hamburger');
  if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
    closeMenu();
  }
});
