'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { works, type Category } from '@/lib/catalogue';
import { Photo } from './Photo';
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from './motion/gsap';

// Ported from the Awwwards Pack "Elastic Grid Scroll" (Grid Animations 3).
// Portraits are dealt into columns; each column trails the scroll by its own amount, the middle ones least,
// so the grid stretches as you scroll and settles when you stop.

const filters: Array<'All' | Category> = ['All', 'Studio', 'Outdoor', 'Puppies'];
const BASE_LAG = 0.5;
const LAG_STEP = 0.1;
// Columns may trail further behind on the way down than they run ahead on the way up, so they never cover the heading.
const MAX_TRAIL = 260;
const MAX_LEAD = 80;

function useColumnCount() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const queries = [window.matchMedia('(min-width: 1100px)'), window.matchMedia('(min-width: 700px)')];
    const update = () => setCount(queries[0].matches ? 4 : queries[1].matches ? 3 : 2);
    update();
    queries.forEach((q) => q.addEventListener('change', update));
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, []);
  return count;
}

export function Gallery() {
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [active, setActive] = useState<number | null>(null);
  const count = useColumnCount();

  const shown = useMemo(() => (filter === 'All' ? works : works.filter((work) => work.category === filter)), [filter]);
  const columns = useMemo(() => {
    const cols: Array<Array<{ index: number }>> = Array.from({ length: count }, () => []);
    shown.forEach((_, index) => cols[index % count].push({ index }));
    return cols;
  }, [shown, count]);

  // The grid's height changes with the column count and the filter, so every scroll position below it is measured again.
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [columns]);

  // Each column chases the real scroll position with its own lag.
  useEffect(() => {
    const section = root.current;
    if (!section || prefersReducedMotion()) return;
    const cols = Array.from(section.querySelectorAll<HTMLElement>('.gallery__col'));
    const mid = (cols.length - 1) / 2;
    const lags = cols.map((_, i) => BASE_LAG + Math.abs(i - mid) * LAG_STEP);
    const smooth = cols.map(() => window.scrollY);
    let visible = false;
    let last = performance.now();

    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: '20% 0px' });
    observer.observe(section);

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const y = window.scrollY;
      cols.forEach((col, i) => {
        smooth[i] += (y - smooth[i]) * (1 - Math.exp((-dt * 3) / lags[i]));
        if (!visible) {
          smooth[i] = y;
          return;
        }
        const offset = Math.max(-MAX_LEAD, Math.min(MAX_TRAIL, y - smooth[i]));
        gsap.set(col, { y: offset });
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
      gsap.set(cols, { clearProps: 'transform' });
    };
  }, [columns]);

  // New set of portraits rises in when the filter changes.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.gallery__item', { opacity: 0, y: 60, duration: 0.9, ease: 'expo.out', stagger: 0.04 });
    },
    { scope: root, dependencies: [filter], revertOnUpdate: true },
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (active !== null && !el.open) el.showModal();
    if (active === null && el.open) el.close();
  }, [active]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setActive((i) => (i === null ? i : (i + 1) % shown.length));
      if (event.key === 'ArrowLeft') setActive((i) => (i === null ? i : (i - 1 + shown.length) % shown.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, shown.length]);

  const current = active !== null ? shown[active] : null;

  return (
    <section ref={root} id="work" className="gallery" aria-labelledby="work-title">
      <header className="gallery__head">
        <p className="label">The work</p>
        <h2 id="work-title" className="display">
          Faces we <em>can’t</em> forget.
        </h2>
        <div className="filters" role="toolbar" aria-label="Filter the work">
          {filters.map((f) => (
            <button key={f} className="filter" aria-pressed={filter === f} onClick={() => { setFilter(f); setActive(null); }}>
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="gallery__grid" style={{ '--cols': count } as React.CSSProperties}>
        {columns.map((col, c) => (
          <div className="gallery__col" key={`${filter}-${count}-${c}`}>
            {col.map(({ index }) => {
              const work = shown[index];
              return (
                <figure className="gallery__item" key={work.id}>
                  <button className="gallery__open" onClick={() => setActive(index)} aria-label={`View ${work.name}, ${work.breed}`}>
                    <span className="gallery__media" style={{ aspectRatio: `${work.width} / ${work.height}` }}>
                      <Photo work={work} sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" />
                    </span>
                  </button>
                  <figcaption className="gallery__caption">
                    <span className="gallery__name">{work.name}</span>
                    <span className="gallery__breed">{work.breed}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        ))}
      </div>

      <dialog ref={dialog} className="lightbox" onClose={() => setActive(null)} onClick={(e) => e.target === e.currentTarget && setActive(null)}>
        {current && (
          <div className="lightbox__inner">
            <div className="lightbox__media">
              <Photo work={current} sizes="90vw" />
            </div>
            <div className="lightbox__bar">
              <p>
                <span className="lightbox__name">{current.name}</span>
                <span className="lightbox__breed">{current.breed}, {current.category}</span>
              </p>
              <div className="lightbox__nav">
                <button onClick={() => setActive((i) => (i! - 1 + shown.length) % shown.length)} aria-label="Previous portrait">Prev</button>
                <button onClick={() => setActive((i) => (i! + 1) % shown.length)} aria-label="Next portrait">Next</button>
                <button onClick={() => setActive(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
