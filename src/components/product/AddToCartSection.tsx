'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, RotateCcw, Lock, Heart, Minus, Plus } from 'lucide-react';
import { Product, ProductVariant } from '@/src/types/product';
import { useCartStore } from '@/src/lib/store/cartStore';
import { useUiStore } from '@/src/lib/store/uiStore';
import { cn } from '@/src/lib/utils';

interface AddToCartSectionProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export function AddToCartSection({ product, selectedVariant }: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [shake, setShake] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { setCartDrawerOpen } = useUiStore();

  // Reset quantity when variant changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuantity(1);
  }, [selectedVariant]);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (selectedVariant.stock === 0) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: product.images.find(img => img.type === 'main')?.url || product.images[0].url,
      color: selectedVariant.color,
      size: selectedVariant.size,
      quantity: quantity,
      price: product.salePrice || product.basePrice
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    setTimeout(() => setCartDrawerOpen(true), 500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  const installmentsPrice = (product.salePrice || product.basePrice) / 3;

  return (
    <div className="space-y-8 py-8">
      {/* Quantity Selector */}
      <div className="flex items-center gap-6">
        <span className="text-xs font-label uppercase tracking-widest text-[#0D0D0D]">Cantidad</span>
        <div className="flex items-center border border-[#E8E4E0] rounded-[2px] h-12">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-full flex items-center justify-center hover:bg-[#F2EDE8] transition-colors"
            disabled={!selectedVariant || selectedVariant.stock === 0}
          >
            <Minus size={14} strokeWidth={1.5} />
          </button>
          <span className="w-12 text-center font-body text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
            className="w-10 h-full flex items-center justify-center hover:bg-[#F2EDE8] transition-colors"
            disabled={!selectedVariant || selectedVariant.stock === 0 || quantity >= (selectedVariant.stock || 1)}
          >
            <Plus size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Main CTAs */}
      <div className="space-y-4">
        <motion.button
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          onClick={handleAddToCart}
          className={cn(
            "w-full h-[52px] text-xs font-label uppercase tracking-widest transition-all duration-300 rounded-[2px]",
            isAdded 
              ? "bg-[#7A9E87] text-white" 
              : !selectedVariant || selectedVariant.stock === 0
                ? "bg-[#E8E4E0] text-[#8C8680] cursor-not-allowed"
                : "bg-[#0D0D0D] text-white hover:opacity-90"
          )}
        >
          {isAdded ? '✓ AGREGADO' : selectedVariant?.stock === 0 ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
        </motion.button>

        <button className="w-full h-[52px] border border-[#0D0D0D] text-[#0D0D0D] text-xs font-label uppercase tracking-widest hover:bg-[#0D0D0D] hover:text-white transition-all duration-300 rounded-[2px] flex items-center justify-center gap-2">
          <Heart size={16} strokeWidth={1.5} />
          GUARDAR EN WISHLIST
        </button>
      </div>

      {/* Installments Info */}
      {(product.salePrice || product.basePrice) > 10000 && (
        <div className="bg-[#F2EDE8] p-4 rounded-[4px] flex items-center gap-3">
          <span className="text-xl">💳</span>
          <p className="text-sm font-body text-[#7A9E87]">
            3 cuotas de <span className="font-semibold">{formatPrice(installmentsPrice)}</span> sin interés
          </p>
        </div>
      )}

      {/* Quick Info Strip */}
      <div className="grid grid-cols-1 gap-4 pt-4 border-t border-[#E8E4E0]">
        <div className="flex items-center gap-3 text-[#8C8680]">
          <Truck size={16} strokeWidth={1.5} />
          <span className="text-xs font-label uppercase tracking-widest">Envío gratis en este pedido</span>
        </div>
        <div className="flex items-center gap-3 text-[#8C8680]">
          <RotateCcw size={16} strokeWidth={1.5} />
          <span className="text-xs font-label uppercase tracking-widest">Devolución gratis — 30 días</span>
        </div>
        <div className="flex items-center gap-3 text-[#8C8680]">
          <Lock size={16} strokeWidth={1.5} />
          <span className="text-xs font-label uppercase tracking-widest">Pago 100% seguro</span>
        </div>
      </div>
    </div>
  );
}
