import Image from 'next/image';
import type { Work } from '@/lib/catalogue';

interface PhotoProps {
  work: Work;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Decorative copies (trail, intro wall) are hidden from screen readers. */
  decorative?: boolean;
}

// Fills its parent, cropped to cover, keeping the dog in frame via the work's focus point.
export function Photo({ work, sizes, className, priority, decorative }: PhotoProps) {
  return (
    <Image
      src={work.image}
      alt={decorative ? '' : `${work.name}, ${work.breed}`}
      fill
      sizes={sizes}
      priority={priority}
      className={className ? `photo ${className}` : 'photo'}
      style={{ objectPosition: work.focus ?? '50% 50%' }}
      draggable={false}
    />
  );
}
