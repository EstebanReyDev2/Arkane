'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useAuthState } from '@/src/lib/firebase/auth';
import { db } from '@/src/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { AccountLayout } from '@/src/components/account/AccountLayout';

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { user } = useAuthState();
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.orderId;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) return;
      
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().customerInfo.email === user.email) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">Pendiente</span>;
      case 'confirmed': return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Confirmado</span>;
      case 'shipped': return <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">Enviado</span>;
      case 'delivered': return <span className="px-3 py-1 bg-[#7A9E87]/20 text-[#7A9E87] text-xs rounded-full font-medium">Entregado</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Tarjeta de crédito/débito';
      case 'mercado_pago': return 'Mercado Pago';
      case 'transfer': return 'Transferencia bancaria';
      default: return method;
    }
  };

  const getShippingMethodName = (method: string) => {
    switch (method) {
      case 'standard': return 'Envío estándar';
      case 'express': return 'Envío express';
      case 'pickup': return 'Retiro en tienda';
      default: return method;
    }
  };

  if (loading) {
    return (
      <AccountLayout>
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#E8E4E0] border-t-[#0D0D0D] rounded-full animate-spin"></div>
        </div>
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout>
        <div className="border border-[#E8E4E0] rounded-[2px] p-12 text-center flex flex-col items-center justify-center">
          <Package size={48} className="text-[#C8C2BC] mb-6" strokeWidth={1} />
          <p className="text-[#8C8680] font-body mb-8 text-lg">Pedido no encontrado o no tenés permiso para verlo.</p>
          <Link href="/cuenta/pedidos" className="border border-[#0D0D0D] text-[#0D0D0D] px-8 py-4 text-xs font-label uppercase tracking-widest hover:bg-[#0D0D0D] hover:text-white transition-colors">
            Volver a mis pedidos
          </Link>
        </div>
      </AccountLayout>
    );
  }

  const steps = [
    { id: 'confirmed', label: 'Confirmado', icon: CheckCircle },
    { id: 'preparing', label: 'En preparación', icon: Package },
    { id: 'shipped', label: 'Enviado', icon: Truck },
    { id: 'delivered', label: 'Entregado', icon: CheckCircle },
  ];

  let currentStepIndex = 0;
  if (order.status === 'confirmed') currentStepIndex = 0;
  if (order.status === 'preparing') currentStepIndex = 1;
  if (order.status === 'shipped') currentStepIndex = 2;
  if (order.status === 'delivered') currentStepIndex = 3;

  return (
    <AccountLayout>
      <div className="flex flex-col gap-8">
        <div>
          <Link href="/cuenta/pedidos" className="text-sm text-[#8C8680] hover:text-[#0D0D0D] font-body flex items-center gap-2 mb-6 transition-colors">
            ← Volver a mis pedidos
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-display text-[#0D0D0D] mb-2">Pedido #ARK-{order.id.slice(0, 8).toUpperCase()}</h2>
              <p className="text-sm text-[#8C8680] font-body">Realizado el {formatDate(order.createdAt)}</p>
            </div>
            <div>
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="border border-[#E8E4E0] rounded-[2px] p-8 bg-[#FAFAFA]">
          <div className="relative flex justify-between">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-[#E8E4E0] -z-10"></div>
            <div 
              className="absolute top-5 left-0 h-0.5 bg-[#0D0D0D] -z-10 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-3 bg-[#FAFAFA] px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted ? 'bg-[#0D0D0D] border-[#0D0D0D] text-white' : 'bg-white border-[#E8E4E0] text-[#C8C2BC]'
                  }`}>
                    <Icon size={20} strokeWidth={isCurrent ? 2 : 1.5} />
                  </div>
                  <span className={`text-xs font-label uppercase tracking-widest text-center ${
                    isCurrent ? 'text-[#0D0D0D] font-medium' : isCompleted ? 'text-[#0D0D0D]' : 'text-[#8C8680]'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 border border-[#E8E4E0] rounded-[2px] overflow-hidden">
            <div className="bg-[#FAFAFA] border-b border-[#E8E4E0] p-6">
              <h3 className="text-lg font-display text-[#0D0D0D]">Productos ({order.items.length})</h3>
            </div>
            <div className="divide-y divide-[#E8E4E0]">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="p-6 flex flex-col sm:flex-row gap-6">
                  <div className="relative w-24 aspect-[3/4] bg-[#F2EDE8] border border-[#E8E4E0] flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-medium text-[#0D0D0D] font-body mb-1">{item.name}</h4>
                      <p className="text-sm text-[#8C8680] font-body mb-2">Color: {item.color} | Talle: {item.size}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-[#8C8680] font-body">Cantidad: {item.quantity}</p>
                      <p className="text-base font-medium text-[#0D0D0D] font-body">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#FAFAFA] border-t border-[#E8E4E0] p-6 space-y-3">
              <div className="flex justify-between text-sm font-body text-[#8C8680]">
                <span>Subtotal</span>
                <span className="text-[#0D0D0D]">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body text-[#8C8680]">
                <span>Envío ({getShippingMethodName(order.shippingMethod)})</span>
                <span className="text-[#0D0D0D]">{order.shippingCost === 0 ? 'Gratis' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-[#E8E4E0]">
                <span className="text-base font-medium text-[#0D0D0D] font-body">Total</span>
                <span className="text-xl font-display text-[#0D0D0D]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div className="space-y-6">
            <div className="border border-[#E8E4E0] rounded-[2px] p-6">
              <h3 className="text-sm font-label uppercase tracking-widest text-[#0D0D0D] mb-4">Dirección de envío</h3>
              <div className="text-sm font-body text-[#8C8680] space-y-1">
                <p className="font-medium text-[#0D0D0D]">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                <p>{order.shippingAddress.address} {order.shippingAddress.apartment}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                <p>CP: {order.shippingAddress.zipCode}</p>
                <p className="pt-2">Tel: {order.customerInfo.phone}</p>
              </div>
            </div>

            <div className="border border-[#E8E4E0] rounded-[2px] p-6">
              <h3 className="text-sm font-label uppercase tracking-widest text-[#0D0D0D] mb-4">Método de pago</h3>
              <div className="text-sm font-body text-[#8C8680]">
                <p>{getPaymentMethodName(order.paymentMethod)}</p>
              </div>
            </div>

            {order.status === 'delivered' && (
              <button className="w-full border border-[#0D0D0D] text-[#0D0D0D] py-4 text-xs font-label uppercase tracking-widest hover:bg-[#0D0D0D] hover:text-white transition-colors">
                Solicitar devolución
              </button>
            )}
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
