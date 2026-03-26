'use client';

import { useState } from 'react';
import { useProducts } from '@/src/lib/firebase/products';
import { ProductGrid } from '@/src/components/product/ProductGrid';
import Link from 'next/link';

const TABS = ['VER TODO', 'VESTIDOS', 'SASTRERÍA', 'PUNTO', 'ACCESORIOS'];

export default function NovedadesPage() {
  const [activeTab, setActiveTab] = useState('VER TODO');
  
  const filterSubcategory = activeTab === 'VER TODO' ? undefined : activeTab.toLowerCase();
  
  const { data: products = [], isLoading, error } = useProducts({ 
    tags: ['new'],
    subcategory: filterSubcategory
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-12 pb-24">
        {/* Breadcrumb */}
        <div className="text-xs text-[#8C8680] mb-8 font-body uppercase tracking-widest">
          <Link href="/" className="hover:text-[#0D0D0D] transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0D0D0D]">Novedades</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-[64px] font-display font-light tracking-tight text-[#0D0D0D] mb-4">
            Novedades
          </h1>
          <p className="text-[#8C8680] font-body max-w-2xl">
            Descubre las últimas incorporaciones a nuestra colección. Diseños contemporáneos pensados para elevar tu armario esta temporada.
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
          <ProductGrid products={products.slice(0, 8)} isLoading={isLoading} />
        )}

        {/* Load More */}
        {!isLoading && products.length > 8 && (
          <div className="mt-16 flex justify-center">
            <button className="border border-[#C4714A] text-[#C4714A] bg-transparent h-12 px-8 text-xs font-medium uppercase tracking-widest rounded-[2px] hover:bg-[#C4714A] hover:text-white transition-all duration-300">
              Cargar Más
            </button>
          </div>
        )}
      </div>

      {/* Editorial Banner */}
      <div className="w-full bg-[#0D0D0D] text-[#FAFAFA] py-24 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl md:text-4xl font-display mb-8">The Architectural Series</h2>
        <Link 
          href="/lookbook" 
          className="text-xs font-label uppercase tracking-widest border-b border-[#FAFAFA] pb-1 hover:opacity-70 transition-opacity"
        >
          VER LOOKBOOK →
        </Link>
      </div>
      
      {/* Remaining Products if any */}
      {!isLoading && products.length > 8 && (
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24">
          <ProductGrid products={products.slice(8)} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
