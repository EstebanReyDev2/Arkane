'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';

export function HeroSection() {
  return (
    <section className="relative h-[90vh] w-full overflow-hidden">
      <Image
        src="https://picsum.photos/seed/fashion-hero/1920/1080?blur=2"
        alt="ARKADE Nueva Colección"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-[100px] font-display text-white mb-6 tracking-tight"
        >
          The New Classic
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-white/90 font-body text-lg md:text-xl max-w-2xl mb-10"
        >
          Descubre nuestra última colección. Siluetas atemporales reimaginadas para el presente.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/mujer" className="bg-white text-[#0D0D0D] px-8 py-4 text-xs font-medium uppercase tracking-widest hover:bg-white/90 transition-colors">
            Comprar Mujer
          </Link>
          <Link href="/hombre" className="bg-transparent border border-white text-white px-8 py-4 text-xs font-medium uppercase tracking-widest hover:bg-white/10 transition-colors">
            Comprar Hombre
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
