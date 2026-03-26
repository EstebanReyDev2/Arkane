import { useState, useEffect } from 'react';
import { useAuthState, getUserData, updateUserProfile } from './auth';

export function useWishlist() {
  const { user } = useAuthState();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        setLoading(false);
        return;
      }
      
      try {
        const data = await getUserData(user.uid);
        if (data && data.wishlist) {
          setWishlist(data.wishlist);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const addToWishlist = async (productId: string) => {
    if (!user) return false;
    
    try {
      const newWishlist = [...wishlist, productId];
      await updateUserProfile(user.uid, { wishlist: newWishlist });
      setWishlist(newWishlist);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return false;
    
    try {
      const newWishlist = wishlist.filter(id => id !== productId);
      await updateUserProfile(user.uid, { wishlist: newWishlist });
      setWishlist(newWishlist);
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };
}
