'use client';

import { useState } from 'react';
import { useProducts } from '@/src/lib/firebase/products';
import { ProductGrid } from '@/src/components/product/ProductGrid';
import Link from 'next/link';

const TABS = ['VER TODO', 'SASTRERÍA', 'PUNTO', 'ABRIGOS', 'ACCESORIOS'];

export default function HombrePage() {
  const [activeTab, setActiveTab] = useState('VER TODO');
  
  const filterSubcategory = activeTab === 'VER TODO' ? undefined : activeTab.toLowerCase();
  
  const { data: products = [], isLoading, error } = useProducts({ 
    category: 'hombre',
    subcategory: filterSubcategory
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-12 pb-24">
        {/* Breadcrumb */}
        <div className="text-xs text-[#8C8680] mb-8 font-body uppercase tracking-widest">
          <Link href="/" className="hover:text-[#0D0D0D] transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0D0D0D]">Hombre</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-[64px] font-display font-light tracking-tight text-[#0D0D0D] mb-4">
            Hombre
          </h1>
          <p className="text-[#8C8680] font-body max-w-2xl">
            Redefiniendo los clásicos masculinos. Cortes precisos, texturas ricas y una paleta sobria para un armario versátil y sofisticado.
          </p>
        </div>

        {/* Filters & Count */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E8E4E0] mb-10 pb-4 gap-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-8">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-label uppercase tracking-widest whitespace-nowrap pb-4 -mb-4 transition-colors ${
                  activeTab === tab 
                    ? 'text-[#0D0D0D] border-b-2 border-[#0D0D0D]' 
                    : 'text-[#8C8680] hover:text-[#0D0D0D]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="text-sm text-[#8C8680] font-body whitespace-nowrap">
            {isLoading ? 'Cargando...' : `${products.length} productos`}
          </div>
        </div>

        {/* Product Grid */}
        {error ? (
          <div className="py-20 text-center text-red-500 font-body">Error al cargar los productos.</div>
        ) : (
          <ProductGrid products={products} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
