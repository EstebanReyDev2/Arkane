'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Check, Mail, Package, Truck } from 'lucide-react';
import { db } from '@/src/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.orderId;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#E8E4E0] border-t-[#0D0D0D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <h1 className="text-2xl font-display text-[#0D0D0D] mb-4">Pedido no encontrado</h1>
        <Link href="/" className="text-[#8C8680] hover:text-[#0D0D0D] font-body underline">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Simplified Header */}
      <header className="w-full border-b border-[#E8E4E0] bg-white py-6 flex justify-center sticky top-0 z-50">
        <Link href="/" className="text-2xl font-display tracking-widest uppercase text-[#0D0D0D]">
          ARKADE
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-16 pb-32">
        {/* Success Animation */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-[#7A9E87] rounded-full flex items-center justify-center mb-8"
          >
            <motion.div
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Check size={48} color="white" strokeWidth={3} />
            </motion.div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-display font-light text-[#0D0D0D] mb-4"
          >
            ¡Gracias, {order.customerInfo.firstName}!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-body text-[#8C8680] mb-2"
          >
            Pedido #{orderId.slice(0, 8).toUpperCase()} confirmado
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-body text-[#8C8680]"
          >
            Enviamos la confirmación a <span className="text-[#0D0D0D] font-medium">{order.customerInfo.email}</span>
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Order Details Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border border-[#E8E4E0] rounded-[2px] p-8"
          >
            <h2 className="text-lg font-display text-[#0D0D0D] mb-6">Detalles del pedido</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="relative w-16 aspect-[3/4] bg-[#F2EDE8] flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h4 className="text-sm font-medium text-[#0D0D0D] font-body">{item.name}</h4>
                    <p className="text-xs text-[#8C8680] font-body">{item.color} / {item.size} x{item.quantity}</p>
                  </div>
                  <div className="flex flex-col justify-center text-right">
                    <span className="text-sm font-medium text-[#0D0D0D] font-body">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8E4E0] pt-4 space-y-2 text-sm font-body">
              <div className="flex justify-between text-[#8C8680]">
                <span>Subtotal</span>
                <span className="text-[#0D0D0D]">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#8C8680]">
                <span>Envío</span>
                <span className="text-[#0D0D0D]">{order.shippingCost === 0 ? 'Gratis' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#E8E4E0]">
                <span className="text-base font-medium text-[#0D0D0D]">Total</span>
                <span className="text-lg font-semibold text-[#0D0D0D]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </motion.div>

          {/* Delivery Estimate Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[#F2EDE8] rounded-[2px] p-8 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-display text-[#0D0D0D] mb-4">Entrega estimada</h2>
              <p className="text-2xl font-body text-[#0D0D0D] mb-6">Lun 23 — Mié 25 de Junio</p>
              
              <div className="space-y-2 text-sm font-body text-[#8C8680] mb-8">
                <p className="font-medium text-[#0D0D0D]">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                <p>{order.shippingAddress.address} {order.shippingAddress.apartment}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zipCode}</p>
              </div>
            </div>
            
            <button className="w-full border border-[#C4714A] text-[#C4714A] py-4 text-xs font-label uppercase tracking-widest hover:bg-[#C4714A] hover:text-white transition-colors">
              Seguir mi pedido
            </button>
          </motion.div>
        </div>

        {/* Next Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-xl font-display text-[#0D0D0D] mb-8 text-center">Próximos pasos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[#E8E4E0] p-6 text-center">
              <Mail className="mx-auto mb-4 text-[#8C8680]" size={24} strokeWidth={1.5} />
              <h3 className="font-medium text-[#0D0D0D] font-body mb-2">Confirmación</h3>
              <p className="text-sm text-[#8C8680] font-body">Revisá tu email para ver los detalles de tu compra.</p>
            </div>
            <div className="border border-[#E8E4E0] p-6 text-center">
              <Package className="mx-auto mb-4 text-[#8C8680]" size={24} strokeWidth={1.5} />
              <h3 className="font-medium text-[#0D0D0D] font-body mb-2">Preparación</h3>
              <p className="text-sm text-[#8C8680] font-body">Estamos preparando tu pedido con mucho cuidado.</p>
            </div>
            <div className="border border-[#E8E4E0] p-6 text-center">
              <Truck className="mx-auto mb-4 text-[#8C8680]" size={24} strokeWidth={1.5} />
              <h3 className="font-medium text-[#0D0D0D] font-body mb-2">Notificación</h3>
              <p className="text-sm text-[#8C8680] font-body">Te avisaremos cuando tu pedido esté en camino.</p>
            </div>
          </div>
        </motion.div>

        {/* Continue Shopping */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <Link href="/" className="inline-block bg-[#0D0D0D] text-white px-12 py-4 text-xs font-label uppercase tracking-widest hover:bg-[#333333] transition-colors">
            Seguir comprando
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
