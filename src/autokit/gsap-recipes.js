/* AutoKit motion recipes — GSAP 3 + ScrollTrigger.
   Rules: create ONLY inside gsap.matchMedia('(prefers-reduced-motion: no-preference)').
   CSS owns ambient loops (marquee, mascot bob/snap, pulse dots, dashed flow) and all hovers.
   GSAP owns entrances, scroll choreography, pointer-driven effects.
   Every page must also work with JS off (.js class gate on hidden states). */

/* Hero entrance — stagger down the copy column, hardware slides in, mascot bounces last */
export function heroEntrance() {
  const tl = gsap.timeline();
  tl.from('.pill', { y: 24, autoAlpha: 0, scale: .85, ease: 'back.out(1.6)' }, .05)
    .from('.hero h1', { y: 56, autoAlpha: 0, duration: .9, ease: 'expo.out' }, .15)
    .from('.hero .lead', { y: 30, autoAlpha: 0 }, .38)
    .from('.hero-cta .btn', { y: 22, autoAlpha: 0, scale: .92, stagger: .09, ease: 'back.out(1.5)' }, .52)
    .from('.term', { y: 70, autoAlpha: 0, duration: .9, ease: 'expo.out' }, .3)
    .from('.lob', { y: -110, autoAlpha: 0, duration: .85, ease: 'bounce.out' }, .75);
  return tl;
}

/* Scroll reveal per section header — one trigger per element, once */
export function sectionHeaders() {
  document.querySelectorAll('section .sec-tag, section h2, section .sec-intro').forEach(el => {
    gsap.from(el, { y: 34, autoAlpha: 0, duration: .75, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
}

/* Diagram choreography — container in, nodes pop in flow order, labels then links */
export function pipelineReveal(card) {
  return gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 78%', once: true } })
    .from(card, { y: 50, autoAlpha: 0, duration: .7, ease: 'expo.out' })
    .from('.pipe rect', { scale: .6, autoAlpha: 0, transformOrigin: 'center', stagger: .14, ease: 'back.out(1.8)', duration: .5 }, .25)
    .from('.pipe text, .pipe .nico', { autoAlpha: 0, stagger: .025, duration: .3 }, .5)
    .from('.pipe .link', { autoAlpha: 0, stagger: .12, duration: .4 }, .45);
}

/* Chat conversation — bubbles land in reading order, typing indicator swaps for the reply */
export function chatPlay(chatEl) {
  const msgs = chatEl.querySelectorAll('.msg, .typing');
  gsap.set(msgs, { autoAlpha: 0, y: 16, scale: .96 });
  return gsap.timeline({ scrollTrigger: { trigger: chatEl.closest('.phone'), start: 'top 72%', once: true } })
    .from(chatEl.closest('.phone'), { y: 60, autoAlpha: 0, rotation: 2, duration: .8, ease: 'back.out(1.2)' })
    .to(msgs[0], { autoAlpha: 1, y: 0, scale: 1, duration: .4, ease: 'back.out(1.6)' }, '+=.2')
    .to(msgs[1], { autoAlpha: 1, y: 0, scale: 1, duration: .4, ease: 'back.out(1.6)' }, '+=.5')
    .to(msgs[2], { autoAlpha: 1, y: 0, scale: 1, duration: .4, ease: 'back.out(1.6)' }, '+=.6')
    .to(msgs[3], { autoAlpha: 1, y: 0, scale: 1, duration: .3 }, '+=.4')                 // typing…
    .to(msgs[3], { autoAlpha: 0, duration: .25, display: 'none' }, '+=1.1')
    .to(msgs[4], { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: 'back.out(1.5)' }, '<+.1');
}

/* Ghost numeral parallax — slow scrubbed drift, decorative depth */
export function ghostNumerals() {
  document.querySelectorAll('.sec-num').forEach(el => {
    gsap.fromTo(el, { yPercent: 18 }, { yPercent: -14, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
  });
}

/* Pointer-only (gate with matchMedia('(pointer:fine)')) */
export function magneticButton(btn, range = 4) {
  const qx = gsap.quickTo(btn, 'x', { duration: .35, ease: 'power3' });
  const qy = gsap.quickTo(btn, 'y', { duration: .35, ease: 'power3' });
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    qx(gsap.utils.clamp(-range, range, (e.clientX - r.left - r.width / 2) * .08));
    qy(gsap.utils.clamp(-range, range, (e.clientY - r.top - r.height / 2) * .15));
  });
  btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: .45, ease: 'elastic.out(1,.5)' }));
}

export function tiltStage(stage, max = 6) {
  gsap.set(stage, { transformPerspective: 900 });
  const rx = gsap.quickTo(stage, 'rotationX', { duration: .5, ease: 'power2.out' });
  const ry = gsap.quickTo(stage, 'rotationY', { duration: .5, ease: 'power2.out' });
  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    ry(gsap.utils.clamp(-max, max, ((e.clientX - r.left) / r.width - .5) * 10));
    rx(gsap.utils.clamp(-max, max, -((e.clientY - r.top) / r.height - .5) * 10));
  });
  stage.addEventListener('mouseleave', () => { rx(0); ry(0); });
}

/* One-shot mascot wave for closing sections (disable ambient claw loops in CSS first) */
export function lobWave(sel = '.final .lob-wave') {
  return gsap.timeline({ scrollTrigger: { trigger: '.final', start: 'top 65%', once: true } })
    .from(sel, { y: 24, autoAlpha: 0, scale: .8, transformOrigin: '50% 90%', ease: 'back.out(1.7)', duration: .6 })
    .to(`${sel} .clawR`, { rotation: 22, transformOrigin: '18% 70%', duration: .18, ease: 'power2.out' })
    .to(`${sel} .clawR`, { rotation: -8, duration: .16 })
    .to(`${sel} .clawR`, { rotation: 16, duration: .16 })
    .to(`${sel} .clawR`, { rotation: 0, duration: .25, ease: 'power2.inOut' });
}
