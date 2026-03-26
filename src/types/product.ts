export interface ProductImage {
  url: string;
  alt: string;
  type: 'main' | 'detail' | 'model' | 'lifestyle';
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  price: number | null;
}

export interface ProductAttributes {
  material: string;
  care: string[];
  fit: string;
  collection: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  salePrice: number | null;
  salePercentage: number | null;
  category: 'mujer' | 'hombre' | 'accesorios';
  subcategory: string;
  vertical: 'fashion';
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttributes;
  tags: string[];
  isActive: boolean;
  createdAt: any; // Timestamp from Firebase
  updatedAt: any; // Timestamp from Firebase
}
