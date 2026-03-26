import { collection, doc, setDoc, Firestore } from 'firebase/firestore';
import { Product } from '@/src/types/product';

export async function seedProducts(db: Firestore) {
  const products: Omit<Product, 'id'>[] = [
    // 4 Mujer
    {
      sku: 'MW-001',
      name: 'Abrigo de Lana Estructurado',
      slug: 'abrigo-lana-estructurado',
      description: 'Abrigo largo de lana virgen con silueta minimalista y hombros estructurados.',
      basePrice: 320000,
      salePrice: null,
      salePercentage: null,
      category: 'mujer',
      subcategory: 'abrigos',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/abrigo-lana-estructurado/800/1067', alt: 'Abrigo frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/abrigo-lana-estructurado-2/800/1067', alt: 'Abrigo detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v1', sku: 'MW-001-S', color: 'Negro', colorHex: '#000000', size: 'S', stock: 5, price: null },
        { id: 'v2', sku: 'MW-001-M', color: 'Negro', colorHex: '#000000', size: 'M', stock: 8, price: null },
        { id: 'v3', sku: 'MW-001-L', color: 'Negro', colorHex: '#000000', size: 'L', stock: 3, price: null }
      ],
      attributes: { material: '100% Lana Virgen', care: ['Limpieza en seco'], fit: 'Oversize', collection: 'Otoño/Invierno' },
      tags: ['new', 'featured'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sku: 'MW-002',
      name: 'Vestido Midi de Seda',
      slug: 'vestido-midi-seda',
      description: 'Vestido lencero de seda pura con escote fluido y caída elegante.',
      basePrice: 185000,
      salePrice: 148000,
      salePercentage: 20,
      category: 'mujer',
      subcategory: 'vestidos',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/vestido-midi-seda/800/1067', alt: 'Vestido frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/vestido-midi-seda-2/800/1067', alt: 'Vestido detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v4', sku: 'MW-002-S', color: 'Arena', colorHex: '#F2EDE8', size: 'S', stock: 2, price: null },
        { id: 'v5', sku: 'MW-002-M', color: 'Arena', colorHex: '#F2EDE8', size: 'M', stock: 5, price: null },
        { id: 'v6', sku: 'MW-002-L', color: 'Arena', colorHex: '#F2EDE8', size: 'L', stock: 1, price: null }
      ],
      attributes: { material: '100% Seda', care: ['Lavar a mano en frío'], fit: 'Regular', collection: 'Esenciales' },
      tags: ['sale', 'bestseller'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sku: 'MW-003',
      name: 'Blazer Sastre Oversize',
      slug: 'blazer-sastre-oversize',
      description: 'Blazer de corte masculino con hombreras marcadas y tejido de mezcla de lana.',
      basePrice: 210000,
      salePrice: null,
      salePercentage: null,
      category: 'mujer',
      subcategory: 'sastrería',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/blazer-sastre-oversize/800/1067', alt: 'Blazer frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/blazer-sastre-oversize-2/800/1067', alt: 'Blazer detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v7', sku: 'MW-003-S', color: 'Gris', colorHex: '#8C8680', size: 'S', stock: 4, price: null },
        { id: 'v8', sku: 'MW-003-M', color: 'Gris', colorHex: '#8C8680', size: 'M', stock: 6, price: null },
        { id: 'v9', sku: 'MW-003-L', color: 'Gris', colorHex: '#8C8680', size: 'L', stock: 4, price: null }
      ],
      attributes: { material: '70% Lana, 30% Poliéster', care: ['Limpieza en seco'], fit: 'Oversize', collection: 'Otoño/Invierno' },
      tags: ['featured'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sku: 'MW-004',
      name: 'Jersey de Punto Grueso',
      slug: 'jersey-punto-grueso',
      description: 'Jersey de cuello alto tejido en mezcla de alpaca y lana merino.',
      basePrice: 145000,
      salePrice: null,
      salePercentage: null,
      category: 'mujer',
      subcategory: 'punto',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/jersey-punto-grueso/800/1067', alt: 'Jersey frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/jersey-punto-grueso-2/800/1067', alt: 'Jersey detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v10', sku: 'MW-004-S', color: 'Crema', colorHex: '#FAFAFA', size: 'S', stock: 10, price: null },
        { id: 'v11', sku: 'MW-004-M', color: 'Crema', colorHex: '#FAFAFA', size: 'M', stock: 12, price: null },
        { id: 'v12', sku: 'MW-004-L', color: 'Crema', colorHex: '#FAFAFA', size: 'L', stock: 8, price: null }
      ],
      attributes: { material: '50% Alpaca, 50% Merino', care: ['Lavar a mano'], fit: 'Relaxed', collection: 'Esenciales' },
      tags: ['bestseller'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // 4 Hombre
    {
      sku: 'MH-001',
      name: 'Pantalón de Pinzas Recto',
      slug: 'pantalon-pinzas-recto',
      description: 'Pantalón de traje con pliegues frontales y corte recto fluido.',
      basePrice: 160000,
      salePrice: null,
      salePercentage: null,
      category: 'hombre',
      subcategory: 'pantalones',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/pantalon-pinzas-recto/800/1067', alt: 'Pantalón frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/pantalon-pinzas-recto-2/800/1067', alt: 'Pantalón detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v13', sku: 'MH-001-40', color: 'Negro', colorHex: '#000000', size: '40', stock: 5, price: null },
        { id: 'v14', sku: 'MH-001-42', color: 'Negro', colorHex: '#000000', size: '42', stock: 8, price: null },
        { id: 'v15', sku: 'MH-001-44', color: 'Negro', colorHex: '#000000', size: '44', stock: 6, price: null }
      ],
      attributes: { material: '100% Lana', care: ['Limpieza en seco'], fit: 'Recto', collection: 'Sastrería' },
      tags: ['new', 'featured'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sku: 'MH-002',
      name: 'Camisa de Popelín Clásica',
      slug: 'camisa-popelin-clasica',
      description: 'Camisa de algodón de fibras largas con cuello estructurado.',
      basePrice: 95000,
      salePrice: 76000,
      salePercentage: 20,
      category: 'hombre',
      subcategory: 'camisas',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/camisa-popelin-clasica/800/1067', alt: 'Camisa frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/camisa-popelin-clasica-2/800/1067', alt: 'Camisa detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v16', sku: 'MH-002-S', color: 'Blanco', colorHex: '#FAFAFA', size: 'S', stock: 15, price: null },
        { id: 'v17', sku: 'MH-002-M', color: 'Blanco', colorHex: '#FAFAFA', size: 'M', stock: 20, price: null },
        { id: 'v18', sku: 'MH-002-L', color: 'Blanco', colorHex: '#FAFAFA', size: 'L', stock: 12, price: null }
      ],
      attributes: { material: '100% Algodón', care: ['Lavar a máquina 30º'], fit: 'Regular', collection: 'Esenciales' },
      tags: ['sale', 'bestseller'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sku: 'MH-003',
      name: 'Chaqueta Bomber Minimalista',
      slug: 'chaqueta-bomber-minimalista',
      description: 'Bomber técnica con acabado mate y detalles ocultos.',
      basePrice: 245000,
      salePrice: null,
      salePercentage: null,
      category: 'hombre',
      subcategory: 'abrigos',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/chaqueta-bomber-minimalista/800/1067', alt: 'Bomber frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/chaqueta-bomber-minimalista-2/800/1067', alt: 'Bomber detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v19', sku: 'MH-003-S', color: 'Azul Polvo', colorHex: '#6B8FA3', size: 'S', stock: 3, price: null },
        { id: 'v20', sku: 'MH-003-M', color: 'Azul Polvo', colorHex: '#6B8FA3', size: 'M', stock: 5, price: null },
        { id: 'v21', sku: 'MH-003-L', color: 'Azul Polvo', colorHex: '#6B8FA3', size: 'L', stock: 2, price: null }
      ],
      attributes: { material: '100% Nylon', care: ['Lavar a máquina en frío'], fit: 'Regular', collection: 'Otoño/Invierno' },
      tags: ['new'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sku: 'MH-004',
      name: 'Traje de Dos Piezas',
      slug: 'traje-dos-piezas',
      description: 'Conjunto de sastrería moderna con silueta afilada.',
      basePrice: 425000,
      salePrice: null,
      salePercentage: null,
      category: 'hombre',
      subcategory: 'sastrería',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/traje-dos-piezas/800/1067', alt: 'Traje frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/traje-dos-piezas-2/800/1067', alt: 'Traje detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v22', sku: 'MH-004-48', color: 'Gris Oscuro', colorHex: '#333333', size: '48', stock: 2, price: null },
        { id: 'v23', sku: 'MH-004-50', color: 'Gris Oscuro', colorHex: '#333333', size: '50', stock: 4, price: null },
        { id: 'v24', sku: 'MH-004-52', color: 'Gris Oscuro', colorHex: '#333333', size: '52', stock: 3, price: null }
      ],
      attributes: { material: '100% Lana Fría', care: ['Limpieza en seco'], fit: 'Slim', collection: 'Sastrería' },
      tags: ['featured'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // 4 Accesorios
    {
      sku: 'MA-001',
      name: 'Bolso Tote de Cuero',
      slug: 'bolso-tote-cuero',
      description: 'Tote bag espacioso en cuero de grano entero con asas estructuradas.',
      basePrice: 280000,
      salePrice: null,
      salePercentage: null,
      category: 'accesorios',
      subcategory: 'bolsos',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/bolso-tote-cuero/800/1067', alt: 'Bolso frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/bolso-tote-cuero-2/800/1067', alt: 'Bolso detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v25', sku: 'MA-001-U', color: 'Arcilla', colorHex: '#C4714A', size: 'Única', stock: 8, price: null },
        { id: 'v26', sku: 'MA-001-U-BLK', color: 'Negro', colorHex: '#000000', size: 'Única', stock: 5, price: null },
        { id: 'v27', sku: 'MA-001-U-SND', color: 'Arena', colorHex: '#F2EDE8', size: 'Única', stock: 3, price: null }
      ],
      attributes: { material: '100% Cuero Vacuno', care: ['Limpiar con paño seco'], fit: 'N/A', collection: 'Accesorios' },
      tags: ['bestseller', 'featured'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sku: 'MA-002',
      name: 'Cinturón Minimalista',
      slug: 'cinturon-minimalista',
      description: 'Cinturón de cuero liso con hebilla geométrica en acabado mate.',
      basePrice: 65000,
      salePrice: 52000,
      salePercentage: 20,
      category: 'accesorios',
      subcategory: 'cinturones',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/cinturon-minimalista/800/1067', alt: 'Cinturón frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/cinturon-minimalista-2/800/1067', alt: 'Cinturón detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v28', sku: 'MA-002-85', color: 'Negro', colorHex: '#000000', size: '85', stock: 10, price: null },
        { id: 'v29', sku: 'MA-002-90', color: 'Negro', colorHex: '#000000', size: '90', stock: 12, price: null },
        { id: 'v30', sku: 'MA-002-95', color: 'Negro', colorHex: '#000000', size: '95', stock: 8, price: null }
      ],
      attributes: { material: '100% Cuero', care: ['Limpiar con paño seco'], fit: 'N/A', collection: 'Esenciales' },
      tags: ['sale'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sku: 'MA-003',
      name: 'Gafas de Sol Geométricas',
      slug: 'gafas-sol-geometricas',
      description: 'Gafas de sol con montura de acetato grueso y lentes con protección UV.',
      basePrice: 120000,
      salePrice: null,
      salePercentage: null,
      category: 'accesorios',
      subcategory: 'gafas',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/gafas-sol-geometricas/800/1067', alt: 'Gafas frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/gafas-sol-geometricas-2/800/1067', alt: 'Gafas detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v31', sku: 'MA-003-U', color: 'Carey', colorHex: '#5C4033', size: 'Única', stock: 15, price: null },
        { id: 'v32', sku: 'MA-003-U-BLK', color: 'Negro', colorHex: '#000000', size: 'Única', stock: 10, price: null },
        { id: 'v33', sku: 'MA-003-U-SGE', color: 'Salvia', colorHex: '#7A9E87', size: 'Única', stock: 5, price: null }
      ],
      attributes: { material: '100% Acetato', care: ['Limpiar con paño de microfibra'], fit: 'N/A', collection: 'Accesorios' },
      tags: ['new'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sku: 'MA-004',
      name: 'Bufanda de Cashmere',
      slug: 'bufanda-cashmere',
      description: 'Bufanda extra larga tejida en cashmere puro y ultra suave.',
      basePrice: 155000,
      salePrice: null,
      salePercentage: null,
      category: 'accesorios',
      subcategory: 'bufandas',
      vertical: 'fashion',
      images: [
        { url: 'https://picsum.photos/seed/bufanda-cashmere/800/1067', alt: 'Bufanda frontal', type: 'main' },
        { url: 'https://picsum.photos/seed/bufanda-cashmere-2/800/1067', alt: 'Bufanda detalle', type: 'detail' }
      ],
      variants: [
        { id: 'v34', sku: 'MA-004-U', color: 'Gris Cálido', colorHex: '#8C8680', size: 'Única', stock: 20, price: null },
        { id: 'v35', sku: 'MA-004-U-SND', color: 'Arena', colorHex: '#F2EDE8', size: 'Única', stock: 15, price: null },
        { id: 'v36', sku: 'MA-004-U-BLK', color: 'Negro', colorHex: '#000000', size: 'Única', stock: 10, price: null }
      ],
      attributes: { material: '100% Cashmere', care: ['Limpieza en seco'], fit: 'N/A', collection: 'Otoño/Invierno' },
      tags: ['bestseller'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const product of products) {
    const productRef = doc(collection(db, 'products'));
    await setDoc(productRef, product);
  }
  console.log('Products seeded successfully!');
}

// To run: import this in a temp page and call once
// Then delete the import
