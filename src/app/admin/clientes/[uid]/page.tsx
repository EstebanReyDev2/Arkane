'use client'

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Mail, 
  Calendar, 
  MapPin, 
  ShoppingBag, 
  TrendingUp, 
  User, 
  Clock,
  ExternalLink,
  Package,
  Heart,
  Activity,
  CreditCard
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Badge } from '@/src/components/ui/badge';
import { Skeleton } from '@/src/components/ui/skeleton';
import { cn } from '@/src/lib/utils';
import { getCustomerById, getOrders, Order } from '@/src/lib/firebase/admin-queries';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/src/hooks/use-toast';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/src/components/ui/table';

export default function CustomerDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const uid = resolvedParams.uid;
  const [customer, setCustomer] = useState<any | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!uid) return;
      try {
        const [customerData, ordersData] = await Promise.all([
          getCustomerById(uid as string),
          getOrders() // We'll filter this locally for now
        ]);
        
        if (customerData) {
          setCustomer(customerData);
          setOrders(ordersData.filter(o => o.userId === uid));
        } else {
          toast({ title: "Cliente no encontrado", variant: "destructive" });
        }
      } catch (error) {
        console.error('Error loading customer data:', error);
        toast({ title: "Error al cargar datos", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [uid]);

  const stats = useMemo(() => {
    if (!customer) return [];
    
    const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);
    const aov = orders.length > 0 ? totalSpent / orders.length : 0;
    const lastOrder = orders[0]; // Orders are sorted by date desc

    return [
      { label: 'Total pedidos', value: orders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total gastado', value: `$${totalSpent.toLocaleString('es-AR')}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'AOV', value: `$${aov.toLocaleString('es-AR')}`, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
      { 
        label: 'Último pedido', 
        value: lastOrder ? formatDistanceToNow(lastOrder.createdAt.toDate(), { locale: es, addSuffix: true }) : 'Nunca', 
        icon: Clock, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50' 
      },
    ];
  }, [customer, orders]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-[20px] font-bold text-[#18181B]">Cliente no encontrado</h2>
        <Button variant="outline" onClick={() => router.push('/admin/clientes')}>
          Volver a clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit -ml-2 text-[#71717A] hover:text-[#18181B]"
          onClick={() => router.push('/admin/clientes')}
        >
          <ChevronLeft size={16} className="mr-1" />
          Volver a clientes
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
              <AvatarImage src={customer.photoURL} />
              <AvatarFallback className="bg-[#0D0D0D] text-white text-[20px] font-bold">
                {customer.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h2 className="text-[24px] font-bold text-[#18181B] tracking-tight">{customer.displayName || 'Usuario sin nombre'}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <div className="flex items-center gap-1.5 text-[13px] text-[#71717A]">
                  <Mail size={14} />
                  {customer.email}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-[#71717A]">
                  <Calendar size={14} />
                  Registrado el {customer.createdAt ? format(customer.createdAt.toDate(), 'dd MMM yyyy', { locale: es }) : '—'}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 text-[12px] font-bold uppercase tracking-wider border-[#E4E4E7]">
              Enviar mensaje
            </Button>
            <Button className="h-10 bg-[#0D0D0D] text-white text-[12px] font-bold uppercase tracking-wider">
              Editar cliente
            </Button>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-[#E4E4E7] shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#71717A]">{stat.label}</p>
                <p className="text-[24px] font-bold text-[#18181B] mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TABS SECTION */}
      <Tabs defaultValue="pedidos" className="space-y-6">
        <TabsList className="bg-white border border-[#E4E4E7] p-1 h-12">
          <TabsTrigger value="pedidos" className="px-6 gap-2 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">
            <ShoppingBag size={16} />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="px-6 gap-2 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">
            <Heart size={16} />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="direcciones" className="px-6 gap-2 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">
            <MapPin size={16} />
            Direcciones
          </TabsTrigger>
          <TabsTrigger value="actividad" className="px-6 gap-2 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">
            <Activity size={16} />
            Actividad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos">
          <Card className="border-[#E4E4E7] shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F9F9FB]">
                <TableRow className="hover:bg-transparent border-b border-[#F4F4F5]">
                  <TableHead className="h-12 px-4 text-[11px] font-bold uppercase tracking-wider text-[#71717A]"># Pedido</TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">Fecha</TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">Estado</TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">Items</TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">Total</TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-bold uppercase tracking-wider text-[#71717A] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map(order => (
                    <TableRow key={order.id} className="h-16 hover:bg-[#F9F9FB] border-b border-[#F4F4F5] transition-colors">
                      <TableCell className="px-4 font-mono font-bold text-[#18181B] text-[13px]">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="px-4 text-[13px] text-[#18181B]">
                        {format(order.createdAt.toDate(), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell className="px-4">
                        <Badge className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-100 border">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 text-[13px] text-[#71717A]">
                        {order.items.length} productos
                      </TableCell>
                      <TableCell className="px-4 text-[13px] font-bold text-[#18181B]">
                        ${order.total.toLocaleString('es-AR')}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#71717A] hover:text-[#18181B]" asChild>
                          <Link href={`/admin/pedidos?id=${order.id}`}>
                            <ExternalLink size={16} />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShoppingBag size={24} className="text-[#A1A1AA]" />
                        <p className="text-[14px] font-bold text-[#18181B]">Sin pedidos registrados</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist">
          <Card className="border-[#E4E4E7] shadow-sm p-12 flex flex-col items-center justify-center gap-4">
            <Heart size={48} className="text-[#F4F4F5]" />
            <p className="text-[14px] font-bold text-[#18181B]">Wishlist vacía</p>
            <p className="text-[12px] text-[#71717A]">El cliente aún no ha guardado productos favoritos.</p>
          </Card>
        </TabsContent>

        <TabsContent value="direcciones">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.addresses?.length > 0 ? (
              customer.addresses.map((addr: any, i: number) => (
                <Card key={i} className="border-[#E4E4E7] shadow-sm">
                  <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                      {addr.isDefault ? 'Principal' : `Dirección ${i + 1}`}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-1">
                    <p className="text-[14px] font-bold text-[#18181B]">{addr.street} {addr.number}</p>
                    <p className="text-[13px] text-[#71717A]">{addr.city}, {addr.province}</p>
                    <p className="text-[13px] text-[#71717A]">CP: {addr.zipCode}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-2 border-[#E4E4E7] shadow-sm p-12 flex flex-col items-center justify-center gap-4">
                <MapPin size={48} className="text-[#F4F4F5]" />
                <p className="text-[14px] font-bold text-[#18181B]">Sin direcciones guardadas</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="actividad">
          <Card className="border-[#E4E4E7] shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex gap-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[1px] before:bg-[#E4E4E7]">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center z-10 outline outline-4 outline-white">
                  <ShoppingBag size={12} />
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-[13px] font-bold text-[#18181B]">Pedido realizado</p>
                  <p className="text-[12px] text-[#71717A]">El cliente realizó el pedido #ARK-2024-0847</p>
                  <p className="text-[11px] text-[#A1A1AA] mt-1">hace 2 días</p>
                </div>
              </div>
              <div className="flex gap-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[1px] before:bg-[#E4E4E7]">
                <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center z-10 outline outline-4 outline-white">
                  <User size={12} />
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-[13px] font-bold text-[#18181B]">Registro completado</p>
                  <p className="text-[12px] text-[#71717A]">El cliente se registró en la tienda</p>
                  <p className="text-[11px] text-[#A1A1AA] mt-1">hace 15 días</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
