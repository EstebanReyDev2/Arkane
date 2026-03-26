'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/src/lib/store/cartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl md:text-4xl font-display mb-6 text-[#0D0D0D]">Tu Carrito</h1>
        <p className="text-[#8C8680] font-body mb-8">Tu carrito está vacío.</p>
        <Link 
          href="/novedades" 
          className="bg-[#0D0D0D] text-white px-8 py-4 text-xs font-medium uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Continuar Comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-12 pb-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <h1 className="text-4xl md:text-5xl font-display mb-12 text-[#0D0D0D]">Tu Carrito</h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Cart Items */}
          <div className="flex-grow">
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-[#E8E4E0] pb-4 mb-6 text-xs font-label uppercase tracking-widest text-[#8C8680]">
              <div className="col-span-6">Producto</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Precio</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="space-y-8 md:space-y-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center py-4 border-b border-[#E8E4E0] md:border-none md:py-0">
                  {/* Product Info */}
                  <div className="col-span-6 flex gap-6 w-full">
                    <div className="relative w-24 aspect-[3/4] bg-[#F2EDE8] flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-[15px] font-medium text-[#0D0D0D] font-body mb-1">{item.name}</h3>
                      <p className="text-sm text-[#8C8680] font-body mb-2">
                        {item.color} / {item.size}
                      </p>
                      <button 
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-[#8C8680] hover:text-[#0D0D0D] transition-colors flex items-center gap-1 w-fit"
                      >
                        <X size={12} /> Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex justify-between md:justify-center items-center w-full md:w-auto mt-4 md:mt-0">
                    <span className="md:hidden text-sm text-[#8C8680] font-body">Cantidad:</span>
                    <div className="flex items-center border border-[#E8E4E0] rounded-[2px]">
                      <button 
                        onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                        className="p-2 text-[#8C8680] hover:text-[#0D0D0D] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-body">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="p-2 text-[#8C8680] hover:text-[#0D0D0D] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 flex justify-between md:justify-end items-center w-full md:w-auto mt-2 md:mt-0">
                    <span className="md:hidden text-sm text-[#8C8680] font-body">Precio:</span>
                    <span className="text-[15px] font-body text-[#0D0D0D]">{formatPrice(item.price)}</span>
                  </div>

                  {/* Total */}
                  <div className="col-span-2 flex justify-between md:justify-end items-center w-full md:w-auto mt-2 md:mt-0">
                    <span className="md:hidden text-sm text-[#8C8680] font-body">Total:</span>
                    <span className="text-[15px] font-medium font-body text-[#0D0D0D]">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-[#F2EDE8] p-8 rounded-[2px]">
              <h2 className="text-xl font-display mb-6 text-[#0D0D0D]">Resumen de Compra</h2>
              
              <div className="space-y-4 mb-6 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-[#8C8680]">Subtotal</span>
                  <span className="text-[#0D0D0D]">{formatPrice(totalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C8680]">Envío</span>
                  <span className="text-[#0D0D0D]">Calculado en el checkout</span>
                </div>
              </div>
              
              <div className="border-t border-[#E8E4E0] pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-[#0D0D0D] font-body">Total</span>
                  <span className="text-lg font-semibold text-[#0D0D0D] font-body">{formatPrice(totalPrice())}</span>
                </div>
                <p className="text-xs text-[#8C8680] mt-2 font-body">Impuestos incluidos.</p>
              </div>

              <Link href="/checkout" className="w-full bg-[#0D0D0D] text-white py-4 text-xs font-medium uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                Iniciar Checkout <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
