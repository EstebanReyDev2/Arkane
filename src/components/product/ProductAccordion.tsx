'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Product } from "@/src/types/product";
import { WashingMachine, Shirt, Droplets, Wind, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { cn } from "@/src/lib/utils";

interface ProductAccordionProps {
  product: Product;
}

export function ProductAccordion({ product }: ProductAccordionProps) {
  return (
    <Accordion type="single" collapsible defaultValue="description" className="w-full">
      {/* Descripción */}
      <AccordionItem value="description">
        <AccordionTrigger className="text-sm font-label uppercase tracking-widest text-[#0D0D0D]">
          Descripción
        </AccordionTrigger>
        <AccordionContent className="text-base font-body text-[#8C8680] leading-relaxed">
          {product.description}
        </AccordionContent>
      </AccordionItem>

      {/* Composición y cuidados */}
      <AccordionItem value="care">
        <AccordionTrigger className="text-sm font-label uppercase tracking-widest text-[#0D0D0D]">
          Composición y cuidados
        </AccordionTrigger>
        <AccordionContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs font-label uppercase tracking-widest text-[#0D0D0D]">Material</h4>
            <p className="text-sm font-body text-[#8C8680]">{product.attributes.material}</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-label uppercase tracking-widest text-[#0D0D0D]">Cuidados</h4>
            <div className="grid grid-cols-1 gap-4">
              {product.attributes.care.map((care, index) => (
                <div key={index} className="flex items-center gap-3 text-[#8C8680]">
                  {care.toLowerCase().includes('lavar') && <WashingMachine size={18} strokeWidth={1.5} />}
                  {care.toLowerCase().includes('planchar') && <Shirt size={18} strokeWidth={1.5} />}
                  {care.toLowerCase().includes('secar') && <Wind size={18} strokeWidth={1.5} />}
                  {care.toLowerCase().includes('lejía') && <Droplets size={18} strokeWidth={1.5} />}
                  {!care.toLowerCase().includes('lavar') && !care.toLowerCase().includes('planchar') && !care.toLowerCase().includes('secar') && !care.toLowerCase().includes('lejía') && <Info size={18} strokeWidth={1.5} />}
                  <span className="text-sm font-body">{care}</span>
                </div>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Guía de tallas */}
      <AccordionItem value="size-guide">
        <AccordionTrigger className="text-sm font-label uppercase tracking-widest text-[#0D0D0D]">
          Guía de tallas
        </AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E8E4E0] hover:bg-transparent">
                <TableHead className="text-[10px] font-label uppercase tracking-widest text-[#0D0D0D]">Talla</TableHead>
                <TableHead className="text-[10px] font-label uppercase tracking-widest text-[#0D0D0D]">Busto</TableHead>
                <TableHead className="text-[10px] font-label uppercase tracking-widest text-[#0D0D0D]">Cintura</TableHead>
                <TableHead className="text-[10px] font-label uppercase tracking-widest text-[#0D0D0D]">Cadera</TableHead>
                <TableHead className="text-[10px] font-label uppercase tracking-widest text-[#0D0D0D]">Largo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { t: 'XS', b: '80-84', c: '60-64', h: '88-92', l: '90cm' },
                { t: 'S', b: '84-88', c: '64-68', h: '92-96', l: '92cm' },
                { t: 'M', b: '88-92', c: '68-72', h: '96-100', l: '94cm' },
                { t: 'L', b: '92-96', c: '72-76', h: '100-104', l: '96cm' },
                { t: 'XL', b: '96-100', c: '76-80', h: '104-108', l: '98cm' },
                { t: 'XXL', b: '100-104', c: '80-84', h: '108-112', l: '100cm' },
              ].map((row, i) => (
                <TableRow key={row.t} className={cn("border-[#E8E4E0] hover:bg-transparent", i % 2 === 0 ? "bg-[#F2EDE8]" : "bg-white")}>
                  <TableCell className="font-medium text-[#0D0D0D] text-xs">{row.t}</TableCell>
                  <TableCell className="text-[#8C8680] text-xs">{row.b}</TableCell>
                  <TableCell className="text-[#8C8680] text-xs">{row.c}</TableCell>
                  <TableCell className="text-[#8C8680] text-xs">{row.h}</TableCell>
                  <TableCell className="text-[#8C8680] text-xs">{row.l}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-[10px] font-label uppercase tracking-widest text-[#8C8680] italic mt-4">
            * Las medidas son aproximadas y pueden variar según el modelo.
          </p>
        </AccordionContent>
      </AccordionItem>

      {/* Envíos y Devoluciones */}
      <AccordionItem value="shipping">
        <AccordionTrigger className="text-sm font-label uppercase tracking-widest text-[#0D0D0D]">
          Envíos y Devoluciones
        </AccordionTrigger>
        <AccordionContent className="space-y-4 text-sm font-body text-[#8C8680]">
          <p>• Envío gratis en pedidos superiores a $150.000</p>
          <p>• Retiro en tienda disponible — Av. Santa Fe 1234</p>
          <p>• Devoluciones gratis hasta 30 días después</p>
          <p className="pt-4">
            ¿Preguntas? <a href="#" className="underline underline-offset-4 text-[#0D0D0D]">contactanos →</a>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
