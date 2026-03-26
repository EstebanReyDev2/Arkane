'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductImage } from '@/src/types/product';
import { cn } from '@/src/lib/utils';

interface ProductGalleryProps {
  images: ProductImage[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const currentImage = images[activeIndex] || images[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div 
        className="relative aspect-[3/4] bg-[#F2EDE8] overflow-hidden cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
            style={{
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              transform: isHovering ? 'scale(1.5)' : 'scale(1)',
              transition: isHovering ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt}
              fill
              priority={activeIndex === 0}
              className={cn(
                "object-cover",
                currentImage.type === 'detail' ? "p-8" : "p-0"
              )}
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-2 py-1 text-[10px] font-label uppercase tracking-widest text-[#0D0D0D]">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative w-20 aspect-[3/4] bg-[#F2EDE8] flex-shrink-0 transition-all duration-200",
              activeIndex === index 
                ? "border-2 border-[#0D0D0D]" 
                : "border border-transparent hover:border-[#C8C2BC]"
            )}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
