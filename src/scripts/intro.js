import { gsap } from 'gsap';

function runIntro() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  const letters = overlay.querySelectorAll('.intro__letter');
  const fills   = overlay.querySelectorAll('.intro__fill');
  const track   = overlay.querySelector('.intro__letters');

  // Block scroll during intro
  document.body.style.overflow = 'hidden';

  // Set initial spread: each letter starts displaced from center
  letters.forEach((letter, i) => {
    const center = (letters.length - 1) / 2; // 2.0 for 5 letters
    const offset = (i - center) * 12;        // 12vw gap per step
    gsap.set(letter, { x: `${offset}vw` });
  });

  const tl = gsap.timeline({
    delay: 0.3,
    onComplete: () => {
      document.body.style.overflow = '';
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => { overlay.style.display = 'none'; },
      });
    },
  });

  // 1. Ghost letters fade in
  tl.from(letters, {
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.1,
  });

  // 2. Gradient rises inside each letter bottom → top
  tl.to(fills, {
    clipPath: 'inset(0% 0 0 0)',
    duration: 1.0,
    ease: 'power2.inOut',
    stagger: 0.14,
  }, '+=0.2');

  // 3. Letters slide together (merge)
  tl.to(letters, {
    x: 0,
    duration: 0.9,
    ease: 'expo.inOut',
  }, '+=0.35');

  // 4. Cinematic tilt
  tl.to(track, {
    rotation: 3,
    duration: 0.45,
    ease: 'power2.inOut',
  }, '-=0.5');

  // 5. Scale up — letters become the background
  tl.to(track, {
    scale: 30,
    opacity: 0,
    rotation: 5,
    duration: 1.1,
    ease: 'expo.in',
  }, '+=0.15');
}

runIntro();
