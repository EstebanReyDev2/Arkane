'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Heart, MapPin } from 'lucide-react';
import { useAuthState, getUserData } from '@/src/lib/firebase/auth';
import { db } from '@/src/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { AccountLayout } from '@/src/components/account/AccountLayout';

export default function AccountDashboard() {
  const { user } = useAuthState();
  const [userData, setUserData] = useState<any>(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        // Fetch user data
        const data = await getUserData(user.uid);
        setUserData(data);

        // Fetch orders count and recent orders
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('customerInfo.email', '==', user.email), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        setOrdersCount(querySnapshot.size);
        
        const recent = querySnapshot.docs.slice(0, 3).map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentOrders(recent);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  return (
    <AccountLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-display text-[#0D0D0D] mb-2">
            Bienvenido, {userData?.firstName || 'Usuario'}
          </h2>
          <p className="text-sm text-[#8C8680] font-body">
            Desde aquí podés gestionar tus pedidos, direcciones y preferencias.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#E8E4E0] rounded-[2px] p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F2EDE8] rounded-full flex items-center justify-center text-[#0D0D0D]">
              <Package size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-[#8C8680] font-body">Pedidos</p>
              <p className="text-xl font-display text-[#0D0D0D]">{ordersCount} realizados</p>
            </div>
          </div>
          <div className="border border-[#E8E4E0] rounded-[2px] p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F2EDE8] rounded-full flex items-center justify-center text-[#0D0D0D]">
              <Heart size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-[#8C8680] font-body">Wishlist</p>
              <p className="text-xl font-display text-[#0D0D0D]">{userData?.wishlist?.length || 0} guardados</p>
            </div>
          </div>
          <div className="border border-[#E8E4E0] rounded-[2px] p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F2EDE8] rounded-full flex items-center justify-center text-[#0D0D0D]">
              <MapPin size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-[#8C8680] font-body">Direcciones</p>
              <p className="text-xl font-display text-[#0D0D0D]">{userData?.addresses?.length || 0} guardadas</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display text-[#0D0D0D]">Pedidos recientes</h3>
            <Link href="/cuenta/pedidos" className="text-xs font-label uppercase tracking-widest text-[#8C8680] hover:text-[#0D0D0D] transition-colors">
              Ver todos mis pedidos
            </Link>
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center border border-[#E8E4E0] rounded-[2px]">
              <div className="w-6 h-6 border-2 border-[#E8E4E0] border-t-[#0D0D0D] rounded-full animate-spin"></div>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="border border-[#E8E4E0] rounded-[2px] overflow-hidden">
              <table className="w-full text-left text-sm font-body">
                <thead className="bg-[#FAFAFA] border-b border-[#E8E4E0] text-[#8C8680]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Pedido</th>
                    <th className="px-6 py-4 font-medium">Fecha</th>
                    <th className="px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4E0]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/cuenta/pedidos/${order.id}`} className="text-[#0D0D0D] font-medium hover:underline">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                        <p className="text-xs text-[#8C8680] mt-1">{order.items.length} producto(s)</p>
                      </td>
                      <td className="px-6 py-4 text-[#0D0D0D]">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-right font-medium text-[#0D0D0D]">{formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-[#E8E4E0] rounded-[2px] p-12 text-center flex flex-col items-center justify-center">
              <Package size={32} className="text-[#C8C2BC] mb-4" strokeWidth={1.5} />
              <p className="text-[#8C8680] font-body mb-6">Todavía no realizaste pedidos</p>
              <Link href="/" className="border border-[#0D0D0D] text-[#0D0D0D] px-8 py-3 text-xs font-label uppercase tracking-widest hover:bg-[#0D0D0D] hover:text-white transition-colors">
                Explorar tienda
              </Link>
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
