'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { useCart } from './Cart';
import { site } from '@/lib/site';

const links = [
  { href: '#work', label: 'Work' },
  { href: '#sitters', label: 'Sitters' },
  { href: '#prints', label: 'Prints' },
  { href: '#commission', label: 'Commission' },
];

export function Nav() {
  const { count, setOpen } = useCart();
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);

  // Tucks away while reading down the page and returns the moment the visitor scrolls back up.
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', menu);
    if (!menu) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenu(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menu]);

  return (
    <>
      <header className="nav" data-hidden={hidden && !menu}>
        <a href="#top" className="nav__logo" aria-label={`${site.name}, back to top`} onClick={() => setMenu(false)}>
          <Image src="/brand/logo-cream.png" alt="" width={1502} height={951} priority sizes="140px" />
        </a>
        <nav className="nav__links" aria-label="Primary">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="nav__link">{link.label}</a>
          ))}
        </nav>
        <div className="nav__actions">
          <button className="nav__bag" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} ${count === 1 ? 'item' : 'items'}`}>
            Bag <span className="nav__count" data-empty={count === 0}>{count}</span>
          </button>
          <button className="nav__burger" aria-expanded={menu} aria-controls="menu" onClick={() => setMenu((m) => !m)}>
            <span className="visually-hidden">{menu ? 'Close menu' : 'Open menu'}</span>
            <span className="nav__burger-line" />
            <span className="nav__burger-line" />
          </button>
        </div>
      </header>

      <div id="menu" className="menu" data-open={menu} inert={!menu}>
        <ul className="menu__list">
          {links.map((link, i) => (
            <li key={link.href} style={{ '--i': i } as CSSProperties}>
              <a href={link.href} className="menu__link" onClick={() => setMenu(false)}>{link.label}</a>
            </li>
          ))}
        </ul>
        <div className="menu__foot">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.instagram} target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>
    </>
  );
}
