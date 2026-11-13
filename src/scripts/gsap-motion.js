import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════
   1. HERO — split por LETRA com stagger de entrada
══════════════════════════════════════════════════ */
function splitHeroLetters() {
  const h1 = document.querySelector('.hero__title');
  if (!h1 || h1.dataset.letterSplit) return;
  h1.dataset.letterSplit = '1';

  /* GSAP assume controle total do h1 — cancela o CSS de entrada */
  h1.style.cssText += ';opacity:1;transform:none;transition:none;will-change:auto;';

  /* Percorre text nodes preservando <em> */
  const walk = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  let n;
  while ((n = walk.nextNode())) textNodes.push(n);

  textNodes.forEach(node => {
    const frag = document.createDocumentFragment();
    [...node.textContent].forEach(char => {
      if (char === ' ') {
        frag.appendChild(document.createTextNode(' '));
      } else {
        const sp = document.createElement('span');
        sp.className = 'split-letter';
        sp.textContent = char;
        frag.appendChild(sp);
      }
    });
    node.parentNode.replaceChild(frag, node);
  });

  /* Anima letras com stagger */
  gsap.from('.hero__title .split-letter', {
    opacity: 0,
    y: 44,
    rotateX: -70,
    transformOrigin: '50% 100%',
    duration: 0.6,
    ease: 'back.out(1.5)',
    stagger: 0.025,
    delay: 0.25,
  });
}

/* ══════════════════════════════════════════════════
   2. PARALLAX — hero content e mockup em velocidades diferentes
══════════════════════════════════════════════════ */
function initHeroParallax() {
  const content  = document.querySelector('.hero__content');
  const mockups  = document.querySelector('.hero__mockups');
  const gridLines = document.querySelector('.hero__grid-lines');

  if (content) {
    gsap.to(content, {
      y: 70,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  }

  if (mockups) {
    gsap.to(mockups, {
      y: -45,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.8,
      },
    });
  }

  if (gridLines) {
    gsap.to(gridLines, {
      y: 50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 2.5,
      },
    });
  }
}

/* ══════════════════════════════════════════════════
   3. WIPE REVEAL — section-headers (só os wrappers,
      sem conflitar com os filhos animados pelo ui.js)
══════════════════════════════════════════════════ */
function initWipeReveals() {
  /* Só Y slide no container — opacity fica com o ui.js nos filhos */
  document.querySelectorAll('.section-header').forEach(header => {
    gsap.from(header, {
      y: 28,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: header,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* ══════════════════════════════════════════════════
   4. PORTFOLIO CARDS — hover com escala + sombra viva
══════════════════════════════════════════════════ */
function initPortfolioHover() {
  document.querySelectorAll('.project-card').forEach(card => {
    const img = card.querySelector('.browser-screen-img, .browser-mock');

    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.03,
        boxShadow: '0 28px 72px rgba(22,40,61,0.28), 0 8px 24px rgba(58,128,195,0.18)',
        duration: 0.4,
        ease: 'power2.out',
      });
      if (img) gsap.to(img, { scale: 1.05, duration: 0.5, ease: 'power2.out' });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: '',
        duration: 0.5,
        ease: 'power3.out',
      });
      if (img) gsap.to(img, { scale: 1, duration: 0.5, ease: 'power3.out' });
    });

    /* Sombra direcional que segue o mouse */
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      gsap.to(card, {
        boxShadow: `${-x * 18}px ${y * 18 + 20}px 60px rgba(22,40,61,0.25), 0 4px 16px rgba(58,128,195,0.15)`,
        duration: 0.15,
        ease: 'none',
      });
    });
  });
}

/* ══════════════════════════════════════════════════
   INIT — scripts Astro são defer, DOM já está pronto
══════════════════════════════════════════════════ */
splitHeroLetters();
initHeroParallax();
initWipeReveals();
initPortfolioHover();
