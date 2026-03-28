'use client';

import Link from 'next/link';

interface SubcategoryTabsProps {
  basePath: string; // Ej: '/mujer'
  tabs: string[];   // Ej: ['VER TODO', 'VESTIDOS', ...]
  activeTab?: string;
  totalProducts: number;
}

export function SubcategoryTabs({ basePath, tabs, activeTab, totalProducts }: SubcategoryTabsProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E8E4E0] mb-10 pb-4 gap-6">
      <div className="flex overflow-x-auto hide-scrollbar gap-8">
        {tabs.map((tab) => {
          const isActive = (tab === 'VER TODO' && !activeTab) || (activeTab?.toUpperCase() === tab);
          const href = tab === 'VER TODO' ? basePath : `${basePath}?subcategory=${tab.toLowerCase()}`;

          return (
            <Link
              key={tab}
              href={href}
              className={`text-xs font-label uppercase tracking-widest whitespace-nowrap pb-4 -mb-4 transition-colors ${
                isActive 
                  ? 'text-[#0D0D0D] border-b-2 border-[#0D0D0D]' 
                  : 'text-[#8C8680] hover:text-[#0D0D0D]'
              }`}
            >
              {tab}
            </Link>
          );
        })}
      </div>
      <div className="text-sm text-[#8C8680] font-body whitespace-nowrap">
        {totalProducts} productos
      </div>
    </div>
  );
}
