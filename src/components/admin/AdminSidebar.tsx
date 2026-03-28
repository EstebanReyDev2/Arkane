'use client'

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Tag, 
  TrendingUp, 
  Settings, 
  ExternalLink,
  ChevronRight,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuthState, signOut } from '@/src/lib/firebase/auth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/src/components/ui/dropdown-menu';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  active?: boolean;
}

const NavItem = ({ href, icon: Icon, label, badge, active }: NavItemProps) => (
  <Link 
    href={href}
    className={cn(
      "flex items-center justify-between h-9 px-3 rounded-md transition-all duration-200 group",
      active 
        ? "bg-white/10 text-white" 
        : "text-[#A8A29E] hover:text-white hover:bg-white/5"
    )}
  >
    <div className="flex items-center gap-3">
      <div className="relative">
        <Icon size={16} strokeWidth={1.5} />
        {badge && badge > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#EF4444] text-white text-[8px] flex items-center justify-center rounded-full font-bold">
            {badge}
          </div>
        )}
      </div>
      <span className="text-[13px] font-medium">{label}</span>
    </div>
  </Link>
);

const NavGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="px-4 mb-2 text-[10px] uppercase tracking-[0.1em] text-[#6B7280] font-bold">
      {label}
    </h3>
    <div className="space-y-1 px-2">
      {children}
    </div>
  </div>
);

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthState();
  
  // In a real app, we'd fetch the actual pending orders count
  const pendingOrdersCount = 3;

  return (
    <aside className="w-[240px] h-screen bg-[#0D0D0D] flex flex-col border-r border-[#1C1C1C] z-50">
      {/* TOP SECTION */}
      <div className="h-14 flex flex-col justify-center px-6 border-b border-[#1C1C1C]">
        <h1 className="text-white text-base font-bold tracking-tight leading-none mb-1">
          NEXUS
        </h1>
        <p className="text-[11px] text-[#6B7280] font-medium uppercase tracking-wider">
          Admin Panel
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <NavGroup label="GENERAL">
          <NavItem 
            href="/admin" 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={pathname === '/admin'} 
          />
          <NavItem 
            href="/admin/productos" 
            icon={Package} 
            label="Productos" 
            active={pathname.startsWith('/admin/productos')} 
          />
          <NavItem 
            href="/admin/pedidos" 
            icon={ShoppingBag} 
            label="Pedidos" 
            badge={pendingOrdersCount}
            active={pathname.startsWith('/admin/pedidos')} 
          />
          <NavItem 
            href="/admin/clientes" 
            icon={Users} 
            label="Clientes" 
            active={pathname.startsWith('/admin/clientes')} 
          />
        </NavGroup>

        <NavGroup label="MARKETING">
          <NavItem 
            href="/admin/descuentos" 
            icon={Tag} 
            label="Descuentos" 
            active={pathname.startsWith('/admin/descuentos')} 
          />
          <NavItem 
            href="/admin/analytics" 
            icon={TrendingUp} 
            label="Analytics" 
            active={pathname.startsWith('/admin/analytics')} 
          />
        </NavGroup>

        <NavGroup label="SISTEMA">
          <NavItem 
            href="/admin/configuracion" 
            icon={Settings} 
            label="Configuración" 
            active={pathname.startsWith('/admin/configuracion')} 
          />
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 h-9 px-3 rounded-md text-[#A8A29E] hover:text-white hover:bg-white/5 transition-all mx-2"
          >
            <ExternalLink size={16} strokeWidth={1.5} />
            <span className="text-[13px] font-medium">Ver tienda ↗</span>
          </a>
        </NavGroup>
      </nav>

      {/* BOTTOM SECTION */}
      <div className="p-4 border-top border-[#1C1C1C]">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Slot />}>
            <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C4714A] flex items-center justify-center text-white text-sm font-bold">
                  {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-white text-[13px] font-medium truncate w-24 text-left">
                    {user?.displayName || 'Admin'}
                  </span>
                  <span className="text-[#6B7280] text-[11px] truncate w-24 text-left">
                    {user?.email}
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#6B7280] group-hover:text-white transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-48 bg-[#1C1C1C] border-[#2C2C2C] text-white">
            <DropdownMenuItem className="hover:bg-white/10 cursor-pointer gap-2">
              <UserIcon size={14} />
              <span>Mi perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="hover:bg-white/10 cursor-pointer gap-2 text-[#EF4444] focus:text-[#EF4444]"
              onClick={() => signOut()}
            >
              <LogOut size={14} />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
