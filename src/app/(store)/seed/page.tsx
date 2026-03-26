'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/src/lib/firebase/config';
import { seedProducts, seedAccessories } from '@/src/lib/firebase/seed-products';
import { onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';

export default function SeedPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSeed = async () => {
    if (!user) {
      setStatus('error');
      setMessage('Debes iniciar sesión para ejecutar el seed.');
      return;
    }

    setStatus('loading');
    setMessage('Seeding database...');
    
    try {
      await seedProducts(db);
      setStatus('success');
      setMessage('✅ 20 products added successfully');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'An error occurred during seeding');
      if (error.message?.includes('Missing or insufficient permissions')) {
        setMessage('Error de permisos. Asegúrate de iniciar sesión con una cuenta de administrador (como bra.rey.esteban@gmail.com o AdminArkane@gmail.com) y que el email esté verificado, o que tu usuario tenga el rol "admin".');
      }
    }
  };

  const handleSeedAccessories = async () => {
    if (!user) {
      setStatus('error');
      setMessage('Debes iniciar sesión para ejecutar el seed.');
      return;
    }

    setStatus('loading');
    setMessage('Seeding accessories...');
    
    try {
      await seedAccessories(db);
      setStatus('success');
      setMessage('✅ 20 accessories added successfully');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'An error occurred during seeding accessories');
      if (error.message?.includes('Missing or insufficient permissions')) {
        setMessage('Error de permisos. Asegúrate de iniciar sesión con una cuenta de administrador (como bra.rey.esteban@gmail.com o AdminArkane@gmail.com) y que el email esté verificado, o que tu usuario tenga el rol "admin".');
      }
    }
  };

  if (authChecking) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Seed Database</h1>
        <p className="text-gray-500 mb-6">This will add products to Firestore</p>
        
        {!user ? (
          <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200">
            <p className="mb-3">No has iniciado sesión. Necesitas ser administrador para poblar la base de datos.</p>
            <Link href="/cuenta/login" className="underline font-medium">
              Ir a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <div className="mb-6 text-sm text-gray-600">
            Conectado como: <span className="font-medium text-black">{user.email}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleSeed}
            disabled={status === 'loading' || !user}
            className="w-full bg-black text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Seeding...' : 'RUN SEED (Initial 20)'}
          </button>

          <button
            onClick={handleSeedAccessories}
            disabled={status === 'loading' || !user}
            className="w-full bg-white text-black border border-black font-medium py-3 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Seeding...' : 'RUN SEED (20 Accessories)'}
          </button>
        </div>
        
        {message && (
          <div className={`mt-6 p-4 rounded-lg text-sm ${
            status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message}
          </div>
        )}
        
        <p className="mt-8 text-xs text-gray-400">
          Note: Delete this page after seeding
        </p>
      </div>
    </div>
  );
}
