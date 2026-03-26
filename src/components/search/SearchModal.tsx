'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useUiStore } from '@/src/lib/store/uiStore';
import { useProducts } from '@/src/lib/firebase/products';
import { ProductCard } from '@/src/components/product/ProductCard';

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useUiStore();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useProducts();

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Autofocus
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [searchOpen, setSearchOpen]);

  // Close modal and reset
  const handleClose = () => {
    setSearchOpen(false);
    setTimeout(() => setQuery(''), 300); // Reset after animation
  };

  // Filter products client-side
  const filteredProducts = products.filter((product) => {
    if (!debouncedQuery) return false;
    const searchLower = debouncedQuery.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const subcategoryMatch = product.subcategory?.toLowerCase().includes(searchLower);
    const tagsMatch = product.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
    return nameMatch || subcategoryMatch || tagsMatch;
  });

  const isSearching = debouncedQuery.length > 0;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-[#FAFAFA] flex flex-col overflow-y-auto"
        >
          {/* Top Bar */}
          <div className="sticky top-0 bg-[#FAFAFA] z-10 border-b border-[#E8E4E0]">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-24 flex items-center gap-4">
              <SearchIcon size={28} className="text-[#8C8680]" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar prendas, estilos, colecciones..."
                className="flex-1 bg-transparent border-none outline-none text-2xl md:text-[32px] font-display text-[#0D0D0D] placeholder:text-[#8C8680]/50"
                style={{ fontFamily: 'var(--font-display)' }}
              />
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-[#E8E4E0] rounded-full transition-colors"
              >
                <X size={28} strokeWidth={1.5} color="#0D0D0D" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 max-w-[1440px] mx-auto w-full px-6 md:px-12 py-12">
            {!isSearching ? (
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-16"
              >
                {/* Sugerencias: Tendencias */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <h3 className="text-sm font-label uppercase tracking-widest text-[#8C8680]" style={{ fontFamily: 'var(--font-label)' }}>
                    Tendencias
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {['Trench Coat', 'Blazer Lana', 'Cashmere', 'Sale'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-6 py-2 border border-[#E8E4E0] rounded-full text-sm font-body text-[#0D0D0D] hover:border-[#0D0D0D] transition-colors"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Categorías Populares */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <h3 className="text-sm font-label uppercase tracking-widest text-[#8C8680]" style={{ fontFamily: 'var(--font-label)' }}>
                    Categorías Populares
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'Mujer', href: '/mujer' },
                      { name: 'Hombre', href: '/hombre' },
                      { name: 'Accesorios', href: '/accesorios' },
                      { name: 'Sale', href: '/sale' }
                    ].map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={handleClose}
                        className="group relative aspect-[2/1] bg-[#F2EDE8] overflow-hidden flex items-center justify-center"
                      >
                        <span className="relative z-10 text-lg font-display tracking-widest uppercase text-[#0D0D0D] group-hover:scale-105 transition-transform duration-500" style={{ fontFamily: 'var(--font-display)' }}>
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  <h3 className="text-sm font-label uppercase tracking-widest text-[#8C8680]" style={{ fontFamily: 'var(--font-label)' }}>
                    {filteredProducts.length} resultados para &apos;{debouncedQuery}&apos;
                  </h3>
                </motion.div>

                {filteredProducts.length > 0 ? (
                  <motion.div 
                    variants={staggerContainer}
                    className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10"
                  >
                    {filteredProducts.map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants} className="py-20 text-center space-y-6">
                    <p className="text-xl font-body text-[#0D0D0D]" style={{ fontFamily: 'var(--font-body)' }}>
                      No encontramos resultados para &apos;{debouncedQuery}&apos;
                    </p>
                    <div className="flex justify-center gap-4">
                      <Link 
                        href="/mujer" 
                        onClick={handleClose}
                        className="text-sm font-label uppercase tracking-widest text-[#8C8680] hover:text-[#0D0D0D] underline underline-offset-4"
                        style={{ fontFamily: 'var(--font-label)' }}
                      >
                        Ver Mujer
                      </Link>
                      <Link 
                        href="/hombre" 
                        onClick={handleClose}
                        className="text-sm font-label uppercase tracking-widest text-[#8C8680] hover:text-[#0D0D0D] underline underline-offset-4"
                        style={{ fontFamily: 'var(--font-label)' }}
                      >
                        Ver Hombre
                      </Link>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
