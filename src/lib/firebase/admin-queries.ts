import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  orderBy, 
  limit, 
  Timestamp,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc,
  startAt,
  endAt,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './config';
import { Product } from '@/src/types/product';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  total: number;
  status: OrderStatus;
  createdAt: any;
  updatedAt: any;
  shippingAddress: any;
  paymentMethod: string;
  trackingNumber?: string;
}

export interface DashboardStats {
  monthlySales: number;
  monthlyOrders: number;
  pendingOrders: number;
  activeProducts: number;
  lowStockProducts: number;
  newCustomers: number;
  salesByDay: { date: string; revenue: number }[];
  salesByCategory: { category: string; count: number }[];
}

export interface OrderFilters {
  status?: OrderStatus;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Monthly Sales & Orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', firstDayOfMonth),
      where('status', '!=', 'cancelled')
    );
    const ordersSnap = await getDocs(ordersQuery);
    
    let monthlySales = 0;
    let monthlyOrders = ordersSnap.size;
    
    ordersSnap.forEach(doc => {
      monthlySales += doc.data().total || 0;
    });

    // Pending Orders
    const pendingQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'pending')
    );
    const pendingSnap = await getDocs(pendingQuery);
    const pendingOrders = pendingSnap.size;

    // Active Products
    const activeProductsQuery = query(
      collection(db, 'products'),
      where('isActive', '==', true)
    );
    const activeProductsSnap = await getDocs(activeProductsQuery);
    const activeProducts = activeProductsSnap.size;

    // Low Stock Products
    let lowStockProducts = 0;
    activeProductsSnap.forEach(doc => {
      const product = doc.data() as Product;
      const hasLowStock = product.variants?.some(v => v.stock < 5);
      if (hasLowStock) lowStockProducts++;
    });

    // New Customers
    const customersQuery = query(
      collection(db, 'users'),
      where('createdAt', '>=', firstDayOfMonth),
      where('role', '==', 'customer')
    );
    const customersSnap = await getDocs(customersQuery);
    const newCustomers = customersSnap.size;

    // Sales by Day (Mock for now, would be grouped from orders)
    const salesByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
        revenue: Math.floor(Math.random() * 50000) + 10000
      };
    });

    // Sales by Category
    const salesByCategory = [
      { category: 'Mujer', count: 45 },
      { category: 'Hombre', count: 35 },
      { category: 'Accesorios', count: 20 }
    ];

    return {
      monthlySales,
      monthlyOrders,
      pendingOrders,
      activeProducts,
      lowStockProducts,
      newCustomers,
      salesByDay,
      salesByCategory
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

// Orders
export async function getOrders(filters?: OrderFilters): Promise<Order[]> {
  try {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const snap = await getDoc(doc(db, 'orders', id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export async function updateOrderStatus(
  id: string, 
  status: OrderStatus,
  trackingNumber?: string
): Promise<void> {
  try {
    const data: any = { status, updatedAt: Timestamp.now() };
    if (trackingNumber) data.trackingNumber = trackingNumber;
    await updateDoc(doc(db, 'orders', id), data);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Products
export async function getAllProducts(filters?: {
  category?: string;
  status?: 'active' | 'inactive';
  lowStock?: boolean;
  search?: string;
}): Promise<Product[]> {
  try {
    let q = query(collection(db, 'products'), orderBy('name', 'asc'));
    
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters?.status) {
      q = query(q, where('isActive', '==', filters.status === 'active'));
    }
    
    const snap = await getDocs(q);
    let products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    if (filters?.lowStock) {
      products = products.filter(p => p.variants?.some(v => v.stock < 5));
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.sku.toLowerCase().includes(search)
      );
    }
    
    return products;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(
  id: string, 
  data: Partial<Product>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'products', id), {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Customers
export async function getCustomers(): Promise<any[]> {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'customer'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

export async function getCustomerById(uid: string): Promise<any | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? ({ id: snap.id, ...snap.data() }) : null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

// Store Config
export interface StoreConfig {
  name: string;
  email: string;
  phone: string;
  currency: string;
  logo?: string;
  favicon?: string;
  freeShippingThreshold: number;
  shippingZones: {
    id: string;
    name: string;
    time: string;
    cost: number;
  }[];
  paymentMethods: {
    id: string;
    name: string;
    isActive: boolean;
    installments?: number[];
  }[];
  announcementBar: {
    isActive: boolean;
    messages: string[];
    backgroundColor: string;
    textColor: string;
  };
}

export async function getStoreConfig(): Promise<StoreConfig | null> {
  try {
    const snap = await getDoc(doc(db, 'config', 'store'));
    return snap.exists() ? (snap.data() as StoreConfig) : null;
  } catch (error) {
    console.error('Error fetching store config:', error);
    return null;
  }
}

export async function updateStoreConfig(data: Partial<StoreConfig>): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'store'), data, { merge: true });
  } catch (error) {
    console.error('Error updating store config:', error);
    throw error;
  }
}
export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  isActive: boolean;
  expiryDate?: any;
  createdAt: any;
}

export async function getDiscounts(): Promise<Discount[]> {
  try {
    const q = query(collection(db, 'discounts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discount));
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }
}

export async function createDiscount(
  data: Omit<Discount, 'id'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'discounts'), {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating discount:', error);
    throw error;
  }
}

export async function toggleDiscount(
  id: string, 
  active: boolean
): Promise<void> {
  try {
    await updateDoc(doc(db, 'discounts', id), { isActive: active });
  } catch (error) {
    console.error('Error toggling discount:', error);
    throw error;
  }
}
