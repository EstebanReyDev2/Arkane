'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, HeartOff } from 'lucide-react';
import { useWishlist } from '@/src/lib/firebase/useWishlist';
import { db } from '@/src/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { AccountLayout } from '@/src/components/account/AccountLayout';

export default function WishlistPage() {
  const { wishlist, loading: wishlistLoading, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistLoading) return;
      
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const productPromises = wishlist.map(id => getDoc(doc(db, 'products', id)));
        const productDocs = await Promise.all(productPromises);
        
        const fetchedProducts = productDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }));
          
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist, wishlistLoading]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
    setProducts(products.filter(p => p.id !== productId));
  };

  return (
    <AccountLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-display text-[#0D0D0D] mb-2">Mi Wishlist</h2>
          <p className="text-sm text-[#8C8680] font-body">
            Productos que guardaste para comprar más tarde.
          </p>
        </div>

        {loading || wishlistLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#E8E4E0] border-t-[#0D0D0D] rounded-full animate-spin"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {products.map((product) => (
              <div key={product.id} className="group relative flex flex-col">
                <div className="relative aspect-[3/4] bg-[#F2EDE8] overflow-hidden mb-4">
                  <Image
                    src={product.images?.[0] || 'https://picsum.photos/seed/product/400/600'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#0D0D0D] hover:bg-white transition-colors z-10"
                    aria-label="Eliminar de wishlist"
                  >
                    <HeartOff size={18} strokeWidth={1.5} />
                  </button>
                  {product.isNew && (
                    <div className="absolute top-4 left-4 bg-[#0D0D0D] text-white text-[10px] font-label uppercase tracking-widest px-3 py-1">
                      Nuevo
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col flex-grow">
                  <Link href={`/producto/${product.id}`} className="block">
                    <h3 className="text-sm font-medium text-[#0D0D0D] font-body mb-1 hover:underline">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-[#8C8680] font-body mb-3">{product.category}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-base font-medium text-[#0D0D0D] font-body">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[#E8E4E0] rounded-[2px] p-12 text-center flex flex-col items-center justify-center">
            <Heart size={48} className="text-[#C8C2BC] mb-6" strokeWidth={1} />
            <p className="text-[#8C8680] font-body mb-8 text-lg">No guardaste ningún producto todavía</p>
            <Link href="/novedades" className="border border-[#0D0D0D] text-[#0D0D0D] px-8 py-4 text-xs font-label uppercase tracking-widest hover:bg-[#0D0D0D] hover:text-white transition-colors">
              Explorar novedades
            </Link>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
