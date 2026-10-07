'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { works } from '@/lib/catalogue';
import { site } from '@/lib/site';
import { Photo } from './Photo';
import { ImageTrail } from './ImageTrail';
import { useLenis } from './motion/SmoothScroll';
import { Flip, gsap, hasFinePointer, lerp, prefersReducedMotion, ScrollTrigger, useGSAP } from './motion/gsap';

// Ported from the Awwwards Pack "Hover Motion & Transition Image Grid" (Hero Animations 14).
// A wall of portraits drifts with the pointer, each row lagging a little more than the one nearer the middle.
// The first scroll, tap or key press flips the centre portrait out to fill the screen and the page begins.

const ROWS = 5;
const COLS = 7;
const MIDDLE_ROW = Math.floor(ROWS / 2);
const MIDDLE_COL = Math.floor(COLS / 2);
const hero = works.find((work) => work.id === 'ruby')!;
const wall = works.filter((work) => work.id !== hero.id);

function wallWork(row: number, col: number) {
  if (row === MIDDLE_ROW && col === MIDDLE_COL) return hero;
  return wall[(row * COLS + col * 3) % wall.length];
}

export function Intro() {
  const root = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  const enteredRef = useRef(false);
  const lenis = useLenis();

  // Pointer-driven drift of the rows, with contrast and brightness rising towards the edges.
  useEffect(() => {
    const section = root.current;
    if (!section || prefersReducedMotion()) return;
    const rows = Array.from(section.querySelectorAll<HTMLElement>('.wall__row'));
    const fine = hasFinePointer();
    const styles = rows.map((_, i) => ({ amt: Math.max(0.1 - Math.abs(i - MIDDLE_ROW) * 0.03, 0.05), x: 0, contrast: 100, brightness: 100 }));
    let pointerX = window.innerWidth / 2;
    let frame = 0;
    const start = performance.now();

    const onMove = (event: PointerEvent) => (pointerX = event.clientX);
    window.addEventListener('pointermove', onMove);

    const render = (now: number) => {
      const width = window.innerWidth;
      // On touch screens there is no pointer to follow, so the wall sways on its own.
      const t = fine ? (pointerX / width) * 2 - 1 : Math.sin((now - start) / 2600) * 0.55;
      const edge = Math.pow(Math.abs(t), 2);
      const target = { x: t * 0.4 * width, contrast: 100 + edge * 230, brightness: 100 - edge * 85 };
      rows.forEach((row, i) => {
        const s = styles[i];
        s.x = lerp(s.x, target.x, s.amt);
        s.contrast = lerp(s.contrast, target.contrast, s.amt);
        s.brightness = lerp(s.brightness, target.brightness, s.amt);
        gsap.set(row, { x: s.x, filter: `contrast(${s.contrast}%) brightness(${s.brightness}%)` });
      });
      if (!enteredRef.current) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  // Hold the page still until the visitor steps inside.
  useEffect(() => {
    if (!lenis || enteredRef.current) return;
    lenis.stop();
  }, [lenis]);

  const { contextSafe } = useGSAP({ scope: root });

  const enter = contextSafe(() => {
    if (enteredRef.current || !root.current) return;
    enteredRef.current = true;
    const section = root.current;
    const tile = section.querySelector<HTMLElement>('[data-flip-id="hero"]')!;
    const full = section.querySelector<HTMLElement>('.intro__full')!;
    const fullImage = full.querySelector<HTMLElement>('.photo')!;
    const copy = section.querySelectorAll<HTMLElement>('[data-intro-reveal]');

    const state = Flip.getState(tile);
    tile.style.visibility = 'hidden';
    full.style.visibility = 'visible';

    gsap
      .timeline({
        onComplete: () => {
          setEntered(true);
          lenis?.start();
          ScrollTrigger.refresh();
        },
      })
      .add(Flip.from(state, { targets: full, duration: 0.9, ease: 'power4', absolute: true }))
      .to('.wall', { opacity: 0.01, duration: 0.9, ease: 'power4' }, 0)
      .to(fullImage, { scale: 1.2, duration: 3, ease: 'sine' }, '<-=0.45')
      .to(fullImage, { scale: 1.1, startAt: { filter: 'brightness(100%)' }, filter: 'brightness(48%)', y: '-4vh', duration: 0.9, ease: 'power4' }, 0.9)
      .add(() => document.documentElement.setAttribute('data-entered', ''), 0.9)
      .fromTo(copy, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.095 }, 1.05)
      .to('.intro__enter', { opacity: 0, duration: 0.4 }, 0);
  });

  // Reduced motion skips the wall and opens straight on the portrait.
  useEffect(() => {
    if (!prefersReducedMotion()) return;
    enteredRef.current = true;
    setEntered(true);
    document.documentElement.setAttribute('data-entered', '');
  }, []);

  // Any first gesture steps inside: a scroll, a swipe or a key press.
  useEffect(() => {
    if (entered) return;
    const go = () => enter();
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter', 'End'].includes(event.key)) go();
    };
    window.addEventListener('wheel', go, { passive: true });
    window.addEventListener('touchmove', go, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', go);
      window.removeEventListener('touchmove', go);
      window.removeEventListener('keydown', onKey);
    };
  }, [entered, enter]);

  return (
    <section ref={root} className="intro" data-state={entered ? 'open' : 'closed'} aria-label="Introduction">
      <div className="wall" aria-hidden="true">
        {Array.from({ length: ROWS }, (_, row) => (
          <div className="wall__row" key={row}>
            {Array.from({ length: COLS }, (_, col) => {
              const work = wallWork(row, col);
              const isHero = row === MIDDLE_ROW && col === MIDDLE_COL;
              return (
                <div className="wall__item" key={col}>
                  <div className="wall__inner" data-flip-id={isHero ? 'hero' : undefined}>
                    <Photo work={work} sizes="(max-width: 700px) 40vw, 22vw" decorative priority={isHero} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="intro__full" data-flip-id="hero">
        <Photo work={hero} sizes="100vw" priority />
      </div>

      <ImageTrail active={entered} />

      <div className="intro__copy">
        <h1 className="intro__title">
          <span className="line" data-intro-reveal>Good dogs,</span>
          <span className="line" data-intro-reveal>in <em>good</em> light.</span>
        </h1>
        <div className="intro__foot">
          <p data-intro-reveal>
            Studio and outdoor portraits by {site.photographer}, and fine art prints made to order.
          </p>
          <div className="intro__actions" data-intro-reveal>
            <a href="#work" className="pill pill--light">See the work</a>
            <a href="#commission" className="pill">Book a session</a>
          </div>
        </div>
      </div>

      <button className="intro__enter" onClick={() => enter()} aria-label="Step inside">
        <Image src="/brand/logo-cream.png" alt={site.name} width={1502} height={951} priority sizes="320px" className="intro__logo" />
        <span className="intro__hint">Scroll or tap to step inside</span>
      </button>
    </section>
  );
}
