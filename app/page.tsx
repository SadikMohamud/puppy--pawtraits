import { Commission } from '@/components/Commission';
import { Footer } from '@/components/Footer';
import { Gallery } from '@/components/Gallery';
import { Intro } from '@/components/Intro';
import { Nav } from '@/components/Nav';
import { Prints } from '@/components/Prints';
import { Sitters } from '@/components/Sitters';
import { Statement } from '@/components/Statement';

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Intro />
        <Statement />
        <Gallery />
        <Sitters />
        <Prints />
        <Commission />
      </main>
      <Footer />
    </>
  );
}
