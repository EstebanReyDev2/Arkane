import { getProductBySlug } from '@/src/lib/firebase/products';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/src/components/product/ProductDetailClient';
import { Metadata } from 'next';
import Link from 'next/link';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: 'Producto no encontrado | ARKADE',
    };
  }

  return {
    title: `${product.name} | ARKADE`,
    description: product.description,
    openGraph: {
      title: `${product.name} | ARKADE`,
      description: product.description,
      images: [product.images[0].url],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center space-y-8">
        <h1 className="text-4xl font-display uppercase tracking-widest text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
          Producto no encontrado
        </h1>
        <p className="text-sm font-body text-[#8C8680] max-w-md">
          Lo sentimos, el producto que estás buscando no existe o ha sido retirado de nuestro catálogo.
        </p>
        <Link 
          href="/mujer" 
          className="bg-[#0D0D0D] text-white px-12 py-4 text-xs font-label uppercase tracking-widest hover:opacity-90 transition-opacity rounded-[2px]"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
