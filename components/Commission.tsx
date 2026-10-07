'use client';

import { useRef } from 'react';
import { findWork } from '@/lib/catalogue';
import { site } from '@/lib/site';
import { Photo } from './Photo';
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from './motion/gsap';

// Ported from the Awwwards Pack "Fullscreen Scrolling Slideshow" (Scroll Animation 28).
// The section pins while the visitor scrolls through it; each third of the way along, the next full-screen
// photograph slides in over the last, its image stretched tall and settling as it lands.

const steps = [
  {
    title: 'Say hello',
    body: 'Tell Jason about your dog: name, age, quirks, the thing they do that nobody else understands.',
    work: findWork('duke')!,
  },
  {
    title: 'The session',
    body: 'An unhurried hour in the studio or somewhere they love to walk. Treats encouraged, perfect behaviour not required.',
    work: findWork('heather')!,
  },
  {
    title: 'Your gallery',
    body: 'A private online gallery within two weeks, ready to choose favourites for prints or digital files.',
    work: findWork('honey')!,
  },
];

export function Commission() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current!;
      const slides = gsap.utils.toArray<HTMLElement>('.slide', section);
      if (prefersReducedMotion()) {
        section.setAttribute('data-static', '');
        return;
      }

      let current = 0;
      let animating = false;
      let wanted = 0;
      gsap.set(slides, { yPercent: (i) => (i === 0 ? 0 : 100) });

      const navigate = (to: number) => {
        if (animating || to === current) return;
        animating = true;
        const direction = to > current ? 1 : -1;
        const from = slides[current];
        const next = slides[to];
        current = to;
        const fromImg = from.querySelector('.slide__img');
        const nextImg = next.querySelector('.slide__img');
        const nextInner = next.querySelector('.slide__inner');
        gsap
          .timeline({
            defaults: { duration: 1.2, ease: 'power3.inOut' },
            onComplete: () => {
              animating = false;
              if (wanted !== current) navigate(wanted);
            },
          })
          .set([fromImg, nextImg], { transformOrigin: direction > 0 ? '50% 0%' : '50% 100%' }, 0)
          .set(next, { yPercent: direction > 0 ? 100 : -100, zIndex: 2 }, 0)
          .set(from, { zIndex: 1 }, 0)
          .set(nextInner, { yPercent: direction > 0 ? -100 : 100 }, 0)
          .to(from, { yPercent: direction > 0 ? -100 : 100 }, 0)
          .to(fromImg, { scaleY: 2 }, 0)
          .to([next, nextInner], { yPercent: 0 }, 0)
          .fromTo(nextImg, { scaleY: 2 }, { scaleY: 1, ease: 'power2.inOut' }, 0)
          .fromTo(next.querySelectorAll('.slide__text > *'), { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.095 }, 0.55)
          .set(fromImg, { scaleY: 1 });
      };

      ScrollTrigger.create({
        trigger: section.querySelector('.slides'),
        start: 'top top',
        end: () => `+=${window.innerHeight * (slides.length - 1) * 1.1}`,
        pin: true,
        onUpdate: (self) => {
          wanted = Math.min(slides.length - 1, Math.floor(self.progress * slides.length));
          navigate(wanted);
        },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="commission" className="commission" aria-labelledby="commission-title">
      <h2 id="commission-title" className="visually-hidden">Commission a portrait</h2>
      <div className="slides">
        {steps.map((step) => (
          <article className="slide" key={step.title}>
            <div className="slide__inner">
              <div className="slide__img">
                <Photo work={step.work} sizes="100vw" />
              </div>
              <div className="slide__text">
                <p className="label">Commission a portrait</p>
                <h3 className="slide__title">{step.title}</h3>
                <p className="slide__body">{step.body}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="contact">
        <p className="label">Bring them in. Bring the treats.</p>
        <a className="contact__email" href={`mailto:${site.email}`}>{site.email}</a>
        <div className="contact__links">
          <a href={site.instagram} className="pill pill--dark" target="_blank" rel="noreferrer">Instagram</a>
          <a href={`mailto:${site.email}?subject=Portrait%20session`} className="pill pill--dark">Book a session</a>
        </div>
      </div>
    </section>
  );
}
