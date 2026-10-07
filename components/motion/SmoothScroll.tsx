'use client';

import Lenis from 'lenis';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger } from './gsap';

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

// Lenis drives the scroll and ScrollTrigger reads from it, both on GSAP's ticker so they never drift apart.
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  // Web fonts and late images change the page height after first paint; measure scroll positions again once they settle.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const instance = new Lenis({ lerp: 0.1, anchors: { offset: -72 } });
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
