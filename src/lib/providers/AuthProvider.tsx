'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/lib/firebase/config';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get ID token and set it as a cookie for the middleware
        const token = await user.getIdToken();
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
      } else {
        // Remove cookie if user is not authenticated
        document.cookie = `firebase-token=; path=/; max-age=0; SameSite=Lax; Secure`;
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
