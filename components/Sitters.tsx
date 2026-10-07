'use client';

import { useEffect, useRef, useState } from 'react';
import { findWork, sitters } from '@/lib/catalogue';
import { Photo } from './Photo';
import { gsap, hasFinePointer, lerp, prefersReducedMotion, useGSAP } from './motion/gsap';

// Ported from the Awwwards Pack "Crossroads Slideshow" (Sliders 12).
// Portraits sit on a tilted track with the dog's name set huge behind. Moving stretches each frame sideways
// mid-flight, the letters of the old name fall away in random order and the new name rises in.

const dogs = sitters.map((id) => findWork(id)!);
const DURATION = 1.2;

function wrapOffset(index: number, position: number, total: number) {
  let d = (((index - position) % total) + total) % total;
  if (d > total / 2) d -= total;
  return d;
}

export function Sitters() {
  const root = useRef<HTMLElement>(null);
  const position = useRef({ value: 0 });
  const busy = useRef(false);
  const [current, setCurrent] = useState(0);
  const [title, setTitle] = useState(0);

  const { contextSafe } = useGSAP({ scope: root });

  const layout = contextSafe(() => {
    const section = root.current;
    if (!section) return;
    const slides = section.querySelectorAll<HTMLElement>('.sitter');
    const gap = parseFloat(getComputedStyle(section).getPropertyValue('--gap')) * window.innerWidth / 100;
    slides.forEach((slide, i) => {
      const d = wrapOffset(i, position.current.value, dogs.length);
      gsap.set(slide, { x: d * gap, opacity: Math.abs(d) > 1.6 ? 0 : 1, zIndex: 10 - Math.round(Math.abs(d)) });
      slide.toggleAttribute('data-centre', Math.abs(d) < 0.5);
    });
  });

  useEffect(() => {
    layout();
    window.addEventListener('resize', layout);
    return () => window.removeEventListener('resize', layout);
  }, [layout]);

  // The frames drift a little with the pointer and the names drift four times as far the other way.
  useEffect(() => {
    const section = root.current;
    if (!section || !hasFinePointer() || prefersReducedMotion()) return;
    let target = 0;
    let value = 0;
    const onMove = (event: PointerEvent) => (target = (event.clientX / window.innerWidth) * -30 + 15);
    const tick = () => {
      value = lerp(value, target, 0.03);
      gsap.set(section.querySelectorAll('.sitter__photo'), { x: value });
      gsap.set(section.querySelector('.sitters__names'), { x: -4 * value });
    };
    window.addEventListener('pointermove', onMove);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      gsap.ticker.remove(tick);
    };
  }, []);

  const go = contextSafe((direction: 1 | -1) => {
    if (busy.current || !root.current) return;
    busy.current = true;
    const next = (((current + direction) % dogs.length) + dogs.length) % dogs.length;
    const reduced = prefersReducedMotion();
    const frames = root.current.querySelectorAll('.sitter__frame');
    const oldLetters = gsap.utils.shuffle(Array.from(root.current.querySelectorAll('.sitters__name[data-current] .char')));

    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
      },
    });
    tl.to(position.current, {
      value: position.current.value + direction,
      duration: reduced ? 0 : DURATION,
      ease: 'power4.inOut',
      onUpdate: layout,
    }, 0);
    if (!reduced) {
      tl.to(frames, { scaleX: 1.3, duration: DURATION * 0.5, ease: 'power4.in' }, 0)
        .to(frames, { scaleX: 1, duration: DURATION * 0.5, ease: 'power4.out' }, DURATION * 0.5)
        .to(oldLetters, { y: () => gsap.utils.random(300, 600), opacity: 0, duration: 0.8, ease: 'power4.inOut', stagger: 0.03 }, 0)
        .to(oldLetters, { scaleY: 2.2, duration: 0.4, ease: 'power4.in', stagger: 0.03 }, 0)
        .to(oldLetters, { scaleY: 1, duration: 0.4, ease: 'power4.out', stagger: 0.03 }, 0.4);
    }
    tl.add(() => setTitle(next), reduced ? 0 : 0.7);
    setCurrent(next);
  });

  // New name rises in, letters in random order.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const letters = gsap.utils.shuffle(Array.from(root.current!.querySelectorAll('.sitters__name[data-current] .char')));
      gsap.fromTo(letters, { y: 300, opacity: 0, scaleY: 2 }, { y: 0, opacity: 1, scaleY: 1, duration: 0.8, ease: 'power4.out', stagger: 0.03 });
    },
    { scope: root, dependencies: [title] },
  );

  // Swipe or drag to move along.
  useEffect(() => {
    const stage = root.current?.querySelector<HTMLElement>('.sitters__stage');
    if (!stage) return;
    let startX: number | null = null;
    const down = (event: PointerEvent) => (startX = event.clientX);
    const up = (event: PointerEvent) => {
      if (startX === null) return;
      const dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    };
    stage.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      stage.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, [go]);

  const dog = dogs[current];

  return (
    <section
      ref={root}
      id="sitters"
      className="sitters"
      aria-roledescription="carousel"
      aria-labelledby="sitters-title"
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') go(1);
        if (event.key === 'ArrowLeft') go(-1);
      }}
    >
      <header className="sitters__head">
        <p className="label" id="sitters-title">The sitters</p>
        <div className="sitters__controls">
          <button className="pill" onClick={() => go(-1)} aria-label="Previous sitter">Prev</button>
          <button className="pill" onClick={() => go(1)} aria-label="Next sitter">Next</button>
        </div>
      </header>

      <div className="sitters__names" aria-hidden="true">
        <p className="sitters__name" data-current key={title}>
          {dogs[title].name.split('').map((char, i) => (
            <span className="char" key={i}>{char}</span>
          ))}
        </p>
      </div>

      <div className="sitters__stage">
        <div className="sitters__track">
          {dogs.map((work, i) => (
            <figure className="sitter" key={work.id} aria-hidden={i !== current}>
              <button
                className="sitter__frame"
                tabIndex={-1}
                onClick={() => {
                  const d = wrapOffset(i, position.current.value, dogs.length);
                  if (d > 0.5) go(1);
                  if (d < -0.5) go(-1);
                }}
              >
                <span className="sitter__photo">
                  <Photo work={work} sizes="(max-width: 700px) 60vw, 26vw" />
                </span>
              </button>
              <figcaption className="sitter__caption">{work.breed}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite">{dog.name}, {dog.breed}</p>
    </section>
  );
}
