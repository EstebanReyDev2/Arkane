'use client';

import { useState } from 'react';
import { Product, ProductVariant } from '@/src/types/product';
import { ProductGallery } from './ProductGallery';
import { VariantSelector } from './VariantSelector';
import { AddToCartSection } from './AddToCartSection';
import { ProductAccordion } from './ProductAccordion';
import { CompleteTheLook } from './CompleteTheLook';
import { ProductReviews } from './ProductReviews';
import { Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  const difference = product.salePrice ? product.basePrice - product.salePrice : 0;

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-12">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-label uppercase tracking-widest text-[#8C8680] mb-8 md:mb-12 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-[#0D0D0D] transition-colors">Inicio</Link>
          <ChevronRight size={10} />
          <Link href={`/${product.category}`} className="hover:text-[#0D0D0D] transition-colors">{product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-[#0D0D0D]">{product.name}</span>
        </nav>
        
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-12 lg:gap-20">
          
          {/* LEFT: Gallery */}
          <div className="w-full">
            <ProductGallery images={product.images} />
          </div>
          
          {/* RIGHT: Info (sticky) */}
          <div className="lg:sticky lg:top-24 h-fit space-y-8">
            
            {/* Identity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-label uppercase tracking-widest text-[#8C8680]">
                  {product.subcategory}
                </span>
                <div className="flex items-center gap-2">
                  {product.tags.includes('sustainable') && (
                    <Badge variant="outline" className="rounded-none border-[#7A9E87] text-[#7A9E87] text-[9px] font-label uppercase tracking-widest px-2 py-0.5">
                      ♻ Producción Sostenible
                    </Badge>
                  )}
                  {product.tags.includes('new') && (
                    <Badge variant="outline" className="rounded-none border-[#0D0D0D] text-[#0D0D0D] text-[9px] font-label uppercase tracking-widest px-2 py-0.5">
                      Nuevo
                    </Badge>
                  )}
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-display uppercase tracking-widest text-[#0D0D0D] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={14} 
                      fill={star <= 4 ? "#0D0D0D" : "transparent"} 
                      strokeWidth={1.5} 
                      className="text-[#0D0D0D]"
                    />
                  ))}
                </div>
                <a href="#reviews" className="text-[10px] font-label uppercase tracking-widest text-[#8C8680] hover:text-[#0D0D0D] transition-colors underline underline-offset-4">
                  (23 reseñas)
                </a>
              </div>
            </div>
            
            {/* Price */}
            <div className="flex items-baseline gap-4">
              {product.salePrice ? (
                <>
                  <span className="text-xl text-[#8C8680] line-through font-body">{formatPrice(product.basePrice)}</span>
                  <span className="text-2xl font-semibold text-[#C4714A] font-body">{formatPrice(product.salePrice)}</span>
                  <span className="text-xs font-label uppercase tracking-widest text-[#7A9E87] bg-[#7A9E87]/10 px-2 py-1 rounded-full">
                    Ahorrás {formatPrice(difference)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-medium text-[#0D0D0D] font-body">{formatPrice(product.basePrice)}</span>
              )}
            </div>
            
            {/* Variant Selector */}
            <VariantSelector 
              variants={product.variants}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />
            
            {/* Add to Cart */}
            <AddToCartSection 
              product={product}
              selectedVariant={selectedVariant}
            />
            
            {/* Accordion */}
            <ProductAccordion product={product} />
            
          </div>
        </div>
      </div>

      {/* Full width sections */}
      <CompleteTheLook currentProduct={product} />
      <div id="reviews">
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}
