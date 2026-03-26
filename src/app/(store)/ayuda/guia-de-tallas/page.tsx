'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

const CATEGORIES = ['Mujer', 'Hombre', 'Accesorios'];

const SIZE_CHARTS = {
  Mujer: [
    { talla: 'XS', busto: '80-84', cintura: '60-64', cadera: '88-92', largo: '102' },
    { talla: 'S', busto: '84-88', cintura: '64-68', cadera: '92-96', largo: '104' },
    { talla: 'M', busto: '88-92', cintura: '68-72', cadera: '96-100', largo: '106' },
    { talla: 'L', busto: '92-96', cintura: '72-76', cadera: '100-104', largo: '108' },
    { talla: 'XL', busto: '96-100', cintura: '76-80', cadera: '104-108', largo: '110' },
  ],
  Hombre: [
    { talla: 'S', pecho: '88-92', cintura: '76-80', cadera: '92-96', largo: '106' },
    { talla: 'M', pecho: '96-100', cintura: '84-88', cadera: '100-104', largo: '108' },
    { talla: 'L', pecho: '104-108', cintura: '92-96', cadera: '108-112', largo: '110' },
    { talla: 'XL', pecho: '112-116', cintura: '100-104', cadera: '116-120', largo: '112' },
    { talla: 'XXL', pecho: '120-124', cintura: '108-112', cadera: '124-128', largo: '114' },
  ],
  Accesorios: [
    { talla: 'S', anillo: '15-16mm', cinturon: '85cm', sombrero: '56cm' },
    { talla: 'M', anillo: '17-18mm', cinturon: '95cm', sombrero: '58cm' },
    { talla: 'L', anillo: '19-20mm', cinturon: '105cm', sombrero: '60cm' },
  ]
};

export default function GuiaDeTallasPage() {
  const [activeCategory, setActiveCategory] = useState<keyof typeof SIZE_CHARTS>('Mujer');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-light text-[#0D0D0D] mb-6">
            Guía de Tallas
          </h1>
          <p className="text-[#8C8680] font-body text-lg max-w-2xl mx-auto">
            Encuentra tu talla perfecta. Las medidas están expresadas en centímetros.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex overflow-x-auto hide-scrollbar gap-8 mb-12 border-b border-[#E8E4E0] pb-4 justify-start md:justify-center"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as keyof typeof SIZE_CHARTS)}
              className={`text-xs font-label uppercase tracking-widest whitespace-nowrap pb-4 -mb-4 transition-colors ${
                activeCategory === cat 
                  ? 'text-[#0D0D0D] border-b-2 border-[#0D0D0D]' 
                  : 'text-[#8C8680] hover:text-[#0D0D0D]'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Size Table */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-x-auto mb-20"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E4E0]">
                {Object.keys(SIZE_CHARTS[activeCategory][0]).map((key) => (
                  <th key={key} className="py-4 px-6 font-label text-xs uppercase tracking-widest text-[#8C8680]">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_CHARTS[activeCategory].map((row, index) => (
                <tr key={index} className="border-b border-[#E8E4E0] hover:bg-[#F5F2ED] transition-colors">
                  {Object.values(row).map((val, i) => (
                    <td key={i} className={`py-4 px-6 font-body text-sm ${i === 0 ? 'font-bold text-[#0D0D0D]' : 'text-[#8C8680]'}`}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* How to Measure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#F5F2ED] p-8 md:p-12 rounded-xl"
        >
          <h2 className="text-2xl font-display uppercase tracking-widest mb-8 text-center">Cómo medirte</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-body text-[#8C8680]">
            <div>
              <h3 className="font-bold text-[#0D0D0D] mb-2">1. Pecho / Busto</h3>
              <p>Mide el contorno de tu pecho en la parte más prominente, manteniendo la cinta métrica horizontal.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#0D0D0D] mb-2">2. Cintura</h3>
              <p>Mide el contorno de tu cintura natural, justo por encima de tu ombligo y debajo de tus costillas.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#0D0D0D] mb-2">3. Cadera</h3>
              <p>Mide el contorno de tu cadera en la parte más ancha, manteniendo los pies juntos.</p>
            </div>
          </div>

          <div className="mt-12 text-center p-4 bg-white border border-[#E8E4E0] rounded-lg">
            <p className="font-label text-xs uppercase tracking-widest text-[#C4714A]">
              💡 Tip: En caso de duda entre dos tallas, te recomendamos elegir la talla más grande.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
