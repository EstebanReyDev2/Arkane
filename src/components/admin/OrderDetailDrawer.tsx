'use client'

import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose 
} from '@/src/components/ui/sheet';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { 
  X, 
  Copy, 
  ExternalLink, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  User, 
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Order, OrderStatus, updateOrderStatus } from '@/src/lib/firebase/admin-queries';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/src/hooks/use-toast';
import { Input } from '@/src/components/ui/input';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Label } from '@/src/components/ui/label';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700 border-green-200', icon: Package },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: X }
};

export function OrderDetailDrawer({ order, isOpen, onClose, onUpdate }: OrderDetailDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  if (!order) return null;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus, trackingNumber || undefined);
      toast({ title: `Pedido marcado como ${STATUS_CONFIG[newStatus].label}` });
      onUpdate();
    } catch (error) {
      toast({ title: "Error al actualizar el estado", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado al portapapeles" });
  };

  const statusInfo = STATUS_CONFIG[order.status];
  const StatusIcon = statusInfo.icon;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-[560px] p-0 overflow-y-auto border-l border-[#E4E4E7]">
        {/* HEADER */}
        <div className="sticky top-0 bg-white z-10 border-b border-[#F4F4F5] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-bold text-[#18181B] font-mono">#{order.id.substring(0, 8).toUpperCase()}</h2>
            <Badge className={cn("px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border", statusInfo.color)}>
              {statusInfo.label}
            </Badge>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <X size={18} />
            </Button>
          </SheetClose>
        </div>

        <div className="p-6 space-y-8 pb-24">
          {/* ITEMS SECTION */}
          <section className="space-y-4">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#71717A]">Productos</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-3 border border-[#F4F4F5] rounded-lg">
                  <div className="relative w-16 h-20 bg-[#F9F9F9] rounded overflow-hidden flex-shrink-0">
                    <Image 
                      src={item.image || 'https://picsum.photos/seed/product/200/300'} 
                      alt={item.name} 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#18181B] truncate">{item.name}</p>
                    <p className="text-[12px] text-[#71717A] mt-0.5">
                      {item.variant?.color && `Color: ${item.variant.color}`}
                      {item.variant?.size && ` · Talle: ${item.variant.size}`}
                    </p>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-[12px] font-medium text-[#18181B]">Cant: {item.quantity}</p>
                      <p className="text-[13px] font-bold text-[#18181B]">${(item.price * item.quantity).toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#F4F4F5] space-y-2">
              <div className="flex justify-between text-[13px] text-[#71717A]">
                <span>Subtotal</span>
                <span className="text-[#18181B]">${(order.total - (order.shippingCost || 0)).toLocaleString('es-AR')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[13px] text-[#DC2626]">
                  <span>Descuento</span>
                  <span>-${order.discount.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] text-[#71717A]">
                <span>Envío</span>
                <span className="text-[#18181B]">{order.shippingCost > 0 ? `$${order.shippingCost.toLocaleString('es-AR')}` : 'GRATIS'}</span>
              </div>
              <div className="flex justify-between text-[16px] font-bold text-[#18181B] pt-2">
                <span>Total</span>
                <span>${order.total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </section>

          {/* CLIENTE SECTION */}
          <section className="space-y-4">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#71717A]">Cliente</h3>
            <div className="p-4 bg-[#F9F9FB] rounded-lg border border-[#F4F4F5] flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center font-bold text-[14px]">
                {order.customerName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[#18181B]">{order.customerName}</p>
                <p className="text-[12px] text-[#71717A]">{order.customerEmail}</p>
                <p className="text-[12px] text-[#71717A] mt-1">{order.customerPhone || 'Sin teléfono'}</p>
                <Link 
                  href={`/admin/clientes/${order.userId}`} 
                  className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#0D0D0D] mt-3 hover:underline"
                >
                  Ver perfil completo <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </section>

          {/* DIRECCIÓN SECTION */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#71717A]">Dirección de envío</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-[#71717A]"
                onClick={() => copyToClipboard(`${order.shippingAddress.street} ${order.shippingAddress.number}, ${order.shippingAddress.city}`)}
              >
                <Copy size={14} />
              </Button>
            </div>
            <div className="p-4 border border-[#F4F4F5] rounded-lg space-y-1">
              <p className="text-[14px] text-[#18181B] font-medium">
                {order.shippingAddress.street} {order.shippingAddress.number}
                {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
              </p>
              <p className="text-[13px] text-[#71717A]">
                {order.shippingAddress.city}, {order.shippingAddress.province}
              </p>
              <p className="text-[13px] text-[#71717A]">
                CP: {order.shippingAddress.zipCode}
              </p>
            </div>
          </section>

          {/* PAGO SECTION */}
          <section className="space-y-4">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#71717A]">Pago</h3>
            <div className="p-4 border border-[#F4F4F5] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-[#71717A]" />
                <div>
                  <p className="text-[14px] font-bold text-[#18181B]">{order.paymentMethod}</p>
                  <p className="text-[12px] text-[#71717A]">Pagado el {format(order.createdAt.toDate(), 'dd MMM yyyy', { locale: es })}</p>
                </div>
              </div>
              <p className="text-[15px] font-bold text-[#18181B]">${order.total.toLocaleString('es-AR')}</p>
            </div>
          </section>

          {/* ESTADO TIMELINE */}
          <section className="space-y-4">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#71717A]">Estado del pedido</h3>
            <div className="space-y-6 pl-2 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E4E4E7]">
              <div className="relative flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#16A34A] mt-1.5 z-10 outline outline-4 outline-white" />
                <div>
                  <p className="text-[13px] font-bold text-[#18181B]">Pedido confirmado</p>
                  <p className="text-[11px] text-[#71717A]">{format(order.createdAt.toDate(), 'dd/MM/yyyy · HH:mm')}</p>
                </div>
              </div>
              
              <div className="relative flex items-start gap-4">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 z-10 outline outline-4 outline-white",
                  ['confirmed', 'shipped', 'delivered'].includes(order.status) ? "bg-[#16A34A]" : "bg-[#E4E4E7]"
                )} />
                <div>
                  <p className={cn("text-[13px] font-bold", ['confirmed', 'shipped', 'delivered'].includes(order.status) ? "text-[#18181B]" : "text-[#A1A1AA]")}>
                    En preparación
                  </p>
                  {order.status !== 'pending' && (
                    <p className="text-[11px] text-[#71717A]">Completado</p>
                  )}
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 z-10 outline outline-4 outline-white",
                  ['shipped', 'delivered'].includes(order.status) ? "bg-[#16A34A]" : "bg-[#E4E4E7]"
                )} />
                <div>
                  <p className={cn("text-[13px] font-bold", ['shipped', 'delivered'].includes(order.status) ? "text-[#18181B]" : "text-[#A1A1AA]")}>
                    Enviado
                  </p>
                  {order.trackingNumber && (
                    <p className="text-[11px] text-[#71717A]">Seguimiento: {order.trackingNumber}</p>
                  )}
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 z-10 outline outline-4 outline-white",
                  order.status === 'delivered' ? "bg-[#16A34A]" : "bg-[#E4E4E7]"
                )} />
                <div>
                  <p className={cn("text-[13px] font-bold", order.status === 'delivered' ? "text-[#18181B]" : "text-[#A1A1AA]")}>
                    Entregado
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="pt-8 border-t border-[#F4F4F5] space-y-4">
            {order.status === 'confirmed' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <Label htmlFor="tracking" className="text-[13px] font-semibold">Número de seguimiento (Opcional)</Label>
                  <Input 
                    id="tracking" 
                    placeholder="Ej: AR123456789" 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="notify" 
                    checked={notifyCustomer} 
                    onCheckedChange={(v) => setNotifyCustomer(!!v)} 
                  />
                  <Label htmlFor="notify" className="text-[12px] text-[#71717A]">Notificar al cliente por email</Label>
                </div>
                <Button 
                  className="w-full bg-[#0D0D0D] text-white h-11 font-bold uppercase tracking-widest text-[12px]"
                  onClick={() => handleStatusChange('shipped')}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Procesando...' : 'Marcar como enviado'}
                </Button>
              </div>
            )}

            {order.status === 'shipped' && (
              <Button 
                className="w-full bg-[#16A34A] text-white h-11 font-bold uppercase tracking-widest text-[12px] hover:bg-[#15803D]"
                onClick={() => handleStatusChange('delivered')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Procesando...' : 'Marcar como entregado'}
              </Button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-10 text-[11px] font-bold uppercase tracking-wider">
                Imprimir factura
              </Button>
              <Button variant="outline" className="h-10 text-[11px] font-bold uppercase tracking-wider">
                Imprimir etiqueta
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
