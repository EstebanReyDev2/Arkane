'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthState, signOut, getUserData } from '@/src/lib/firebase/auth';

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthState();
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/cuenta/login?redirect=${pathname}`);
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
      }
    };
    fetchUserData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#E8E4E0] border-t-[#0D0D0D] rounded-full animate-spin"></div>
      </div>
    );
  }

  const navLinks = [
    { name: 'Mi perfil', href: '/cuenta' },
    { name: 'Mis pedidos', href: '/cuenta/pedidos' },
    { name: 'Mis direcciones', href: '/cuenta/direcciones' },
    { name: 'Mi wishlist', href: '/cuenta/wishlist' },
    { name: 'Métodos de pago', href: '/cuenta/pagos' },
  ];

  const initial = userData?.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U';
  const displayName = userData ? `${userData.firstName} ${userData.lastName}` : user.email;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-12 min-h-[calc(100vh-200px)]">
      {/* LEFT SIDEBAR */}
      <aside className="w-full md:w-[240px] flex-shrink-0 md:sticky md:top-32 h-fit">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#0D0D0D] text-white rounded-full flex items-center justify-center text-lg font-display">
            {initial}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-medium text-[#0D0D0D] font-body truncate">{displayName}</h3>
            <p className="text-xs text-[#8C8680] truncate">{user.email}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-2 px-3 rounded-[2px] text-sm font-body transition-colors ${
                  isActive 
                    ? 'bg-[#F2EDE8] text-[#0D0D0D] font-medium' 
                    : 'text-[#8C8680] hover:bg-[#FAFAFA] hover:text-[#0D0D0D]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="h-px bg-[#E8E4E0] my-4" />
          <button
            onClick={() => signOut()}
            className="text-left py-2 px-3 rounded-[2px] text-sm font-body text-red-500 hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
