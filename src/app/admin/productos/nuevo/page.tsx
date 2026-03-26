'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/src/components/admin/ProductForm';
import { toast } from '@/src/hooks/use-toast';

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[24px] font-bold text-[#18181B] tracking-tight">Nuevo Producto</h2>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#71717A]">
          <span>Admin</span>
          <span>/</span>
          <span>Productos</span>
          <span>/</span>
          <span className="text-[#18181B]">Nuevo</span>
        </div>
      </div>

      <ProductForm 
        onSuccess={(id) => {
          router.push('/admin/productos');
        }} 
      />
    </div>
  );
}
