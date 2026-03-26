'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ProductVariant } from '@/src/types/product';
import { cn } from '@/src/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ÚNICA'];

export function VariantSelector({ variants, selectedVariant, onVariantChange }: VariantSelectorProps) {
  // Get unique colors
  const uniqueColors = useMemo(() => {
    const colorsMap = new Map<string, { name: string; hex: string }>();
    variants.forEach((v) => {
      if (!colorsMap.has(v.color)) {
        colorsMap.set(v.color, { name: v.color, hex: v.colorHex });
      }
    });
    return Array.from(colorsMap.values());
  }, [variants]);

  // Handle color selection
  const handleColorSelect = (colorName: string) => {
    // Find first available size for this color
    const firstAvailable = variants.find((v) => v.color === colorName && v.stock > 0) || 
                          variants.find((v) => v.color === colorName);
    if (firstAvailable) {
      onVariantChange(firstAvailable);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    const variant = variants.find((v) => v.color === selectedVariant?.color && v.size === size);
    if (variant) {
      onVariantChange(variant);
    }
  };

  // Check if a color is completely sold out
  const isColorSoldOut = (colorName: string) => {
    return variants.filter((v) => v.color === colorName).every((v) => v.stock === 0);
  };

  // Check if a size is sold out for current color
  const isSizeSoldOut = (size: string) => {
    const variant = variants.find((v) => v.color === selectedVariant?.color && v.size === size);
    return !variant || variant.stock === 0;
  };

  return (
    <div className="space-y-8 py-8 border-y border-[#E8E4E0]">
      {/* Color Selector */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-label uppercase tracking-widest text-[#0D0D0D]">
            Color: <span className="text-[#8C8680]">{selectedVariant?.color || 'Seleccionar'}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          {uniqueColors.map((color) => (
            <motion.button
              key={color.name}
              whileHover={{ scale: 1.1 }}
              onClick={() => handleColorSelect(color.name)}
              className={cn(
                "relative w-8 h-8 rounded-full transition-all duration-200",
                selectedVariant?.color === color.name 
                  ? "ring-2 ring-[#0D0D0D] ring-offset-2" 
                  : "ring-1 ring-[#E8E4E0]"
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {isColorSoldOut(color.name) && (
                <div className="absolute inset-0 rounded-full bg-[linear-gradient(to_top_right,transparent_calc(50%-1px),#C8C2BC,transparent_calc(50%+1px))]" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-label uppercase tracking-widest text-[#0D0D0D]">
            Talla: <span className="text-[#8C8680]">{selectedVariant?.size || 'Seleccionar'}</span>
          </span>
          <Sheet>
            <SheetTrigger className="text-[10px] font-label uppercase tracking-widest text-[#8C8680] hover:text-[#0D0D0D] transition-colors flex items-center gap-1">
              📏 Guía de tallas
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md bg-[#FAFAFA] border-[#E8E4E0]">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl font-display tracking-widest uppercase text-[#0D0D0D]">Guía de tallas</SheetTitle>
              </SheetHeader>
              <div className="space-y-8">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E8E4E0] hover:bg-transparent">
                      <TableHead className="text-xs font-label uppercase tracking-widest text-[#0D0D0D]">Talla</TableHead>
                      <TableHead className="text-xs font-label uppercase tracking-widest text-[#0D0D0D]">Busto</TableHead>
                      <TableHead className="text-xs font-label uppercase tracking-widest text-[#0D0D0D]">Cintura</TableHead>
                      <TableHead className="text-xs font-label uppercase tracking-widest text-[#0D0D0D]">Cadera</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { t: 'XS', b: '80-84', c: '60-64', h: '88-92' },
                      { t: 'S', b: '84-88', c: '64-68', h: '92-96' },
                      { t: 'M', b: '88-92', c: '68-72', h: '96-100' },
                      { t: 'L', b: '92-96', c: '72-76', h: '100-104' },
                      { t: 'XL', b: '96-100', c: '76-80', h: '104-108' },
                      { t: 'XXL', b: '100-104', c: '80-84', h: '108-112' },
                    ].map((row, i) => (
                      <TableRow key={row.t} className={cn("border-[#E8E4E0] hover:bg-transparent", i % 2 === 0 ? "bg-[#F2EDE8]" : "bg-white")}>
                        <TableCell className="font-medium text-[#0D0D0D]">{row.t}</TableCell>
                        <TableCell className="text-[#8C8680]">{row.b}cm</TableCell>
                        <TableCell className="text-[#8C8680]">{row.c}cm</TableCell>
                        <TableCell className="text-[#8C8680]">{row.h}cm</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-[10px] font-label uppercase tracking-widest text-[#8C8680] italic">
                  * Las medidas son aproximadas y pueden variar según el modelo.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const exists = variants.some((v) => v.color === selectedVariant?.color && v.size === size);
            if (!exists && size !== 'ÚNICA') return null;
            if (!exists && size === 'ÚNICA' && !variants.some(v => v.size === 'ÚNICA')) return null;

            const soldOut = isSizeSoldOut(size);
            const selected = selectedVariant?.size === size;
            const variant = variants.find((v) => v.color === selectedVariant?.color && v.size === size);
            const lowStock = variant && variant.stock > 0 && variant.stock < 5;

            return (
              <button
                key={size}
                disabled={soldOut}
                onClick={() => handleSizeSelect(size)}
                className={cn(
                  "relative min-w-[56px] h-12 flex items-center justify-center text-xs font-label uppercase tracking-widest transition-all duration-200 border rounded-[2px]",
                  selected 
                    ? "bg-[#0D0D0D] text-[#FAFAFA] border-[#0D0D0D]" 
                    : soldOut 
                      ? "text-[#C8C2BC] border-[#E8E4E0] line-through cursor-not-allowed" 
                      : "text-[#0D0D0D] border-[#C8C2BC] hover:border-[#0D0D0D]"
                )}
              >
                {size}
                {lowStock && !selected && (
                  <div className="absolute top-1 right-1 w-1 h-1 bg-[#C4714A] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Indicator */}
      <div className="h-4">
        {selectedVariant && (
          <div className="flex items-center gap-2">
            {selectedVariant.stock === 0 ? (
              <span className="text-[11px] font-label uppercase tracking-widest text-[#DC2626] flex items-center gap-1">
                ✗ Sin stock en esta variante
              </span>
            ) : selectedVariant.stock < 5 ? (
              <motion.span 
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-[11px] font-label uppercase tracking-widest text-[#C4714A] flex items-center gap-1"
              >
                ⚡ Solo quedan {selectedVariant.stock} unidades
              </motion.span>
            ) : (
              <span className="text-[11px] font-label uppercase tracking-widest text-[#7A9E87] flex items-center gap-1">
                ✓ En stock
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
