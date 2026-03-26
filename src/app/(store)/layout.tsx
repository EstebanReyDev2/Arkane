'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/src/components/layout/Header';
import { AnnouncementBar } from '@/src/components/layout/AnnouncementBar';
import { Footer } from '@/src/components/layout/Footer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname?.startsWith('/checkout');
  const isOrderConfirmation = pathname?.startsWith('/pedido-confirmado');

  if (isCheckout) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  if (isOrderConfirmation) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
