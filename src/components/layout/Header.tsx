'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useCartStore } from '@/src/lib/store/cartStore';
import { useUiStore } from '@/src/lib/store/uiStore';
import { useEffect, useState } from 'react';
import { useAuthState, signOut, getUserData } from '@/src/lib/firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { SearchModal } from '@/src/components/search/SearchModal';

export function Header() {
  const router = useRouter();
  const totalItems = useCartStore((state) => state.totalItems());
  const { setSearchOpen } = useUiStore();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthState();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
      }
    };
    fetchUserData();
  }, [user]);

  const initial = userData?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FAFAFA] border-b border-[#E8E4E0]">
        <div className="flex items-center justify-between h-20 px-6 md:px-12 max-w-[1440px] mx-auto">
          {/* Mobile Menu & Search */}
          <div className="flex items-center gap-4 md:w-1/3">
            <button className="md:hidden hover:opacity-70 transition-opacity">
              <Menu size={20} strokeWidth={1.5} color="#0D0D0D" />
            </button>
            <button 
              onClick={() => setSearchOpen(true)}
              className="hidden md:block hover:opacity-70 transition-opacity"
            >
              <Search size={20} strokeWidth={1.5} color="#0D0D0D" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex justify-center md:w-1/3">
            <Link href="/" className="text-2xl font-display tracking-widest uppercase text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
              ARKADE
            </Link>
          </div>

          {/* Desktop Navigation & Icons */}
          <div className="flex items-center justify-end gap-6 md:w-1/3">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/novedades" className="text-xs font-label uppercase tracking-widest text-[#0D0D0D] hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-label)' }}>
                Novedades
              </Link>
              <Link href="/mujer" className="text-xs font-label uppercase tracking-widest text-[#0D0D0D] hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-label)' }}>
                Mujer
              </Link>
              <Link href="/hombre" className="text-xs font-label uppercase tracking-widest text-[#0D0D0D] hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-label)' }}>
                Hombre
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              {mounted && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <div className="w-8 h-8 bg-[#0D0D0D] text-white rounded-full flex items-center justify-center text-xs font-display hover:opacity-80 transition-opacity">
                      {initial}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-[2px] border-[#E8E4E0] font-body">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/cuenta')}>
                      Mi cuenta
                    </DropdownMenuItem>
                    {userData?.role === 'admin' && (
                      <DropdownMenuItem className="cursor-pointer text-blue-600 focus:text-blue-600" onClick={() => router.push('/admin')}>
                        Panel Administrador
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/cuenta/pedidos')}>
                      Mis pedidos
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/cuenta/wishlist')}>
                      Mi wishlist
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#E8E4E0]" />
                    <DropdownMenuItem 
                      onClick={() => signOut()}
                      className="cursor-pointer text-red-500 focus:text-red-500"
                    >
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/cuenta/login" className="hover:opacity-70 transition-opacity hidden md:block">
                  <User size={20} strokeWidth={1.5} color="#0D0D0D" />
                </Link>
              )}
              
              <Link href="/carrito" className="relative hover:opacity-70 transition-opacity flex items-center">
                <ShoppingBag size={20} strokeWidth={1.5} color="#0D0D0D" />
                {mounted && totalItems > 0 && (
                  <motion.div
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    className="absolute -top-1.5 -right-1.5 bg-[#0D0D0D] text-[#FAFAFA] text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>
      <SearchModal />
    </>
  );
}
