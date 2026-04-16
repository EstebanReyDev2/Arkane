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

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface StatusHistoryEntry {
  status: OrderStatus;
  changedAt: any;
  changedBy?: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: any[];
  total: number;
  discount?: number;
  shippingCost?: number;
  status: OrderStatus;
  statusHistory?: StatusHistoryEntry[];
  createdAt: any;
  updatedAt: any;
  shippingAddress: any;
  paymentMethod: string;
  trackingNumber?: string;
  notes?: {
    customer?: string;
    internal?: string;
  };
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
  salesPercentageChange: number;
  lastMonthSales: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku?: string;
  image?: string;
  stock: number;
  variants: {
    id: string;
    color: string;
    size: string;
    stock: number;
  }[];
}

export interface ActivityEvent {
  id: string;
  type: 'order' | 'user' | 'stock' | 'product';
  text: string;
  time: string;
  timestamp: number;
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
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Current month boundaries
    const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Previous month boundaries
    const firstDayOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfPreviousMonth = new Date(currentYear, currentMonth, 0);
    
    // Current Month Sales & Orders
    const currentMonthOrdersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(firstDayOfCurrentMonth)),
      where('createdAt', '<=', Timestamp.fromDate(lastDayOfCurrentMonth)),
      where('status', '!=', 'cancelled')
    );
    const currentMonthOrdersSnap = await getDocs(currentMonthOrdersQuery);
    
    let monthlySales = 0;
    let monthlyOrders = currentMonthOrdersSnap.size;
    const salesByDayMap: { [key: string]: number } = {};
    const salesByCategoryMap: { [key: string]: number } = {};
    const ordersData: any[] = [];
    
    // Process current month orders
    currentMonthOrdersSnap.forEach(doc => {
      const order = doc.data();
      monthlySales += order.total || 0;
      ordersData.push(order);
      
      // Group by day
      const orderDate = order.createdAt?.toDate?.() || new Date();
      const dayKey = orderDate.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
      salesByDayMap[dayKey] = (salesByDayMap[dayKey] || 0) + (order.total || 0);
      
      // Group by category
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const category = item.category || 'Otros';
          salesByCategoryMap[category] = (salesByCategoryMap[category] || 0) + 1;
        });
      }
    });

    // Previous month sales for comparison
    const previousMonthOrdersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(firstDayOfPreviousMonth)),
      where('createdAt', '<=', Timestamp.fromDate(lastDayOfPreviousMonth)),
      where('status', '!=', 'cancelled')
    );
    const previousMonthOrdersSnap = await getDocs(previousMonthOrdersQuery);
    
    let lastMonthSales = 0;
    previousMonthOrdersSnap.forEach(doc => {
      lastMonthSales += doc.data().total || 0;
    });
    
    // Calculate percentage change
    const salesPercentageChange = lastMonthSales > 0 
      ? Math.round(((monthlySales - lastMonthSales) / lastMonthSales) * 100)
      : monthlySales > 0 ? 100 : 0;

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
      where('createdAt', '>=', Timestamp.fromDate(firstDayOfCurrentMonth)),
      where('role', '==', 'customer')
    );
    const customersSnap = await getDocs(customersQuery);
    const newCustomers = customersSnap.size;

    // Format salesByDay for last 30 days
    const salesByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dayKey = date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
      return {
        date: dayKey,
        revenue: salesByDayMap[dayKey] || 0
      };
    });

    // Format salesByCategory
    const salesByCategory = Object.entries(salesByCategoryMap).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count: count as number
    })).sort((a, b) => b.count - a.count);

    // If no category data, add defaults to avoid empty chart
    if (salesByCategory.length === 0) {
      salesByCategory.push(
        { category: 'Mujer', count: 0 },
        { category: 'Hombre', count: 0 },
        { category: 'Accesorios', count: 0 }
      );
    }

    return {
      monthlySales,
      monthlyOrders,
      pendingOrders,
      activeProducts,
      lowStockProducts,
      newCustomers,
      salesByDay,
      salesByCategory,
      salesPercentageChange,
      lastMonthSales
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

export async function updateOrderNotes(
  id: string, 
  notes: { internal?: string; customer?: string }
): Promise<void> {
  try {
    const data: any = { 
      notes: { ...notes },
      updatedAt: Timestamp.now() 
    };
    await updateDoc(doc(db, 'orders', id), data);
  } catch (error) {
    console.error('Error updating order notes:', error);
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

export async function getLowStockProducts(threshold: number = 5): Promise<LowStockProduct[]> {
  try {
    const productsQuery = query(
      collection(db, 'products'),
      where('isActive', '==', true)
    );
    const productsSnap = await getDocs(productsQuery);
    const lowStockProducts: LowStockProduct[] = [];

    productsSnap.forEach(doc => {
      const product = doc.data() as Product;
      
      if (product.variants && Array.isArray(product.variants)) {
        // Find variants with low stock
        const lowStockVariants = product.variants.filter(v => v.stock < threshold);
        
        if (lowStockVariants.length > 0) {
          // Calculate total stock
          const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          
          lowStockProducts.push({
            id: doc.id,
            name: product.name,
            sku: product.sku || `ARK-${doc.id.slice(0, 4).toUpperCase()}`,
            image: product.images?.[0]?.url || '',
            stock: totalStock,
            variants: lowStockVariants.map(v => ({
              id: v.id,
              color: v.color,
              size: v.size,
              stock: v.stock
            }))
          });
        }
      }
    });

    // Sort by total stock (ascending) - most critical first
    return lowStockProducts.sort((a, b) => a.stock - b.stock);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
}

export async function getRecentActivity(hours: number = 24): Promise<ActivityEvent[]> {
  try {
    const events: ActivityEvent[] = [];
    const now = new Date();
    const timeThreshold = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // 1. Recent Orders
    const recentOrdersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(timeThreshold)),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const recentOrdersSnap = await getDocs(recentOrdersQuery);
    
    recentOrdersSnap.forEach(doc => {
      const order = doc.data();
      const orderDate = order.createdAt?.toDate?.() || new Date();
      const timeAgo = getTimeAgo(orderDate);
      
      events.push({
        id: `order-${doc.id}`,
        type: 'order',
        text: `Nuevo pedido #ARK-${doc.id.slice(0, 4).toUpperCase()} de ${order.customerName || 'Cliente'}`,
        time: timeAgo,
        timestamp: orderDate.getTime()
      });
    });

    // 2. Recent New Customers
    const newCustomersQuery = query(
      collection(db, 'users'),
      where('createdAt', '>=', Timestamp.fromDate(timeThreshold)),
      where('role', '==', 'customer'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const newCustomersSnap = await getDocs(newCustomersQuery);
    
    newCustomersSnap.forEach(doc => {
      const user = doc.data();
      const userDate = user.createdAt?.toDate?.() || new Date();
      const timeAgo = getTimeAgo(userDate);
      
      const name = user.firstName || user.email?.split('@')[0] || 'Usuario';
      events.push({
        id: `user-${doc.id}`,
        type: 'user',
        text: `Nuevo cliente registrado: ${name}`,
        time: timeAgo,
        timestamp: userDate.getTime()
      });
    });

    // 3. Low Stock Alerts
    const lowStockItems = await getLowStockProducts(5);
    lowStockItems.slice(0, 5).forEach(item => {
      events.push({
        id: `stock-${item.id}`,
        type: 'stock',
        text: `Stock bajo: ${item.name} (${item.stock} unidades)`,
        time: 'ahora',
        timestamp: now.getTime()
      });
    });

    // 4. Order Status Updates (shipped/delivered in last 24h)
    const updatedOrdersQuery = query(
      collection(db, 'orders'),
      where('updatedAt', '>=', Timestamp.fromDate(timeThreshold)),
      where('status', 'in', ['shipped', 'delivered']),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );
    const updatedOrdersSnap = await getDocs(updatedOrdersQuery);
    
    updatedOrdersSnap.forEach(doc => {
      const order = doc.data();
      const updateDate = order.updatedAt?.toDate?.() || new Date();
      const timeAgo = getTimeAgo(updateDate);
      
      const statusText = order.status === 'shipped' ? 'enviado' : 'entregado';
      events.push({
        id: `status-${doc.id}`,
        type: 'order',
        text: `Pedido #ARK-${doc.id.slice(0, 4).toUpperCase()} marcado como ${statusText}`,
        time: timeAgo,
        timestamp: updateDate.getTime()
      });
    });

    // Sort by timestamp (most recent first)
    return events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8); // Return top 8 events
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

// Helper function to format time difference
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'hace unos segundos';
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  
  return date.toLocaleDateString('es-AR');
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
