import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedProducts } from '@/src/lib/firebase/products';
import { ProductGrid } from '@/src/components/product/ProductGrid';
import { Header } from '@/src/components/layout/Header';
import { AnnouncementBar } from '@/src/components/layout/AnnouncementBar';
import { Footer } from '@/src/components/layout/Footer';
import { HeroSection } from '@/src/components/home/HeroSection';

export const revalidate = 3600; // Cacheo de 1 hora (ISR)

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        {/* Client Hero Section with Animations */}
        <HeroSection />

        {/* Featured Categories */}
        <section className="py-24 px-6 md:px-12 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/novedades" className="group relative aspect-[4/5] overflow-hidden bg-[#F2EDE8]">
              <Image
                src="https://picsum.photos/seed/fashion-new/800/1000"
                alt="Novedades"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:bg-black/20" />
              <div className="absolute bottom-10 left-10">
                <h2 className="text-3xl font-display text-white mb-2">Novedades</h2>
                <span className="text-white/90 text-xs font-label uppercase tracking-widest border-b border-white/50 pb-1">Descubrir</span>
              </div>
            </Link>
            <Link href="/sale" className="group relative aspect-[4/5] overflow-hidden bg-[#F2EDE8]">
              <Image
                src="https://picsum.photos/seed/fashion-sale/800/1000"
                alt="Sale"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:bg-black/20" />
              <div className="absolute bottom-10 left-10">
                <h2 className="text-3xl font-display text-white mb-2">Sale</h2>
                <span className="text-white/90 text-xs font-label uppercase tracking-widest border-b border-white/50 pb-1">Comprar ahora</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-24 px-6 md:px-12 max-w-[1440px] mx-auto border-t border-[#E8E4E0]">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-display text-[#0D0D0D]">Selección ARKADE</h2>
            <Link href="/novedades" className="text-xs font-label uppercase tracking-widest text-[#0D0D0D] border-b border-[#0D0D0D] pb-1 hover:text-[#8C8680] hover:border-[#8C8680] transition-colors hidden md:block">
              Ver todo
            </Link>
          </div>
          {/* Client Grid fetching Server Props */}
          <ProductGrid products={featuredProducts} isLoading={false} />
          <div className="mt-10 text-center md:hidden">
            <Link href="/novedades" className="text-xs font-label uppercase tracking-widest text-[#0D0D0D] border-b border-[#0D0D0D] pb-1">
              Ver todo
            </Link>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="bg-[#0D0D0D] text-[#FAFAFA] py-24 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <h3 className="text-lg font-display mb-4">Diseño Atemporal</h3>
              <p className="text-[#8C8680] font-body text-sm">Piezas creadas para trascender temporadas, enfocadas en la calidad y la silueta.</p>
            </div>
            <div>
              <h3 className="text-lg font-display mb-4">Materiales Nobles</h3>
              <p className="text-[#8C8680] font-body text-sm">Seleccionamos cuidadosamente cada tejido para garantizar durabilidad y confort.</p>
            </div>
            <div>
              <h3 className="text-lg font-display mb-4">Envíos Globales</h3>
              <p className="text-[#8C8680] font-body text-sm">Llegamos a donde estés con envíos express y devoluciones sin cargo.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
