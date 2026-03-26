import { collection, getDocs, query, where, limit, QueryConstraint, getDocFromServer, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './config';
import { Product } from '@/src/types/product';
import { useQuery } from '@tanstack/react-query';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  isSale?: boolean;
  tags?: string[];
}

function serializeFirestoreData(data: any): any {
  if (!data) return data;
  
  const serialized = { ...data };
  
  for (const key in serialized) {
    const value = serialized[key];
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      // It's a Firestore Timestamp
      serialized[key] = new Date(value.seconds * 1000).toISOString();
    } else if (Array.isArray(value)) {
      serialized[key] = value.map(item => (item && typeof item === 'object') ? serializeFirestoreData(item) : item);
    } else if (value && typeof value === 'object') {
      serialized[key] = serializeFirestoreData(value);
    }
  }
  
  return serialized;
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  const path = 'products';
  try {
    const constraints: QueryConstraint[] = [where('isActive', '==', true)];

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters?.subcategory) {
      constraints.push(where('subcategory', '==', filters.subcategory));
    }
    if (filters?.isSale) {
      constraints.push(where('salePrice', '!=', null));
    }
    if (filters?.tags && filters.tags.length > 0) {
      constraints.push(where('tags', 'array-contains-any', filters.tags));
    }

    const q = query(collection(db, 'products'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const path = 'products';
  try {
    const q = query(
      collection(db, 'products'), 
      where('slug', '==', slug), 
      where('isActive', '==', true),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return serializeFirestoreData({ id: doc.id, ...doc.data() }) as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const path = 'products';
  try {
    const q = query(
      collection(db, 'products'), 
      where('category', '==', category),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function getSaleProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const q = query(
      collection(db, 'products'), 
      where('salePrice', '!=', null),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function getFeaturedProducts(limitCount: number): Promise<Product[]> {
  const path = 'products';
  try {
    const q = query(
      collection(db, 'products'), 
      where('tags', 'array-contains', 'featured'), 
      where('isActive', '==', true),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const path = 'products';
  try {
    const docRef = doc(db, 'products', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return serializeFirestoreData({ id: snapshot.id, ...snapshot.data() }) as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Hooks
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: () => getProductsByCategory(category),
    enabled: !!category,
  });
}
