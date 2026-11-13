import { gsap } from 'gsap';

function runIntro() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  const letters = overlay.querySelectorAll('.intro__letter');
  const fills   = overlay.querySelectorAll('.intro__fill');
  const track   = overlay.querySelector('.intro__letters');

  document.body.style.overflow = 'hidden';

  // Spread letters apart from center
  letters.forEach((letter, i) => {
    const center = (letters.length - 1) / 2;
    gsap.set(letter, { x: `${(i - center) * 14}vw` });
  });

  const tl = gsap.timeline({
    delay: 0.3,
    onComplete: () => {
      document.body.style.overflow = '';
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => { overlay.style.display = 'none'; },
      });
    },
  });

  // 1. Ghost letters aparecem
  tl.from(letters, {
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.1,
  });

  // 2. Gradiente sobe dentro de cada letra
  tl.to(fills, {
    clipPath: 'inset(0% 0 0 0)',
    duration: 1.0,
    ease: 'power2.inOut',
    stagger: 0.14,
  }, '+=0.15');

  // 3. Letras se juntam
  tl.to(letters, {
    x: 0,
    duration: 0.9,
    ease: 'expo.inOut',
  }, '+=0.3');

  // 4. UMA LINHA SÓ: rotação 90° + zoom + viram o hero
  tl.to(track, {
    rotation: -90,
    scale: 28,
    opacity: 0,
    duration: 1.3,
    ease: 'expo.in',
  }, '+=0.2');
}

runIntro();
