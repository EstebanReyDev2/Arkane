'use client';

import { motion } from 'motion/react';
import { ProductCard } from './ProductCard';
import { Product } from '@/src/types/product';
import { Skeleton } from '@/src/components/ui/skeleton';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col w-full">
            <Skeleton className="w-full aspect-[3/4] rounded-none mb-4" />
            <Skeleton className="h-3 w-1/3 mb-2 rounded-none" />
            <Skeleton className="h-4 w-3/4 mb-2 rounded-none" />
            <Skeleton className="h-4 w-1/4 rounded-none" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-[#8C8680] font-body">
        No se encontraron productos.
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  );
}
