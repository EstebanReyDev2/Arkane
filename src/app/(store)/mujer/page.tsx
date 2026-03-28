import { getProducts } from '@/src/lib/firebase/products';
import { ProductGrid } from '@/src/components/product/ProductGrid';
import Link from 'next/link';
import { SubcategoryTabs } from '@/src/components/store/SubcategoryTabs';

export const revalidate = 60; // ISR cache de 1 min

const TABS = ['VER TODO', 'VESTIDOS', 'SASTRERÍA', 'PUNTO', 'ACCESORIOS'];

export default async function MujerPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const params = await searchParams;
  const filterSubcategory = params.subcategory;
  
  const products = await getProducts({ 
    category: 'mujer',
    subcategory: filterSubcategory
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-12 pb-24">
        {/* Breadcrumb */}
        <div className="text-xs text-[#8C8680] mb-8 font-body uppercase tracking-widest">
          <Link href="/" className="hover:text-[#0D0D0D] transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0D0D0D]">Mujer</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-[64px] font-display font-light tracking-tight text-[#0D0D0D] mb-4">
            Mujer
          </h1>
          <p className="text-[#8C8680] font-body max-w-2xl">
            Una colección diseñada para la mujer contemporánea. Siluetas fluidas, sastrería impecable y materiales nobles que trascienden las temporadas.
          </p>
        </div>

        {/* Filters & Count */}
        <SubcategoryTabs 
          basePath="/mujer" 
          tabs={TABS} 
          activeTab={filterSubcategory} 
          totalProducts={products.length} 
        />

        {/* Product Grid */}
        <ProductGrid products={products} isLoading={false} />
      </div>
    </div>
  );
}
