'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/src/types/product';
import { getFeaturedProducts } from '@/src/lib/firebase/products';
import { ProductCard } from './ProductCard';
import { motion } from 'motion/react';
import Link from 'next/link';

interface CompleteTheLookProps {
  currentProduct: Product;
}

export function CompleteTheLook({ currentProduct }: CompleteTheLookProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const featured = await getFeaturedProducts(12);
      // Filter products from different subcategory to "complete the look"
      const filtered = featured
        .filter(p => p.id !== currentProduct.id && p.subcategory !== currentProduct.subcategory)
        .slice(0, 4);
      setRecommendations(filtered);
    };
    fetchRecommendations();
  }, [currentProduct]);

  if (recommendations.length === 0) return null;

  return (
    <section className="bg-[#F2EDE8] py-20 mt-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-widest text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
              Completar el look
            </h2>
            <p className="text-sm font-body text-[#8C8680]">Sugerencias para combinar con tu prenda</p>
          </div>
          <Link 
            href="/accesorios" 
            className="text-xs font-label uppercase tracking-widest text-[#0D0D0D] border-b border-[#0D0D0D] pb-1 hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            Ver todos los accesorios →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {recommendations.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
