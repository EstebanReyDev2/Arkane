'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Plus, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/src/components/ui/popover';

const routeMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/productos': 'Productos',
  '/admin/productos/nuevo': 'Nuevo Producto',
  '/admin/pedidos': 'Pedidos',
  '/admin/clientes': 'Clientes',
  '/admin/descuentos': 'Descuentos',
  '/admin/analytics': 'Analytics',
  '/admin/configuracion': 'Configuración',
};

const notifications = [
  { id: 1, type: 'order', text: 'Nuevo pedido #ARK-001', time: 'hace 5 min', icon: '🛍️' },
  { id: 2, type: 'stock', text: 'Producto sin stock: Trench Coat', time: 'hace 1h', icon: '⚠️' },
  { id: 3, type: 'user', text: 'Nuevo cliente registrado', time: 'hace 3h', icon: '👥' },
  { id: 4, type: 'order', text: 'Pedido #ARK-002 pagado', time: 'hace 5h', icon: '✅' },
  { id: 5, type: 'stock', text: 'Stock bajo: Remera Básica', time: 'hace 1d', icon: '⚠️' },
];

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Generate breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    return {
      label: routeMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: path,
    };
  });

  return (
    <header className="h-14 bg-white border-b border-[#E4E4E7] flex items-center justify-between px-6 z-40">
      {/* LEFT: Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && <span className="text-[#A1A1AA]">/</span>}
            <span className={cn(
              index === breadcrumbs.length - 1 ? "text-[#18181B]" : "text-[#71717A]"
            )}>
              {crumb.label}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* CENTER: Empty for future search */}
      <div className="flex-1 max-w-md px-12">
        {/* <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full h-8 pl-9 pr-4 bg-[#F4F4F5] border-none rounded-md text-[13px] outline-none focus:ring-1 focus:ring-[#0D0D0D] transition-all"
          />
        </div> */}
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] rounded-md transition-all">
              <Bell size={20} strokeWidth={1.5} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 bg-white border-[#E4E4E7] shadow-lg rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#E4E4E7] bg-[#F9F9FB]">
              <h3 className="text-[13px] font-bold text-[#18181B] uppercase tracking-wider">Notificaciones</h3>
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 border-b border-[#F4F4F5] hover:bg-[#F9F9FB] transition-colors cursor-pointer flex gap-3">
                  <span className="text-lg">{notif.icon}</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] text-[#18181B] font-medium">{notif.text}</span>
                    <span className="text-[11px] text-[#71717A]">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 text-center border-t border-[#E4E4E7]">
              <button className="text-[11px] font-bold text-[#0D0D0D] uppercase tracking-wider hover:underline">
                Ver todas
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-[1px] h-5 bg-[#E4E4E7]" />

        {/* New Product Button */}
        <button 
          onClick={() => router.push('/admin/productos/nuevo')}
          className="h-8 px-4 bg-[#0D0D0D] text-white text-[12px] font-bold uppercase tracking-wider rounded-md hover:bg-[#333333] transition-all flex items-center gap-2"
        >
          <Plus size={14} />
          Nuevo Producto
        </button>
      </div>
    </header>
  );
}
