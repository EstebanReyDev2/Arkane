'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Trash2, 
  UploadCloud, 
  X, 
  GripVertical, 
  Star, 
  Check, 
  Info,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/src/components/ui/tabs';
import { 
  Input 
} from '@/src/components/ui/input';
import { 
  Textarea 
} from '@/src/components/ui/textarea';
import { 
  Button 
} from '@/src/components/ui/button';
import { 
  Switch 
} from '@/src/components/ui/switch';
import { 
  Label 
} from '@/src/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/src/components/ui/select';
import { 
  Checkbox 
} from '@/src/components/ui/checkbox';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/src/components/ui/card';
import { 
  Badge 
} from '@/src/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/src/components/ui/dropdown-menu';
import { cn } from '@/src/lib/utils';
import { Product, ProductVariant, ProductImage } from '@/src/types/product';
import { storage } from '@/src/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { createProduct, updateProduct } from '@/src/lib/firebase/admin-queries';
import { toast } from '@/src/hooks/use-toast';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

const variantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  color: z.string(),
  colorHex: z.string(),
  size: z.string(),
  stock: z.number().min(0, "El stock no puede ser negativo"),
  price: z.number().nullable(),
  isActive: z.boolean().default(true)
});

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
  type: z.enum(['main', 'detail', 'model', 'lifestyle'])
});

const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, "El slug solo puede contener letras minúsculas, números y guiones"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres").max(500),
  basePrice: z.number().min(1, "El precio base debe ser al menos 1"),
  salePrice: z.number().nullable().optional(),
  category: z.enum(['mujer', 'hombre', 'accesorios']),
  subcategory: z.string().min(1, "La subcategoría es requerida"),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  attributes: z.object({
    material: z.string().min(1, "El material es requerido"),
    care: z.array(z.string()).default([]),
    fit: z.string().min(1, "El fit es requerido"),
    collection: z.string().min(1, "La colección es requerida")
  }),
  variants: z.array(variantSchema).min(1, "Debe haber al menos una variante"),
  images: z.array(imageSchema).min(1, "Debe haber al menos una imagen"),
  vertical: z.string().default('fashion')
}).refine(data => !data.salePrice || data.salePrice < data.basePrice, {
  message: "El precio de oferta debe ser menor al precio base",
  path: ["salePrice"]
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess: (productId: string) => void;
}

const CATEGORIES = {
  mujer: ['Abrigos', 'Vestidos', 'Pantalones', 'Camisas', 'Punto', 'Sastrería', 'Faldas', 'Accesorios'],
  hombre: ['Sastrería', 'Camisas', 'Pantalones', 'Punto', 'Abrigos', 'Basics'],
  accesorios: ['Bolsos', 'Cinturones', 'Bufandas', 'Carteras', 'Joyería']
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ÚNICA'];
const TAGS = ['new', 'featured', 'bestseller', 'sale', 'sustainable'];
const FITS = ['Regular', 'Oversized', 'Slim', 'Relaxed'];

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Local state for variant builder
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    trigger
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: product ? {
      ...product,
      salePrice: product.salePrice || null,
    } : {
      name: '',
      slug: '',
      description: '',
      basePrice: 0,
      salePrice: null,
      category: 'mujer',
      subcategory: '',
      isActive: true,
      tags: [],
      attributes: {
        material: '',
        care: [],
        fit: 'Regular',
        collection: ''
      },
      variants: [],
      images: [],
      vertical: 'fashion'
    }
  });

  const { fields: careFields, append: appendCare, remove: removeCare } = useFieldArray({
    control,
    name: "attributes.care" as any
  });

  const { fields: imageFields, append: appendImage, remove: removeImage, move: moveImage } = useFieldArray({
    control,
    name: "images"
  });

  const { fields: variantFields, replace: replaceVariants, remove: removeVariant } = useFieldArray({
    control,
    name: "variants"
  });

  const watchName = watch('name');
  const watchCategory = watch('category');
  const watchBasePrice = watch('basePrice');
  const watchSalePrice = watch('salePrice');
  const watchImages = watch('images');
  const watchVariants = watch('variants');
  const watchSlug = watch('slug');
  const watchDescription = watch('description');

  // Auto-generate slug from name
  useEffect(() => {
    if (!product && watchName) {
      const slug = watchName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [watchName, setValue, product]);

  // Handle category change -> reset subcategory
  useEffect(() => {
    if (watchCategory === 'accesorios') {
      setSelectedSizes(['ÚNICA']);
    }
  }, [watchCategory]);

  const handleAddColor = () => {
    if (newColorName && !colors.find(c => c.name === newColorName)) {
      setColors([...colors, { name: newColorName, hex: newColorHex }]);
      setNewColorName('');
    }
  };

  const handleRemoveColor = (name: string) => {
    setColors(colors.filter(c => c.name !== name));
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const generateVariants = () => {
    // Include pending color input if exists
    let finalColors = [...colors];
    if (newColorName.trim() && !colors.find(c => c.name === newColorName)) {
      finalColors = [...finalColors, { name: newColorName.trim(), hex: newColorHex }];
      setNewColorName('');
    }

    if (finalColors.length === 0 || selectedSizes.length === 0) {
      toast({ title: "Definí al menos un color y un talle", variant: "destructive" });
      return;
    }

    const currentVariants = watchVariants || [];
    const newVariants = [...currentVariants];
    let addedCount = 0;

    finalColors.forEach(color => {
      selectedSizes.forEach(size => {
        const exists = currentVariants.some(v => v.color === color.name && v.size === size);
        if (!exists) {
          const sku = `ARK-${watchCategory.substring(0, 3).toUpperCase()}-001-${color.name.toUpperCase()}-${size}`;
          newVariants.push({
            id: crypto.randomUUID(),
            sku,
            color: color.name,
            colorHex: color.hex,
            size,
            stock: 0,
            price: null,
            isActive: true
          });
          addedCount++;
        }
      });
    });

    if (addedCount > 0) {
      replaceVariants(newVariants);
      toast({ title: `Se agregaron ${addedCount} nuevas variantes` });
    } else {
      toast({ title: "Las variantes ya existen", variant: "default" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const productId = product?.id || 'new-product';
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`El archivo ${file.name} excede los 5MB`);
        }
        
        const timestamp = Date.now();
        const storageRef = ref(storage, `products/${productId}/images/${timestamp}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        
        return {
          url,
          alt: watchName || '',
          type: imageFields.length === 0 ? 'main' : 'detail'
        };
      });

      const newImages = await Promise.all(uploadPromises);
      newImages.forEach(img => appendImage(img as any));
      toast({ title: "Imágenes subidas correctamente" });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({ title: error.message || "Error al subir imágenes", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo setear false si salimos del div completamente
    if (e.currentTarget === e.target) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Crear un evento sintético para reutilizar handleImageUpload
      const input = document.getElementById('image-upload') as HTMLInputElement;
      if (input) {
        input.files = files;
        const event = new Event('change', { bubbles: true }) as any;
        event.target = input;
        handleImageUpload(event);
      }
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async (data: ProductFormValues) => {
    setIsSaving(true);
    setShowConfirmDialog(false);
    try {
      if (product) {
        await updateProduct(product.id, data as any);
        toast({ title: "✅ Producto actualizado correctamente" });
      } else {
        const id = await createProduct(data as any);
        toast({ title: "✅ Producto creado correctamente" });
      }
      onSuccess(product?.id || 'new');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ title: "❌ Error al guardar. Intentá de nuevo.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const onError = (errors: any) => {

    // Switch to tab with errors
    if (errors.name || errors.slug || errors.description || errors.basePrice || errors.salePrice || errors.category || errors.subcategory || errors.attributes) {
      setActiveTab('general');
    } else if (errors.variants) {
      setActiveTab('variants');
    } else if (errors.images) {
      setActiveTab('images');
    } else if (errors.seo) {
      setActiveTab('seo');
    }
    toast({ title: "Corregí los errores antes de continuar", variant: "destructive" });
  };

  const discountPercentage = watchBasePrice && watchSalePrice 
    ? Math.round(((watchBasePrice - watchSalePrice) / watchBasePrice) * 100)
    : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="pb-24">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-[#E4E4E7] p-1 h-12">
          <TabsTrigger value="general" className="px-6 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">Información General</TabsTrigger>
          <TabsTrigger value="variants" className="px-6 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">Variantes y Stock</TabsTrigger>
          <TabsTrigger value="images" className="px-6 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">Imágenes</TabsTrigger>
          <TabsTrigger value="seo" className="px-6 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">SEO y Visibilidad</TabsTrigger>
        </TabsList>

        {/* TAB 1: INFORMACIÓN GENERAL */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-[#E4E4E7] shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[13px] font-semibold">Nombre del producto *</Label>
                    <Input 
                      id="name" 
                      {...register('name')} 
                      placeholder="Ej: Trench Coat Camel"
                      className={cn(errors.name && "border-red-500")}
                    />
                    {errors.name && <p className="text-[11px] text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-[13px] font-semibold">Slug (URL)</Label>
                    <div className="flex items-center">
                      <span className="h-10 px-3 flex items-center bg-[#F4F4F5] border border-r-0 border-[#E4E4E7] rounded-l-md text-[13px] text-[#71717A]">
                        arkade.com/producto/
                      </span>
                      <Input 
                        id="slug" 
                        {...register('slug')} 
                        className={cn("rounded-l-none", errors.slug && "border-red-500")}
                      />
                    </div>
                    {errors.slug && <p className="text-[11px] text-red-500">{errors.slug.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="description" className="text-[13px] font-semibold">Descripción *</Label>
                      <span className="text-[11px] text-[#71717A]">{watchDescription?.length || 0} / 500</span>
                    </div>
                    <Textarea 
                      id="description" 
                      {...register('description')} 
                      rows={4}
                      className={cn("resize-none", errors.description && "border-red-500")}
                    />
                    {errors.description && <p className="text-[11px] text-red-500">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice" className="text-[13px] font-semibold">Precio base (ARS) *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]">$</span>
                        <Input 
                          id="basePrice" 
                          type="number" 
                          {...register('basePrice', { valueAsNumber: true })} 
                          className={cn("pl-7", errors.basePrice && "border-red-500")}
                        />
                      </div>
                      {errors.basePrice && <p className="text-[11px] text-red-500">{errors.basePrice.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salePrice" className="text-[13px] font-semibold">Precio de venta (Opcional)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]">$</span>
                        <Input 
                          id="salePrice" 
                          type="number" 
                          {...register('salePrice', { 
                            valueAsNumber: true,
                            setValueAs: v => v === "" ? null : Number(v)
                          })} 
                          className={cn("pl-7", errors.salePrice && "border-red-500")}
                        />
                      </div>
                      {watchSalePrice && (
                        <p className="text-[11px] text-[#C4714A] font-medium">—{discountPercentage}% de descuento</p>
                      )}
                      {errors.salePrice && <p className="text-[11px] text-red-500">{errors.salePrice.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E4E4E7] shadow-sm">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-[14px] font-bold uppercase tracking-wider">Detalles adicionales</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collection" className="text-[13px] font-semibold">Colección *</Label>
                    <Input 
                      id="collection" 
                      {...register('attributes.collection')} 
                      placeholder="Ej: Invierno 2024" 
                      className={cn(errors.attributes?.collection && "border-red-500")}
                    />
                    {errors.attributes?.collection && <p className="text-[11px] text-red-500">{errors.attributes.collection.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material" className="text-[13px] font-semibold">Material *</Label>
                    <Input 
                      id="material" 
                      {...register('attributes.material')} 
                      placeholder="Ej: 100% Lana Merino" 
                      className={cn(errors.attributes?.material && "border-red-500")}
                    />
                    {errors.attributes?.material && <p className="text-[11px] text-red-500">{errors.attributes.material.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fit" className="text-[13px] font-semibold">Fit *</Label>
                    <Select 
                      onValueChange={(v) => v && setValue('attributes.fit', v as string)} 
                      defaultValue={watch('attributes.fit')}
                    >
                      <SelectTrigger className={cn(errors.attributes?.fit && "border-red-500")}>
                        <SelectValue placeholder="Seleccionar fit" />
                      </SelectTrigger>
                      <SelectContent>
                        {FITS.map(fit => (
                          <SelectItem key={fit} value={fit}>{fit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.attributes?.fit && <p className="text-[11px] text-red-500">{errors.attributes.fit.message}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <Card className="border-[#E4E4E7] shadow-sm">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-[14px] font-bold uppercase tracking-wider">Publicación</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive" className="text-[13px] font-medium">Estado</Label>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[11px] font-bold uppercase", watch('isActive') ? "text-[#16A34A]" : "text-[#71717A]")}>
                        {watch('isActive') ? 'Activo' : 'Inactivo'}
                      </span>
                      <Switch 
                        id="isActive" 
                        checked={watch('isActive')} 
                        onCheckedChange={(v) => setValue('isActive', v)} 
                      />
                    </div>
                  </div>
                  {product && (
                    <div className="pt-4 border-t border-[#F4F4F5] space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#71717A]">Creado:</span>
                        <span className="text-[#18181B] font-medium">15 Jun 2024</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#71717A]">Modificado:</span>
                        <span className="text-[#18181B] font-medium">hace 2h</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[#E4E4E7] shadow-sm">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-[14px] font-bold uppercase tracking-wider">Organización</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold">Categoría *</Label>
                    <Select 
                      onValueChange={(v: any) => {
                        setValue('category', v);
                        setValue('subcategory', '');
                      }} 
                      defaultValue={watch('category')}
                    >
                      <SelectTrigger className={cn(errors.category && "border-red-500")}>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mujer">Mujer</SelectItem>
                        <SelectItem value="hombre">Hombre</SelectItem>
                        <SelectItem value="accesorios">Accesorios</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-[11px] text-red-500">{errors.category.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold">Subcategoría *</Label>
                    <Select 
                      onValueChange={(v) => v && setValue('subcategory', v as string)} 
                      value={watch('subcategory')}
                      disabled={!watchCategory}
                    >
                      <SelectTrigger className={cn(errors.subcategory && "border-red-500")}>
                        <SelectValue placeholder="Seleccionar subcategoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES[watchCategory as keyof typeof CATEGORIES]?.map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subcategory && <p className="text-[11px] text-red-500">{errors.subcategory.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold">Tags</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {TAGS.map(tag => (
                        <div key={tag} className="flex items-center gap-2">
                          <Checkbox 
                            id={`tag-${tag}`} 
                            checked={watch('tags')?.includes(tag)}
                            onCheckedChange={(checked) => {
                              const current = watch('tags') || [];
                              if (checked) {
                                setValue('tags', [...current, tag]);
                              } else {
                                setValue('tags', current.filter(t => t !== tag));
                              }
                            }}
                          />
                          <Label htmlFor={`tag-${tag}`} className="text-[12px] font-normal cursor-pointer capitalize">{tag}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E4E4E7] shadow-sm">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-[14px] font-bold uppercase tracking-wider">Cuidado de la prenda</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    {careFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Input 
                          {...register(`attributes.care.${index}` as any)} 
                          className="h-8 text-[12px]"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#71717A]"
                          onClick={() => removeCare(index)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[11px] font-bold uppercase tracking-wider text-[#71717A] hover:text-[#18181B]"
                      onClick={() => appendCare('')}
                    >
                      <Plus size={14} className="mr-2" />
                      Agregar instrucción
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: VARIANTES Y STOCK */}
        <TabsContent value="variants" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-[#E4E4E7] shadow-sm">
                <CardContent className="p-6 space-y-8">
                  {/* STEP 1: COLORES */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center text-[10px] font-bold">1</div>
                      <h3 className="text-[13px] font-bold uppercase tracking-wider">Definir colores</h3>
                    </div>
                    
                    <div className="flex items-end gap-3">
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-[11px] text-[#71717A]">Nombre del color</Label>
                        <Input 
                          value={newColorName} 
                          onChange={e => setNewColorName(e.target.value)} 
                          placeholder="Ej: Camel"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-[#71717A]">Hex</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            value={newColorHex} 
                            onChange={e => setNewColorHex(e.target.value)} 
                            className="w-10 h-9 p-1 border-[#E4E4E7]"
                          />
                          <Button type="button" onClick={handleAddColor} className="h-9 bg-[#0D0D0D] text-white">
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                        <Badge 
                          key={color.name} 
                          variant="secondary" 
                          className="pl-1 pr-1.5 py-1 gap-2 bg-[#F4F4F5] border-[#E4E4E7] text-[#18181B]"
                        >
                          <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                          <span className="text-[11px] font-medium">{color.name}</span>
                          <button type="button" onClick={() => handleRemoveColor(color.name)}>
                            <X size={12} className="text-[#71717A] hover:text-[#18181B]" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* STEP 2: TALLES */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center text-[10px] font-bold">2</div>
                      <h3 className="text-[13px] font-bold uppercase tracking-wider">Definir talles</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={cn(
                            "h-10 w-12 rounded-md border text-[12px] font-bold transition-all",
                            selectedSizes.includes(size) 
                              ? "bg-[#0D0D0D] border-[#0D0D0D] text-white" 
                              : "bg-white border-[#E4E4E7] text-[#71717A] hover:border-[#0D0D0D]"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STEP 3: GENERAR */}
                  <div className="pt-6 border-t border-[#F4F4F5]">
                    <Button 
                      type="button" 
                      onClick={generateVariants}
                      className="w-full bg-[#0D0D0D] text-white h-11 uppercase tracking-widest font-bold text-[12px]"
                    >
                      Generar variantes
                    </Button>
                    {errors.variants && <p className="text-[11px] text-red-500 mt-2 text-center">{errors.variants.message}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* VARIANT TABLE */}
              {variantFields.length > 0 && (
                <Card className="border-[#E4E4E7] shadow-sm overflow-hidden">
                  <div className="p-4 bg-[#F9F9FB] border-b border-[#E4E4E7] flex justify-between items-center">
                    <h3 className="text-[12px] font-bold uppercase tracking-wider">Tabla de variantes</h3>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number" 
                        placeholder="Stock masivo" 
                        className="h-8 w-24 text-[11px]" 
                        id="bulk-stock"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[11px] font-bold uppercase"
                        onClick={() => {
                          const val = (document.getElementById('bulk-stock') as HTMLInputElement).value;
                          if (val) {
                            const stock = parseInt(val);
                            const currentVariants = watchVariants || [];
                            replaceVariants(currentVariants.map(v => ({ ...v, stock })));
                          }
                        }}
                      >
                        Aplicar a todos
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F9F9F9] border-b border-[#E4E4E7]">
                          <th className="px-4 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Color</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Talla</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">SKU</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Stock</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Precio</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Activo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variantFields.map((field, index) => (
                          <tr key={field.id} className="h-14 border-b border-[#F4F4F5] bg-white even:bg-[#F9F9F9]">
                            <td className="px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: watch(`variants.${index}.colorHex`) }} />
                                <span className="text-[12px] font-medium">{watch(`variants.${index}.color`)}</span>
                              </div>
                            </td>
                            <td className="px-4">
                              <span className="text-[12px] font-bold">{watch(`variants.${index}.size`)}</span>
                            </td>
                            <td className="px-4">
                              <Input 
                                {...register(`variants.${index}.sku`)} 
                                className={cn("h-8 text-[11px] font-mono w-40", errors.variants?.[index]?.sku && "border-red-500")}
                              />
                            </td>
                            <td className="px-4">
                              <Input 
                                type="number"
                                {...register(`variants.${index}.stock`, { valueAsNumber: true })} 
                                className={cn("h-8 text-[12px] w-20", errors.variants?.[index]?.stock && "border-red-500")}
                              />
                            </td>
                            <td className="px-4">
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  id={`inherit-${index}`}
                                  checked={watch(`variants.${index}.price`) === null}
                                  onCheckedChange={(checked) => {
                                    if (checked) setValue(`variants.${index}.price`, null);
                                    else setValue(`variants.${index}.price`, watchBasePrice);
                                  }}
                                />
                                {watch(`variants.${index}.price`) === null ? (
                                  <span className="text-[11px] text-[#71717A]">Heredar (${watchBasePrice?.toLocaleString('es-AR')})</span>
                                ) : (
                                  <Input 
                                    type="number"
                                    {...register(`variants.${index}.price`, { valueAsNumber: true })} 
                                    className={cn("h-8 text-[12px] w-24", errors.variants?.[index]?.price && "border-red-500")}
                                  />
                                )}
                              </div>
                            </td>
                            <td className="px-4">
                              <div className="flex items-center gap-2">
                                <Switch 
                                  checked={watch(`variants.${index}.isActive`)}
                                  onCheckedChange={(v) => setValue(`variants.${index}.isActive`, v)}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#71717A] hover:text-[#DC2626]"
                                  onClick={() => removeVariant(index)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-[#E4E4E7] shadow-sm">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-[14px] font-bold uppercase tracking-wider">Resumen de variantes</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#71717A]">Total variantes:</span>
                    <span className="text-[#18181B] font-bold">{watchVariants?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#71717A]">Total stock:</span>
                    <span className="text-[#18181B] font-bold">
                      {watchVariants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0} unidades
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#71717A]">Sin stock:</span>
                    <span className={cn(
                      "font-bold",
                      (watchVariants?.filter(v => v.stock === 0).length || 0) > 0 ? "text-[#DC2626]" : "text-[#16A34A]"
                    )}>
                      {watchVariants?.filter(v => v.stock === 0).length || 0} variantes
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: IMÁGENES */}
        <TabsContent value="images" className="space-y-6">
          <Card className="border-[#E4E4E7] shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg bg-[#F9F9F9] h-40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative",
                  isDragActive ? "border-[#0D0D0D] bg-[#F0F0F0]" : "border-[#E4E4E7] hover:bg-[#F4F4F5]",
                  uploading && "opacity-50 pointer-events-none"
                )}
                onClick={() => document.getElementById('image-upload')?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input 
                  id="image-upload" 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
                <UploadCloud size={48} className={cn("transition-colors", isDragActive ? "text-[#0D0D0D]" : "text-[#A1A1AA]")} />
                <div className="text-center">
                  <p className="text-[14px] font-medium text-[#18181B]">Arrastrá imágenes aquí</p>
                  <p className="text-[12px] text-[#71717A]">o hacé clic para seleccionar</p>
                </div>
                <p className="text-[11px] text-[#A1A1AA] mt-2">JPG, PNG, WebP · Máx 5MB · Hasta 10 imágenes</p>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                    <div className="w-6 h-6 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {errors.images && <p className="text-[11px] text-red-500 text-center">{errors.images.message}</p>}

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imageFields.map((field, index) => (
                  <div key={field.id} className="group relative aspect-[3/4] bg-[#F4F4F5] rounded-lg overflow-hidden border border-[#E4E4E7]">
                    <Image 
                      src={watch(`images.${index}.url`)} 
                      alt={watch(`images.${index}.alt`)} 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* OVERLAYS */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-between">
                        <div className="w-6 h-6 bg-white/20 backdrop-blur-md rounded flex items-center justify-center cursor-move">
                          <GripVertical size={14} className="text-white" />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeImage(index)}
                          className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        {watch(`images.${index}.type`) === 'main' && (
                          <Badge className="bg-[#16A34A] text-white text-[9px] uppercase tracking-wider border-none">
                            <Star size={8} className="mr-1 fill-current" />
                            Principal
                          </Badge>
                        )}
                        <Select 
                          value={watch(`images.${index}.type`)} 
                          onValueChange={(v: any) => {
                            if (v === 'main') {
                              imageFields.forEach((_, i) => setValue(`images.${i}.type`, 'detail'));
                            }
                            setValue(`images.${index}.type`, v);
                          }}
                        >
                          <SelectTrigger className="h-7 text-[10px] bg-white/90 backdrop-blur-md border-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">Principal</SelectItem>
                            <SelectItem value="model">Modelo</SelectItem>
                            <SelectItem value="detail">Detalle</SelectItem>
                            <SelectItem value="lifestyle">Lifestyle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {imageFields.length > 0 && (
                <div className="pt-6 border-t border-[#F4F4F5]">
                  <Label className="text-[13px] font-semibold mb-2 block">Texto alternativo para accesibilidad</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {imageFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-3 p-2 border border-[#E4E4E7] rounded-md">
                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <Image src={watch(`images.${index}.url`)} alt="" fill sizes="40px" className="object-cover" />
                        </div>
                        <Input 
                          {...register(`images.${index}.alt`)} 
                          placeholder="Descripción de la imagen..."
                          className="h-8 text-[12px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: SEO Y VISIBILIDAD */}
        <TabsContent value="seo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-[#E4E4E7] shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[13px] font-semibold">Meta título</Label>
                      <span className={cn(
                        "text-[11px] font-medium",
                        (watchName?.length || 0) > 58 ? "text-red-500" : (watchName?.length || 0) > 50 ? "text-amber-500" : "text-green-500"
                      )}>
                        {watchName?.length || 0} / 60
                      </span>
                    </div>
                    <Input 
                      defaultValue={`${watchName} | ARKADE`}
                      placeholder="Ej: Trench Coat Camel | ARKADE"
                    />
                    <p className="text-[11px] text-[#71717A]">Título que aparecerá en los resultados de búsqueda.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[13px] font-semibold">Meta descripción</Label>
                      <span className={cn(
                        "text-[11px] font-medium",
                        (watchDescription?.length || 0) > 155 ? "text-red-500" : (watchDescription?.length || 0) > 140 ? "text-amber-500" : "text-green-500"
                      )}>
                        {watchDescription?.length || 0} / 160
                      </span>
                    </div>
                    <Textarea 
                      defaultValue={watchDescription?.substring(0, 160)}
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-[11px] text-[#71717A]">Breve resumen para los motores de búsqueda.</p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#71717A]">Vista previa en Google</h3>
                <div className="bg-[#F8F9FA] border border-[#E4E4E7] rounded-lg p-6 space-y-1">
                  <div className="text-[12px] text-[#202124] flex items-center gap-1">
                    arkade.com <span className="text-[#5F6368]">› producto › {watchSlug}</span>
                  </div>
                  <div className="text-[20px] text-[#1A0DAB] hover:underline cursor-pointer font-medium">
                    {watchName || 'Nombre del producto'} | ARKADE
                  </div>
                  <div className="text-[14px] text-[#4D5156] line-clamp-2">
                    {watchDescription || 'Descripción del producto que aparecerá en los resultados de búsqueda de Google para atraer a los clientes.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-[#E4E4E7] shadow-sm">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-[14px] font-bold uppercase tracking-wider">Accesibilidad</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold">Alt imagen principal</Label>
                    <Input placeholder="Ej: Modelo vistiendo Trench Coat Camel en estudio" />
                    <p className="text-[11px] text-[#71717A]">Ayuda a los lectores de pantalla y mejora el SEO de imágenes.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-[240px] right-0 bg-white border-t border-[#E4E4E7] p-4 px-6 flex items-center justify-between z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isDirty ? "bg-amber-500 animate-pulse" : "bg-green-500"
          )} />
          <span className="text-[12px] text-[#71717A]">
            {product 
              ? `Última modificación: hace 5 min` 
              : "Nuevo producto — sin guardar"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            className="h-10 px-6 text-[12px] font-bold uppercase tracking-wider border-[#E4E4E7]"
            onClick={() => {
              setValue('isActive', false);
              handleSubmit(onSubmit, onError)();
            }}
            disabled={isSaving}
          >
            Guardar borrador
          </Button>
          <Button 
            type="submit" 
            className="h-10 px-8 bg-[#0D0D0D] text-white text-[12px] font-bold uppercase tracking-wider hover:bg-[#333333]"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              product ? 'Actualizar producto' : 'Publicar producto'
            )}
          </Button>
        </div>
      </div>

      {/* CONFIRMATION DIALOG */}
      <AnimatePresence>
        {showConfirmDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowConfirmDialog(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 border border-[#E4E4E7]"
            >
              <div className="p-6 border-b border-[#E4E4E7]">
                <h2 className="text-lg font-bold text-[#18181B]">Confirmar creación de producto</h2>
                <p className="text-sm text-[#71717A] mt-1">Verifica todos los datos antes de guardar</p>
              </div>

              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                <div className="bg-[#F9F9FB] p-4 rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717A]">Nombre:</span>
                    <span className="font-medium text-[#18181B]">{watchName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717A]">Categoría:</span>
                    <span className="font-medium text-[#18181B]">{watchCategory} - {watch('subcategory')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717A]">Precio base:</span>
                    <span className="font-medium text-[#18181B]">${watchBasePrice?.toLocaleString('es-AR')}</span>
                  </div>
                  {watchSalePrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#71717A]">Precio en oferta:</span>
                      <span className="font-medium text-[#C4714A]">${watchSalePrice?.toLocaleString('es-AR')} (-{discountPercentage}%)</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717A]">Variantes:</span>
                    <span className="font-medium text-[#18181B]">{watchVariants?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717A]">Imágenes:</span>
                    <span className="font-medium text-[#18181B]">{imageFields.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717A]">Es activo:</span>
                    <span className={cn("font-medium text-sm", watch('isActive') ? "text-[#16A34A]" : "text-[#71717A]")}>
                      {watch('isActive') ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#F9F9FB] border-t border-[#E4E4E7] flex gap-3 justify-end rounded-b-lg">
                <Button 
                  type="button"
                  variant="outline" 
                  className="h-10 px-6 text-sm font-bold uppercase"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="button"
                  className="h-10 px-8 bg-[#0D0D0D] text-white text-sm font-bold uppercase hover:bg-[#333333]"
                  disabled={isSaving}
                  onClick={() => {
                    const state = watch();
                    handleConfirmSave(state as ProductFormValues);
                  }}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Confirmar y guardar'
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </form>
  );
}
