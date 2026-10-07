'use client';

import { useEffect, useRef, useState } from 'react';
import { findWork, formatPrice, prints, sizes, type Print } from '@/lib/catalogue';
import { useCart } from './Cart';
import { Photo } from './Photo';
import { gsap, prefersReducedMotion, useGSAP } from './motion/gsap';

// Ported from the Awwwards Pack "Grid to Full Preview" (Grid Animations 4).
// Choosing a print pushes the other cards outwards and fades them, while the preview opens through a cross
// whose arms widen until the whole photograph is showing.

const ARM = 6;

function cross(arm: number) {
  const a = 50 - arm / 2;
  const b = 50 + arm / 2;
  return `polygon(${a}% 0%, ${b}% 0%, ${b}% ${a}%, 100% ${a}%, 100% ${b}%, ${b}% ${b}%, ${b}% 100%, ${a}% 100%, ${a}% ${b}%, 0% ${b}%, 0% ${a}%, ${a}% ${a}%)`;
}

const lowest = Math.min(...sizes.map((size) => size.price));

export function Prints() {
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Print | null>(null);
  const [sizeId, setSizeId] = useState(sizes[1].id);
  const { add } = useCart();
  const { contextSafe } = useGSAP({ scope: root });

  const show = contextSafe((print: Print) => {
    setOpen(print);
    setSizeId(sizes[1].id);
  });

  useEffect(() => {
    const el = dialog.current;
    if (!el || !open) return;
    if (!el.open) el.showModal();
    if (prefersReducedMotion()) return;
    const cards = root.current!.querySelectorAll('.print-card');
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 0.9 } });
    tl.to(cards, { opacity: 0, x: (i: number) => (i % 3 === 0 ? '-2.5vw' : i % 3 === 2 ? '2.5vw' : '0vw'), y: (i: number) => (i < 3 ? '-2.5vw' : '2.5vw') } as gsap.TweenVars, 0)
      .fromTo(el.querySelector('.preview__media'), { clipPath: cross(ARM), scale: 0.94 }, { clipPath: cross(100), scale: 1 }, 0)
      .fromTo(el.querySelector('.preview__media .photo'), { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, 0.1)
      .fromTo(el.querySelectorAll('.preview__detail > *'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, ease: 'expo.out', stagger: 0.06 }, 0.35);
  }, [open]);

  const close = contextSafe(() => {
    const el = dialog.current;
    if (!el) return;
    const finish = () => {
      el.close();
      setOpen(null);
    };
    const cards = root.current!.querySelectorAll('.print-card');
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    gsap
      .timeline({ defaults: { ease: 'power2.inOut', duration: 0.7 }, onComplete: finish })
      .to(el.querySelector('.preview__media'), { clipPath: cross(ARM), scale: 0.94 }, 0)
      .to(el.querySelectorAll('.preview__detail > *'), { opacity: 0, duration: 0.3 }, 0)
      .to(cards, { opacity: 1, x: 0, y: 0 }, 0.3);
  });

  const work = open ? findWork(open.workId)! : null;
  const size = sizes.find((s) => s.id === sizeId)!;

  return (
    <section ref={root} id="prints" className="prints" aria-labelledby="prints-title">
      <header className="prints__head">
        <p className="label">Prints</p>
        <h2 id="prints-title" className="display">
          Hang them where <em>they</em> nap.
        </h2>
        <p className="prints__intro">
          Archival giclée prints on cotton rag, made to order and signed by Jason. Shipped flat in rigid packaging,
          unframed, anywhere in the UK.
        </p>
      </header>

      <ul className="prints__grid">
        {prints.map((print) => {
          const w = findWork(print.workId)!;
          return (
            <li key={print.id} className="print-card">
              <button className="print-card__open" onClick={() => show(print)} aria-haspopup="dialog">
                <span className="print-card__media">
                  <Photo work={w} sizes="(max-width: 700px) 90vw, 30vw" />
                </span>
                <span className="print-card__meta">
                  <span className="print-card__title">{print.title}</span>
                  <span className="print-card__detail">{print.edition}, from {formatPrice(lowest)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        className="preview"
        aria-label={open ? open.title : 'Print preview'}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        {open && work && (
          <div className="preview__inner">
            <div className="preview__media">
              <Photo work={work} sizes="(max-width: 900px) 100vw, 60vw" />
            </div>
            <div className="preview__detail">
              <button className="preview__close" onClick={close}>Close</button>
              <p className="label">{open.edition}</p>
              <h3 className="preview__title">{open.title}</h3>
              <p className="preview__paper">{open.paper}. Signed on the reverse.</p>
              <fieldset className="sizes">
                <legend className="label">Size</legend>
                {sizes.map((s) => (
                  <label key={s.id} className="size">
                    <input type="radio" name="size" value={s.id} checked={sizeId === s.id} onChange={() => setSizeId(s.id)} />
                    <span className="size__label">{s.label}</span>
                    <span className="size__dims">{s.dimensions}</span>
                    <span className="size__price">{formatPrice(s.price)}</span>
                  </label>
                ))}
              </fieldset>
              <div className="preview__buy">
                <p className="preview__price" aria-live="polite">{formatPrice(size.price)}</p>
                <button
                  className="pill pill--collar"
                  onClick={() => {
                    add(open.id, size.id);
                    close();
                  }}
                >
                  Add to bag
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
