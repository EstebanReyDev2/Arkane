import { getProducts } from '@/src/lib/firebase/products';
import { ProductGrid } from '@/src/components/product/ProductGrid';
import Link from 'next/link';
import Image from 'next/image';
import { SaleHero } from '@/src/components/sale/SaleHero';
import { SaleFilters } from '@/src/components/sale/SaleFilters';

export const revalidate = 60; // ISR cache de 1 min

export default async function SalePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const params = await searchParams;
  const categoryFilter = params.category;
  
  const products = await getProducts({ 
    isSale: true,
    category: categoryFilter
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Announcement Bar */}
      <div className="bg-[#C4714A] text-white py-3 px-4 text-center text-xs font-label uppercase tracking-widest">
        SALE FINAL DE TEMPORADA · Hasta 50% OFF · Termina en: 3 DÍAS
      </div>

      {/* Hero Split */}
      <SaleHero />

      <div id="sale-products" className="max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-24">
        {/* Filters & Count */}
        <SaleFilters activeCategory={categoryFilter || 'TODO'} totalProducts={products.length} />

        {/* Product Grid */}
        <ProductGrid products={products} isLoading={false} />
      </div>

      {/* Las Últimas Piezas Banner */}
      <div className="bg-[#0D0D0D] text-[#FAFAFA] py-24 px-6 md:px-12 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-light mb-6">Las Últimas Piezas</h2>
        <p className="text-[#8C8680] font-body max-w-xl mx-auto mb-10">
          Oportunidades únicas. Diseños icónicos con stock limitado.
        </p>
        <Link 
          href="/sale" 
          className="inline-block border border-[#FAFAFA] px-8 py-4 font-label text-xs uppercase tracking-widest hover:bg-[#FAFAFA] hover:text-[#0D0D0D] transition-colors"
        >
          COMPRAR AHORA
        </Link>
      </div>

      {/* Recién Reducidos */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24">
        <h3 className="text-2xl font-display uppercase tracking-widest mb-10">Recién Reducidos</h3>
        <div className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="min-w-[280px] md:min-w-[320px] flex-shrink-0">
              <Link href={`/producto/${product.slug}`} className="group block">
                <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[#F5F2ED]">
                  <Image
                    src={product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/1067'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {product.salePercentage && (
                    <div className="absolute top-4 left-4 bg-[#C4714A] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                      -{product.salePercentage}%
                    </div>
                  )}
                </div>
                <h4 className="font-body text-sm text-[#0D0D0D] mb-1">{product.name}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-[#C4714A] font-medium text-sm">
                    ${product.salePrice?.toLocaleString('es-AR')}
                  </span>
                  <span className="text-[#8C8680] line-through text-xs">
                    ${product.basePrice.toLocaleString('es-AR')}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
