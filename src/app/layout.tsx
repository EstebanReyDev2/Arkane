import type {Metadata} from 'next';
import { Inter, Playfair_Display, Space_Grotesk, Geist } from 'next/font/google';
import './globals.css'; // Global styles
import QueryProvider from '@/src/lib/providers/QueryProvider';
import AuthProvider from '@/src/lib/providers/AuthProvider';
import { SafeConsole } from '@/src/components/SafeConsole';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-label',
});

export const metadata: Metadata = {
  title: 'NEXUS Commerce - ARKADE',
  description: 'Premium contemporary fashion brand',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn(inter.variable, playfair.variable, spaceGrotesk.variable, "font-sans", geist.variable)}>
      <body className="bg-[var(--bg-primary)] text-[var(--color-black)] font-body min-h-screen flex flex-col" suppressHydrationWarning>
        <SafeConsole />
        <AuthProvider>
          <QueryProvider>
            <main className="flex-grow">{children}</main>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
