'use client'

import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { KpiCard } from '@/src/components/admin/KpiCard';
import { RecentOrdersTable } from '@/src/components/admin/RecentOrdersTable';
import { AlertsRow } from '@/src/components/admin/AlertsRow';
import { getDashboardStats, getOrders, getLowStockProducts, getRecentActivity, DashboardStats, Order, LowStockProduct, ActivityEvent } from '@/src/lib/firebase/admin-queries';
import { Skeleton } from '@/src/components/ui/skeleton';

const COLORS = ['#0D0D0D', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, ordersData, lowStockData, activityData] = await Promise.all([
          getDashboardStats(),
          getOrders({ limit: 5 }),
          getLowStockProducts(5),
          getRecentActivity(24)
        ]);
        setStats(statsData);
        setLowStockItems(lowStockData);
        setActivityEvents(activityData);
        
        // Format orders for the table
        const formattedOrders = ordersData.map(order => ({
          id: order.id,
          orderNumber: `#ARK-${order.id.slice(0, 4).toUpperCase()}`,
          customerName: order.customerName || 'Cliente Invitado',
          customerEmail: order.customerEmail || 'N/A',
          products: order.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(', ') || 'N/A',
          total: order.total,
          status: order.status as any,
          createdAt: order.createdAt
        }));
        setRecentOrders(formattedOrders);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#18181B] tracking-tight">Dashboard Overview</h2>
          <p className="text-[14px] text-[#71717A]">Bienvenido de nuevo. Aquí está el resumen de tu tienda hoy.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 bg-white border border-[#E4E4E7] text-[12px] font-bold uppercase tracking-wider rounded-md hover:bg-[#F4F4F5] transition-all flex items-center gap-2">
            <Calendar size={14} />
            Últimos 30 días
          </button>
          <button className="h-9 px-4 bg-white border border-[#E4E4E7] text-[12px] font-bold uppercase tracking-wider rounded-md hover:bg-[#F4F4F5] transition-all flex items-center gap-2">
            <Download size={14} />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Ventas del mes" 
          value={`$${stats?.monthlySales.toLocaleString('es-AR')}`} 
          change={`${stats?.salesPercentageChange || 0}%`} 
          changeType={stats?.salesPercentageChange && stats.salesPercentageChange > 0 ? "positive" : stats?.salesPercentageChange && stats.salesPercentageChange < 0 ? "negative" : "neutral"}
          icon={DollarSign}
          subtext="vs. mes anterior"
          iconBg="bg-[#F0FDF4]"
        />
        <KpiCard 
          title="Pedidos" 
          value={stats?.monthlyOrders || 0} 
          change="8.2%" 
          changeType="positive"
          icon={ShoppingBag}
          subtext={`${stats?.pendingOrders} pedidos pendientes`}
          iconBg="bg-[#EFF6FF]"
        />
        <KpiCard 
          title="Productos activos" 
          value={stats?.activeProducts || 0} 
          icon={Package}
          subtext={`${stats?.lowStockProducts} con stock bajo`}
          iconBg="bg-[#FDF2F8]"
        />
        <KpiCard 
          title="Clientes nuevos" 
          value={stats?.newCustomers || 0} 
          change="4.1%" 
          changeType="positive"
          icon={Users}
          subtext="este mes"
          iconBg="bg-[#F5F3FF]"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[14px] font-bold text-[#18181B] uppercase tracking-wider">Ventas diarias</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#0D0D0D]" />
                <span className="text-[11px] text-[#71717A] font-medium">Ingresos</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.salesByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D0D0D" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0D0D0D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#A1A1AA' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#A1A1AA' }}
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0D0D0D', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#FFF' }}
                  cursor={{ stroke: '#E4E4E7', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0D0D0D" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white p-6 rounded-lg border border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <h3 className="text-[14px] font-bold text-[#18181B] uppercase tracking-wider mb-6">Ventas por categoría</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                >
                  {stats?.salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0D0D0D', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <RecentOrdersTable data={recentOrders} />

      {/* ALERTS & ACTIVITY */}
      <AlertsRow 
        lowStock={lowStockItems.map(item => ({
          id: item.id,
          name: item.name,
          stock: item.stock
        }))} 
        activity={activityEvents}
      />
    </div>
  );
}
