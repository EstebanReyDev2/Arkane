'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-[#0D0D0D] text-[#FAFAFA] pt-20 pb-10 px-6 md:px-12 mt-auto"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20">
          {/* Brand Description */}
          <div className="col-span-1">
            <h2 className="text-2xl font-display tracking-widest uppercase mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              ARKADE
            </h2>
            <p className="text-[#8C8680] text-sm leading-relaxed font-body" style={{ fontFamily: 'var(--font-body)' }}>
              Redefiniendo el lujo contemporáneo a través de siluetas minimalistas y materiales excepcionales. Diseñado para perdurar.
            </p>
          </div>

          {/* Explorar */}
          <div className="col-span-1">
            <h3 className="text-xs font-label uppercase tracking-widest mb-6" style={{ fontFamily: 'var(--font-label)' }}>
              Explorar
            </h3>
            <ul className="space-y-4 text-sm text-[#8C8680] font-body" style={{ fontFamily: 'var(--font-body)' }}>
              <li><Link href="/novedades" className="hover:text-[#FAFAFA] transition-colors">Novedades</Link></li>
              <li><Link href="/mujer" className="hover:text-[#FAFAFA] transition-colors">Mujer</Link></li>
              <li><Link href="/hombre" className="hover:text-[#FAFAFA] transition-colors">Hombre</Link></li>
              <li><Link href="/accesorios" className="hover:text-[#FAFAFA] transition-colors">Accesorios</Link></li>
              <li><Link href="/sale" className="hover:text-[#FAFAFA] transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Asistencia */}
          <div className="col-span-1">
            <h3 className="text-xs font-label uppercase tracking-widest mb-6" style={{ fontFamily: 'var(--font-label)' }}>
              Asistencia
            </h3>
            <ul className="space-y-4 text-sm text-[#8C8680] font-body" style={{ fontFamily: 'var(--font-body)' }}>
              <li><Link href="/ayuda/contacto" className="hover:text-[#FAFAFA] transition-colors">Contacto</Link></li>
              <li><Link href="/ayuda/envios" className="hover:text-[#FAFAFA] transition-colors">Envíos y Devoluciones</Link></li>
              <li><Link href="/ayuda/preguntas-frecuentes" className="hover:text-[#FAFAFA] transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/ayuda/guia-de-tallas" className="hover:text-[#FAFAFA] transition-colors">Guía de Tallas</Link></li>
              <li><Link href="/ayuda/cuidado-de-prendas" className="hover:text-[#FAFAFA] transition-colors">Cuidado de Prendas</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-xs font-label uppercase tracking-widest mb-6" style={{ fontFamily: 'var(--font-label)' }}>
              Newsletter
            </h3>
            <p className="text-[#8C8680] text-sm mb-4 font-body" style={{ fontFamily: 'var(--font-body)' }}>
              Suscríbete para recibir acceso anticipado a nuevas colecciones y eventos exclusivos.
            </p>
            <form className="flex border-b border-[#8C8680] pb-2 group focus-within:border-[#FAFAFA] transition-colors" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Tu dirección de email"
                className="bg-transparent border-none outline-none text-sm w-full text-[#FAFAFA] placeholder:text-[#8C8680] font-body"
                style={{ fontFamily: 'var(--font-body)' }}
                required
              />
              <button type="submit" className="text-[#8C8680] group-focus-within:text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors" aria-label="Suscribirse">
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#333333] text-xs text-[#8C8680] font-body" style={{ fontFamily: 'var(--font-body)' }}>
          <p>&copy; {new Date().getFullYear()} ARKADE. Todos los derechos reservados.</p>
          
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FAFAFA] transition-colors" aria-label="Instagram">
              <Instagram size={18} strokeWidth={1.5} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FAFAFA] transition-colors" aria-label="Twitter">
              <Twitter size={18} strokeWidth={1.5} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FAFAFA] transition-colors" aria-label="Facebook">
              <Facebook size={18} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
