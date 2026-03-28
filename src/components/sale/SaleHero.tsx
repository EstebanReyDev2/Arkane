'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

export function SaleHero() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
      <div className="bg-[#F5F2ED] flex flex-col justify-center px-8 md:px-20 py-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl md:text-[80px] font-display font-light text-[#0D0D0D] leading-none mb-6"
        >
          Sale
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-[#8C8680] font-body mb-10"
        >
          Hasta 50% de descuento en piezas seleccionadas.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button 
            onClick={() => {
              document.getElementById('sale-products')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#C4714A] text-white px-8 py-4 font-label text-xs uppercase tracking-widest hover:bg-[#A85D3A] transition-colors inline-block"
          >
            VER TODO EL SALE
          </button>
        </motion.div>
      </div>
      <div className="relative h-[40vh] md:h-auto">
        <Image
          src="https://picsum.photos/seed/sale/700/500"
          alt="Sale Editorial"
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
