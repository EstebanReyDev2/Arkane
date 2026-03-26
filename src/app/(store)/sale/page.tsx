'use client';

import { useState } from 'react';
import { useProducts } from '@/src/lib/firebase/products';
import { ProductGrid } from '@/src/components/product/ProductGrid';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';

const CATEGORIES = ['TODO', 'MUJER', 'HOMBRE', 'ACCESORIOS'];

export default function SalePage() {
  const [activeCategory, setActiveCategory] = useState('TODO');
  
  const filterCategory = activeCategory === 'TODO' ? undefined : activeCategory.toLowerCase();
  
  const { data: products = [], isLoading, error } = useProducts({ 
    isSale: true,
    category: filterCategory
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Announcement Bar */}
      <div className="bg-[#C4714A] text-white py-3 px-4 text-center text-xs font-label uppercase tracking-widest">
        SALE FINAL DE TEMPORADA · Hasta 50% OFF · Termina en: 3 DÍAS
      </div>

      {/* Hero Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
        <div className="bg-[#F5F2ED] flex flex-col justify-center px-8 md:px-20 py-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-6xl md:text-[80px] font-display font-light text-[#0D0D0D] leading-none mb-6"
          >
            Sale
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-[#8C8680] font-body mb-10"
          >
            Hasta 50% de descuento en piezas seleccionadas.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button 
              onClick={() => {
                document.getElementById('sale-products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#C4714A] text-white px-8 py-4 font-label text-xs uppercase tracking-widest hover:bg-[#A85D3A] transition-colors inline-block"
            >
              VER TODO EL SALE
            </button>
          </motion.div>
        </div>
        <div className="relative h-[40vh] md:h-auto">
          <Image
            src="https://picsum.photos/seed/sale/700/500"
            alt="Sale Editorial"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div id="sale-products" className="max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-24">
        {/* Filters & Count */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E8E4E0] mb-10 pb-4 gap-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-8 items-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-label uppercase tracking-widest whitespace-nowrap pb-4 -mb-4 transition-colors ${
                  activeCategory === cat 
                    ? 'text-[#0D0D0D] border-b-2 border-[#0D0D0D]' 
                    : 'text-[#8C8680] hover:text-[#0D0D0D]'
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="flex gap-2 ml-4 pb-4 -mb-4">
              <span className="px-2 py-1 bg-[#F5F2ED] text-[#C4714A] text-[10px] font-bold rounded-full">-20%</span>
              <span className="px-2 py-1 bg-[#F5F2ED] text-[#C4714A] text-[10px] font-bold rounded-full">-30%</span>
              <span className="px-2 py-1 bg-[#F5F2ED] text-[#C4714A] text-[10px] font-bold rounded-full">-50%</span>
            </div>
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
