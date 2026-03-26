'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { useAuthState } from '@/src/lib/firebase/auth';
import { db } from '@/src/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { AccountLayout } from '@/src/components/account/AccountLayout';

export default function OrdersPage() {
  const { user } = useAuthState();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('customerInfo.email', '==', user.email), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">Pendiente</span>;
      case 'confirmed': return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Confirmado</span>;
      case 'shipped': return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">Enviado</span>;
      case 'delivered': return <span className="px-2 py-1 bg-[#7A9E87]/20 text-[#7A9E87] text-xs rounded-full font-medium">Entregado</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'Todos') return true;
    if (filter === 'En proceso') return ['pending', 'confirmed'].includes(order.status);
    if (filter === 'Enviados') return order.status === 'shipped';
    if (filter === 'Entregados') return order.status === 'delivered';
    return true;
  });

  return (
    <AccountLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-display text-[#0D0D0D] mb-6">Mis Pedidos</h2>
          
          {/* Filters */}
          <div className="flex gap-4 border-b border-[#E8E4E0] mb-8 overflow-x-auto custom-scrollbar">
            {['Todos', 'En proceso', 'Enviados', 'Entregados'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`pb-3 text-sm font-body whitespace-nowrap transition-colors ${
                  filter === tab 
                    ? 'border-b-2 border-[#0D0D0D] text-[#0D0D0D] font-medium' 
                    : 'text-[#8C8680] hover:text-[#0D0D0D]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#E8E4E0] border-t-[#0D0D0D] rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="border border-[#E8E4E0] rounded-[2px] overflow-hidden">
                <div className="bg-[#FAFAFA] border-b border-[#E8E4E0] p-4 md:p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                    <div>
                      <p className="text-xs text-[#8C8680] font-label uppercase tracking-widest mb-1">Pedido</p>
                      <p className="text-sm font-medium text-[#0D0D0D] font-body">#ARK-{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8C8680] font-label uppercase tracking-widest mb-1">Fecha</p>
                      <p className="text-sm font-medium text-[#0D0D0D] font-body">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8C8680] font-label uppercase tracking-widest mb-1">Total</p>
                      <p className="text-sm font-medium text-[#0D0D0D] font-body">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    <Link 
                      href={`/cuenta/pedidos/${order.id}`}
                      className="text-xs font-label uppercase tracking-widest text-[#0D0D0D] border border-[#0D0D0D] px-4 py-2 hover:bg-[#0D0D0D] hover:text-white transition-colors whitespace-nowrap"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
                
                <div className="p-4 md:p-6 flex gap-4 overflow-x-auto custom-scrollbar">
                  {order.items.slice(0, 2).map((item: any, index: number) => (
                    <div key={index} className="relative w-20 aspect-[3/4] bg-[#F2EDE8] border border-[#E8E4E0] flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="w-20 aspect-[3/4] bg-[#FAFAFA] border border-[#E8E4E0] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-[#8C8680] font-body">+{order.items.length - 2} más</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[#E8E4E0] rounded-[2px] p-12 text-center flex flex-col items-center justify-center">
            <Package size={48} className="text-[#C8C2BC] mb-6" strokeWidth={1} />
            <p className="text-[#8C8680] font-body mb-8 text-lg">Todavía no realizaste pedidos</p>
            <Link href="/" className="border border-[#0D0D0D] text-[#0D0D0D] px-8 py-4 text-xs font-label uppercase tracking-widest hover:bg-[#0D0D0D] hover:text-white transition-colors">
              Explorar tienda
            </Link>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
