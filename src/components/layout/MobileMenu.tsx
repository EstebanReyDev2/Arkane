'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, ShoppingBag } from 'lucide-react';
import { useUiStore } from '@/src/lib/store/uiStore';
import { useCartStore } from '@/src/lib/store/cartStore';
import { useAuthState, signOut, getUserData } from '@/src/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const totalItems = useCartStore((state) => state.totalItems());
  const { user } = useAuthState();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

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

  const handleClose = () => setMobileMenuOpen(false);

  const handleSignOut = async () => {
    await signOut();
    handleClose();
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    handleClose();
  };

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={handleClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 h-full w-80 bg-[#FAFAFA] border-r border-[#E8E4E0] z-50 md:hidden shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E8E4E0]">
              <Link
                href="/"
                className="text-2xl font-display tracking-widest uppercase text-[#0D0D0D]"
                style={{ fontFamily: 'var(--font-display)' }}
                onClick={handleClose}
              >
                ARKADE
              </Link>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-[#E8E4E0] rounded-[2px] transition-colors"
              >
                <X size={20} strokeWidth={1.5} color="#0D0D0D" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-6 py-8">
              <div className="space-y-6">
                <Link
                  href="/novedades"
                  className="block text-lg font-label uppercase tracking-widest text-[#0D0D0D] hover:text-[#8C8680] transition-colors"
                  style={{ fontFamily: 'var(--font-label)' }}
                  onClick={handleClose}
                >
                  Novedades
                </Link>
                <Link
                  href="/mujer"
                  className="block text-lg font-label uppercase tracking-widest text-[#0D0D0D] hover:text-[#8C8680] transition-colors"
                  style={{ fontFamily: 'var(--font-label)' }}
                  onClick={handleClose}
                >
                  Mujer
                </Link>
                <Link
                  href="/hombre"
                  className="block text-lg font-label uppercase tracking-widest text-[#0D0D0D] hover:text-[#8C8680] transition-colors"
                  style={{ fontFamily: 'var(--font-label)' }}
                  onClick={handleClose}
                >
                  Hombre
                </Link>
                <Link
                  href="/sale"
                  className="block text-lg font-label uppercase tracking-widest text-[#0D0D0D] hover:text-[#8C8680] transition-colors"
                  style={{ fontFamily: 'var(--font-label)' }}
                  onClick={handleClose}
                >
                  Sale
                </Link>
              </div>
            </nav>

            {/* User Section */}
            <div className="px-6 pb-8 border-t border-[#E8E4E0]">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 py-4">
                    <div className="w-10 h-10 bg-[#0D0D0D] text-white rounded-full flex items-center justify-center text-sm font-display">
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-body text-[#0D0D0D]">
                        {userData?.firstName || 'Usuario'}
                      </p>
                      <p className="text-xs font-body text-[#8C8680]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleNavigation('/cuenta')}
                      className="w-full text-left px-4 py-3 text-sm font-body text-[#0D0D0D] hover:bg-[#E8E4E0] rounded-[2px] transition-colors"
                    >
                      Mi cuenta
                    </button>
                    {userData?.role === 'admin' && (
                      <button
                        onClick={() => handleNavigation('/admin')}
                        className="w-full text-left px-4 py-3 text-sm font-body text-blue-600 hover:bg-[#E8E4E0] rounded-[2px] transition-colors"
                      >
                        Panel Administrador
                      </button>
                    )}
                    <button
                      onClick={() => handleNavigation('/cuenta/pedidos')}
                      className="w-full text-left px-4 py-3 text-sm font-body text-[#0D0D0D] hover:bg-[#E8E4E0] rounded-[2px] transition-colors"
                    >
                      Mis pedidos
                    </button>
                    <button
                      onClick={() => handleNavigation('/cuenta/wishlist')}
                      className="w-full text-left px-4 py-3 text-sm font-body text-[#0D0D0D] hover:bg-[#E8E4E0] rounded-[2px] transition-colors"
                    >
                      Mi wishlist
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-sm font-body text-red-500 hover:bg-[#E8E4E0] rounded-[2px] transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => handleNavigation('/cuenta/login')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-[#0D0D0D] hover:bg-[#E8E4E0] rounded-[2px] transition-colors"
                  >
                    <User size={18} strokeWidth={1.5} />
                    Iniciar sesión
                  </button>
                </div>
              )}

              {/* Cart Link */}
              <div className="mt-6 pt-6 border-t border-[#E8E4E0]">
                <button
                  onClick={() => handleNavigation('/carrito')}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-body text-[#0D0D0D] hover:bg-[#E8E4E0] rounded-[2px] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} strokeWidth={1.5} />
                    Carrito
                  </div>
                  {totalItems > 0 && (
                    <span className="bg-[#0D0D0D] text-[#FAFAFA] text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}