'use client';

import Link from 'next/link';

interface SaleFiltersProps {
  activeCategory: string;
  totalProducts: number;
}

const CATEGORIES = ['TODO', 'MUJER', 'HOMBRE', 'ACCESORIOS'];

export function SaleFilters({ activeCategory, totalProducts }: SaleFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E8E4E0] mb-10 pb-4 gap-6">
      <div className="flex overflow-x-auto hide-scrollbar gap-8 items-center">
        {CATEGORIES.map((cat) => {
          const isActive = (cat === 'TODO' && !activeCategory) || (activeCategory?.toUpperCase() === cat);
          const href = cat === 'TODO' ? '/sale' : `/sale?category=${cat.toLowerCase()}`;

          return (
            <Link
              key={cat}
              href={href}
              className={`text-xs font-label uppercase tracking-widest whitespace-nowrap pb-4 -mb-4 transition-colors ${
                isActive 
                  ? 'text-[#0D0D0D] border-b-2 border-[#0D0D0D]' 
                  : 'text-[#8C8680] hover:text-[#0D0D0D]'
              }`}
            >
              {cat}
            </Link>
          );
        })}
        <div className="flex gap-2 ml-4 pb-4 -mb-4">
          <span className="px-2 py-1 bg-[#F5F2ED] text-[#C4714A] text-[10px] font-bold rounded-full">-20%</span>
          <span className="px-2 py-1 bg-[#F5F2ED] text-[#C4714A] text-[10px] font-bold rounded-full">-30%</span>
          <span className="px-2 py-1 bg-[#F5F2ED] text-[#C4714A] text-[10px] font-bold rounded-full">-50%</span>
        </div>
      </div>
      <div className="text-sm text-[#8C8680] font-body whitespace-nowrap">
        {totalProducts} productos
      </div>
    </div>
  );
}
