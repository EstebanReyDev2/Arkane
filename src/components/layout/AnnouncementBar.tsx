'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-[#0D0D0D] text-[#FAFAFA] px-4 py-2 flex items-center justify-center relative z-50"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-center" style={{ fontFamily: 'var(--font-label)' }}>
            Envío gratuito en pedidos superiores a 150€
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FAFAFA] hover:opacity-70 transition-opacity"
            aria-label="Cerrar anuncio"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
