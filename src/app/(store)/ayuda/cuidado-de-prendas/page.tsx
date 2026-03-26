'use client';

import { motion } from 'motion/react';
import { Shirt, Wind, Sun, Droplets } from 'lucide-react';

const CARE_SYMBOLS = [
  { icon: Droplets, title: 'Lavado a mano', desc: 'Temperatura máxima 30°C. No frotar ni retorcer.' },
  { icon: Wind, title: 'Lavado a máquina', desc: 'Ciclo delicado, agua fría. Usar bolsa de lavado.' },
  { icon: Sun, title: 'Secado al aire', desc: 'Secar en plano a la sombra. No usar secadora.' },
  { icon: Shirt, title: 'Planchado', desc: 'Temperatura baja (máx 110°C). Planchar del revés.' },
];

const MATERIALS = [
  {
    name: 'Lana',
    dos: ['Lavar a mano con agua fría y jabón neutro.', 'Secar en plano sobre una toalla.', 'Guardar doblada para evitar que se deforme.'],
    donts: ['No usar lavadora ni secadora.', 'No colgar en perchas.', 'No retorcer para escurrir el agua.']
  },
  {
    name: 'Cachemira',
    dos: ['Lavar a mano o en ciclo muy delicado con agua fría.', 'Usar detergente específico para lana/seda.', 'Planchar a baja temperatura con un paño húmedo.'],
    donts: ['No usar suavizante.', 'No frotar las manchas, dar toques suaves.', 'No exponer directamente al sol al secar.']
  },
  {
    name: 'Lino',
    dos: ['Lavar a máquina en ciclo suave (máx 40°C).', 'Planchar cuando la prenda aún esté ligeramente húmeda.', 'Colgar para secar al aire libre.'],
    donts: ['No usar lejía ni blanqueadores fuertes.', 'No secar en secadora a alta temperatura.', 'No doblar siempre por las mismas líneas para evitar marcas permanents.']
  },
  {
    name: 'Seda',
    dos: ['Lavar a mano en agua fría con champú suave.', 'Enjuagar con agua fría y unas gotas de vinagre blanco para mantener el brillo.', 'Planchar del revés a muy baja temperatura.'],
    donts: ['No rociar perfume o desodorante directamente sobre la seda.', 'No dejar en remojo.', 'No retorcer ni centrifugar.']
  },
  {
    name: 'Algodón',
    dos: ['Lavar a máquina con colores similares.', 'Planchar a temperatura media/alta.', 'Tratar las manchas antes del lavado.'],
    donts: ['No lavar a altas temperaturas para evitar encogimiento.', 'No usar exceso de detergente.', 'Evitar secadoras si es posible para prolongar la vida útil.']
  }
];

export default function CuidadoDePrendasPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-display font-light text-[#0D0D0D] mb-6">
            Cuidado de Prendas
          </h1>
          <p className="text-[#8C8680] font-body text-lg max-w-2xl mx-auto">
            Nuestras prendas están diseñadas para perdurar. Sigue estas instrucciones para mantener la calidad y prolongar la vida útil de tus piezas ARKADE.
          </p>
        </motion.div>

        {/* Symbols Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
        >
          {CARE_SYMBOLS.map((symbol, index) => (
            <div key={index} className="bg-white border border-[#E8E4E0] p-8 rounded-xl text-center hover:border-[#0D0D0D] transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F5F2ED] text-[#0D0D0D] mb-6">
                <symbol.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl mb-3">{symbol.title}</h3>
              <p className="font-body text-sm text-[#8C8680] leading-relaxed">{symbol.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Materials Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-display uppercase tracking-widest mb-12 text-center">Guía por Material</h2>
          
          <div className="space-y-16">
            {MATERIALS.map((material, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16 border-b border-[#E8E4E0] last:border-0">
                <div className="lg:col-span-1">
                  <h3 className="text-3xl font-display font-light text-[#0D0D0D] sticky top-24">{material.name}</h3>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#F5F2ED] p-8 rounded-xl">
                    <h4 className="font-label text-xs uppercase tracking-widest text-[#7A9E87] mb-6 flex items-center gap-2">
                      <span className="text-lg">✓</span> Qué hacer
                    </h4>
                    <ul className="space-y-4 font-body text-sm text-[#0D0D0D]">
                      {material.dos.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-[#8C8680] mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white border border-[#E8E4E0] p-8 rounded-xl">
                    <h4 className="font-label text-xs uppercase tracking-widest text-[#C4714A] mb-6 flex items-center gap-2">
                      <span className="text-lg">✗</span> Qué evitar
                    </h4>
                    <ul className="space-y-4 font-body text-sm text-[#8C8680]">
                      {material.donts.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-[#C8C2BC] mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
