import Hero from '@/components/sections/Hero';
import Craft from '@/components/sections/Craft';
import Collection from '@/components/sections/Collection';
import Movement from '@/components/sections/Movement';
import Heritage from '@/components/sections/Heritage';
import Configurator from '@/components/sections/Configurator';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <>
      <main>
        <Hero />
        <Craft />
        <Collection />
        <Movement />
        <Heritage />
        <Configurator />
      </main>
      <Footer />
    </>
  );
}
