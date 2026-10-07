import Image from 'next/image';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="footer">
      <Image src="/brand/logo-cream.png" alt={site.name} width={1502} height={951} sizes="(max-width: 700px) 80vw, 40vw" className="footer__logo" />
      <div className="footer__row">
        <p>Dog portrait photography by {site.photographer}.</p>
        <nav aria-label="Contact">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.instagram} target="_blank" rel="noreferrer">Instagram</a>
        </nav>
        <p>
          Site by <a href="https://github.com/SadikMohamud" target="_blank" rel="noreferrer">Snurm</a>
        </p>
      </div>
    </footer>
  );
}
