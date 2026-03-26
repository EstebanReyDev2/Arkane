'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProductForm } from '@/src/components/admin/ProductForm';
import { getProductById } from '@/src/lib/firebase/products';
import { Product } from '@/src/types/product';
import { Skeleton } from '@/src/components/ui/skeleton';
import { toast } from '@/src/hooks/use-toast';
import { Button } from '@/src/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        const data = await getProductById(id as string);
        if (data) {
          setProduct(data);
        } else {
          toast({ title: "Producto no encontrado", variant: "destructive" });
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast({ title: "Error al cargar producto", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[600px] lg:col-span-2 rounded-lg" />
            <Skeleton className="h-[600px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-[20px] font-bold text-[#18181B]">Producto no encontrado</h2>
        <p className="text-[14px] text-[#71717A]">El producto que estás buscando no existe o fue eliminado.</p>
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/productos')}
          className="gap-2"
        >
          <ChevronLeft size={16} />
          Volver a productos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[24px] font-bold text-[#18181B] tracking-tight">Editar Producto</h2>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#71717A]">
          <span>Admin</span>
          <span>/</span>
          <span>Productos</span>
          <span>/</span>
          <span className="text-[#18181B]">{product.name}</span>
        </div>
      </div>

      <ProductForm 
        product={product}
        onSuccess={() => {
          router.push('/admin/productos');
        }}
      />
    </div>
  );
}
