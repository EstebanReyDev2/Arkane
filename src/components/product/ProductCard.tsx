'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Product } from '@/src/types/product';
import { useCartStore } from '@/src/lib/store/cartStore';

interface ProductCardProps {
  product: Product;
  showSaleBadge?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
};

export function ProductCard({ product, showSaleBadge = true }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const mainImage = product.images.find(img => img.type === 'main') || product.images[0];
  const detailImage = product.images.find(img => img.type === 'detail') || product.images[1] || mainImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add first variant by default for quick add
    const variant = product.variants[0];
    if (variant) {
      addItem({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        image: mainImage.url,
        color: variant.color,
        size: variant.size,
        quantity: 1,
        price: product.salePrice || product.basePrice
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <motion.div variants={cardVariants} className="group relative flex flex-col w-full">
      <Link href={`/producto/${product.slug}`} className="block relative w-full aspect-[3/4] bg-[#F2EDE8] overflow-hidden mb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Images */}
        <Image
          src={mainImage.url}
          alt={mainImage.alt}
          fill
          className="object-cover transition-opacity duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <AnimatePresence>
          {isHovered && detailImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={detailImage.url}
                alt={detailImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges */}
        {showSaleBadge && product.salePercentage && (
          <div className="absolute top-3 left-3 bg-[#C4714A] text-white text-xs font-medium px-2 py-1 rounded-full z-10">
            -{product.salePercentage}%
          </div>
        )}

        {/* Wishlist Heart */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Add wishlist logic */ }}
            >
              <Heart size={16} strokeWidth={1.5} className="text-[#0D0D0D]" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Quick Add Button */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
              className="absolute bottom-4 left-0 right-0 flex justify-center z-10 px-4"
            >
              <button
                onClick={handleQuickAdd}
                className="w-full bg-[#0D0D0D] text-white text-xs font-medium uppercase tracking-widest py-3 rounded-[2px] hover:opacity-85 transition-opacity"
              >
                + Agregar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Product Info */}
      <Link href={`/producto/${product.slug}`} className="flex flex-col space-y-1">
        <span className="text-[11px] uppercase tracking-widest text-[#8C8680] font-label" style={{ fontFamily: 'var(--font-label)' }}>
          {product.subcategory}
        </span>
        <h3 className="text-[15px] font-medium text-[#0D0D0D] font-body" style={{ fontFamily: 'var(--font-body)' }}>
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mt-1">
          {product.salePrice ? (
            <>
              <span className="text-sm text-[#8C8680] line-through font-body">{formatPrice(product.basePrice)}</span>
              <span className="text-[15px] font-semibold text-[#C4714A] font-body">{formatPrice(product.salePrice)}</span>
            </>
          ) : (
            <span className="text-[15px] font-medium text-[#0D0D0D] font-body">{formatPrice(product.basePrice)}</span>
          )}
        </div>
        
        {product.salePrice && (
          <span className="text-xs text-[#7A9E87] font-body mt-1">
            Ahorrás {formatPrice(product.basePrice - product.salePrice)}
          </span>
        )}
      </Link>
    </motion.div>
  );
}
