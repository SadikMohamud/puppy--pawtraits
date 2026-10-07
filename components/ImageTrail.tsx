'use client';

import { useEffect, useRef } from 'react';
import { works } from '@/lib/catalogue';
import { Photo } from './Photo';
import { gsap, hasFinePointer, lerp, prefersReducedMotion } from './motion/gsap';

// Ported from the Awwwards Pack "Image Trail Effect" (Mouse Effect 9).
// Every 100px of pointer travel drops the next portrait at the cursor; it glides to the pointer, then shrinks and fades.
// Fine pointers only: on touch there is nothing to trail.

const THRESHOLD = 100;
const trail = works.filter((work) => work.category !== 'Outdoor').slice(0, 10);

export function ImageTrail({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = root.current;
    const host = layer?.parentElement;
    if (!active || !layer || !host || !hasFinePointer() || prefersReducedMotion()) return;

    const images = Array.from(layer.querySelectorAll<HTMLElement>('.trail__img'));
    let mouse = { x: 0, y: 0 };
    let last = { x: 0, y: 0 };
    let cache = { x: 0, y: 0 };
    let position = 0;
    let zIndex = 1;
    let inside = false;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      inside = mouse.y >= 0 && mouse.y <= rect.height;
    };

    const showNext = () => {
      const img = images[position];
      const { width, height } = img.getBoundingClientRect();
      gsap.killTweensOf(img);
      gsap
        .timeline()
        .set(img, { opacity: 1, scale: 1, zIndex, x: cache.x - width / 2, y: cache.y - height / 2 }, 0)
        .to(img, { duration: 0.9, ease: 'expo.out', x: mouse.x - width / 2, y: mouse.y - height / 2 }, 0)
        .to(img, { duration: 1, ease: 'power1.out', opacity: 0 }, 0.4)
        .to(img, { duration: 1, ease: 'power4.out', scale: 0.2 }, 0.4);
    };

    const render = () => {
      cache = { x: lerp(cache.x || mouse.x, mouse.x, 0.1), y: lerp(cache.y || mouse.y, mouse.y, 0.1) };
      if (inside && Math.hypot(mouse.x - last.x, mouse.y - last.y) > THRESHOLD) {
        showNext();
        zIndex += 1;
        position = (position + 1) % images.length;
        last = { ...mouse };
      }
      if (zIndex > 1 && !images.some((img) => gsap.isTweening(img))) zIndex = 1;
      frame = requestAnimationFrame(render);
    };

    host.addEventListener('pointermove', onMove);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener('pointermove', onMove);
      gsap.killTweensOf(images);
      gsap.set(images, { opacity: 0 });
    };
  }, [active]);

  return (
    <div ref={root} className="trail" aria-hidden="true">
      {trail.map((work) => (
        <div className="trail__img" key={work.id}>
          <Photo work={work} sizes="200px" decorative />
        </div>
      ))}
    </div>
  );
}
