import { Firestore, collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

function generateVariants(productSku: string, colors: {name: string, hex: string}[], sizes: string[]) {
  const variants = [];
  for (const color of colors) {
    for (const size of sizes) {
      variants.push({
        id: `var-${productSku}-${color.name.toLowerCase()}-${size.toLowerCase()}`,
        sku: `${productSku}-${color.name.substring(0,3).toUpperCase()}-${size.toUpperCase()}`,
        color: color.name,
        colorHex: color.hex,
        size: size,
        stock: Math.floor(Math.random() * 50),
        price: null
      });
    }
  }
  return variants;
}

function generateImages(seedBase: string) {
  return [
    { url: `https://picsum.photos/seed/${seedBase}-main/800/1067`, alt: 'Vista principal', type: 'main' },
    { url: `https://picsum.photos/seed/${seedBase}-model/800/1067`, alt: 'Vista modelo', type: 'model' },
    { url: `https://picsum.photos/seed/${seedBase}-detail/800/1067`, alt: 'Vista detalle', type: 'detail' }
  ];
}

const productsData = [
  { sku: "ARK-MUJ-001", name: "Trench Coat Oversize", slug: "trench-coat-oversize", desc: "Trench coat de corte oversize con detalles clásicos. Ideal para entretiempo.", price: 185000, cat: "mujer", subcat: "abrigos", colors: [{name:"Camel", hex:"#C19A6B"}, {name:"Negro", hex:"#000000"}], sizes: ["S","M","L"], tags: ["new", "featured"] },
  { sku: "ARK-MUJ-002", name: "Vestido Midi Plisado", slug: "vestido-midi-plisado", desc: "Vestido midi con falda plisada y escote en V. Fluido y elegante.", price: 120000, salePrice: 84000, salePct: 30, cat: "mujer", subcat: "vestidos", colors: [{name:"Ivory", hex:"#FFFFF0"}, {name:"Sage", hex:"#9DC183"}], sizes: ["XS","S","M","L"], tags: ["new", "sale", "bestseller"] },
  { sku: "ARK-MUJ-003", name: "Jersey Cashmere Orgánico", slug: "jersey-cashmere-organico", desc: "Jersey de punto fino en cashmere 100% orgánico. Suavidad extrema.", price: 145000, cat: "mujer", subcat: "punto", colors: [{name:"Crudo", hex:"#F5F5DC"}, {name:"Gris", hex:"#808080"}], sizes: ["S","M","L"], tags: ["new", "sustainable"] },
  { sku: "ARK-MUJ-004", name: "Blazer Lana Virgen", slug: "blazer-lana-virgen", desc: "Blazer sastre confeccionado en lana virgen. Corte impecable.", price: 210000, salePrice: 126000, salePct: 40, cat: "mujer", subcat: "sastrería", colors: [{name:"Stone", hex:"#877F6C"}, {name:"Charcoal", hex:"#36454F"}], sizes: ["S","M","L"], tags: ["new", "sale", "featured"] },
  { sku: "ARK-MUJ-005", name: "Pantalón Palazzo Seda", slug: "pantalon-palazzo-seda", desc: "Pantalón de corte palazzo en mezcla de seda. Caída espectacular.", price: 135000, cat: "mujer", subcat: "pantalones", colors: [{name:"Negro", hex:"#000000"}, {name:"Tostado", hex:"#D2B48C"}], sizes: ["XS","S","M","L"], tags: ["new", "featured"] },
  { sku: "ARK-MUJ-006", name: "Camisa Oversize Popelín", slug: "camisa-oversize-popelin", desc: "Camisa de popelín de algodón con silueta oversize. Un básico reinventado.", price: 85000, cat: "mujer", subcat: "camisas", colors: [{name:"Blanco", hex:"#FFFFFF"}, {name:"Celeste", hex:"#B2FFFF"}], sizes: ["S","M","L"], tags: ["new", "bestseller"] },
  { sku: "ARK-MUJ-007", name: "Falda Midi Lino", slug: "falda-midi-lino", desc: "Falda midi confeccionada en lino puro. Fresca y versátil.", price: 95000, salePrice: 61750, salePct: 35, cat: "mujer", subcat: "faldas", colors: [{name:"Beige", hex:"#F5F5DC"}, {name:"Terracota", hex:"#E2725B"}], sizes: ["S","M","L"], tags: ["new", "sale", "sustainable"] },
  { sku: "ARK-MUJ-008", name: "Cardigan Cashmere", slug: "cardigan-cashmere", desc: "Cardigan abierto de cashmere suave. Perfecto para superposiciones.", price: 160000, cat: "mujer", subcat: "punto", colors: [{name:"Camel", hex:"#C19A6B"}, {name:"Crudo", hex:"#F5F5DC"}], sizes: ["S","M","L"], tags: ["new", "bestseller"] },
  { sku: "ARK-HOM-001", name: "Blazer Estructurado Lana", slug: "blazer-estructurado-lana", desc: "Blazer de corte estructurado en lana premium. Elegancia contemporánea.", price: 225000, cat: "hombre", subcat: "sastrería", colors: [{name:"Charcoal", hex:"#36454F"}, {name:"Navy", hex:"#000080"}], sizes: ["M","L","XL"], tags: ["new", "featured"] },
  { sku: "ARK-HOM-002", name: "Pantalón Sastre Wide Leg", slug: "pantalon-sastre-wide-leg", desc: "Pantalón de vestir con pernera ancha. Confort y estilo a partes iguales.", price: 115000, cat: "hombre", subcat: "pantalones", colors: [{name:"Stone", hex:"#877F6C"}, {name:"Negro", hex:"#000000"}], sizes: ["S","M","L","XL"], tags: ["new", "featured"] },
  { sku: "ARK-HOM-003", name: "Camisa Lino Lavado", slug: "camisa-lino-lavado", desc: "Camisa de lino con acabado lavado para mayor suavidad. Transpirable.", price: 89000, cat: "hombre", subcat: "camisas", colors: [{name:"Blanco", hex:"#FFFFFF"}, {name:"Celeste", hex:"#B2FFFF"}, {name:"Arena", hex:"#C2B280"}], sizes: ["M","L","XL"], tags: ["new", "bestseller", "sustainable"] },
  { sku: "ARK-HOM-004", name: "Jersey Merino Cuello Alto", slug: "jersey-merino-cuello-alto", desc: "Jersey de cuello alto en lana merino extrafina. Abrigo sin volumen.", price: 130000, cat: "hombre", subcat: "punto", colors: [{name:"Gris", hex:"#808080"}, {name:"Camel", hex:"#C19A6B"}], sizes: ["S","M","L"], tags: ["new"] },
  { sku: "ARK-HOM-005", name: "Chaqueta Técnica", slug: "chaqueta-tecnica", desc: "Chaqueta resistente al agua con detalles técnicos. Funcionalidad urbana.", price: 195000, salePrice: 146250, salePct: 25, cat: "hombre", subcat: "abrigos", colors: [{name:"Oliva", hex:"#808000"}, {name:"Negro", hex:"#000000"}], sizes: ["M","L","XL"], tags: ["new", "sale", "featured"] },
  { sku: "ARK-HOM-006", name: "Trench Coat Gabardina", slug: "trench-coat-gabardina", desc: "Trench clásico en gabardina de algodón repelente al agua.", price: 215000, cat: "hombre", subcat: "abrigos", colors: [{name:"Camel", hex:"#C19A6B"}, {name:"Negro", hex:"#000000"}], sizes: ["M","L","XL"], tags: ["new", "featured"] },
  { sku: "ARK-HOM-007", name: "Camiseta Algodón Pima", slug: "camiseta-algodon-pima", desc: "Camiseta básica en algodón pima peruano. La máxima calidad en básicos.", price: 45000, cat: "hombre", subcat: "basics", colors: [{name:"Blanco", hex:"#FFFFFF"}, {name:"Negro", hex:"#000000"}, {name:"Gris", hex:"#808080"}], sizes: ["S","M","L","XL"], tags: ["new", "bestseller"] },
  { sku: "ARK-HOM-008", name: "Pantalón Chino Relaxed", slug: "pantalon-chino-relaxed", desc: "Pantalón chino de corte relajado. Perfecto para el día a día.", price: 98000, cat: "hombre", subcat: "pantalones", colors: [{name:"Beige", hex:"#F5F5DC"}, {name:"Oliva", hex:"#808000"}], sizes: ["S","M","L","XL"], tags: ["new"] },
  { sku: "ARK-ACC-001", name: "Bolso Tote Cuero", slug: "bolso-tote-cuero", desc: "Bolso tote espacioso en cuero de curtido vegetal. Durabilidad garantizada.", price: 185000, cat: "accesorios", subcat: "bolsos", colors: [{name:"Camel", hex:"#C19A6B"}, {name:"Negro", hex:"#000000"}], sizes: ["UNICA"], tags: ["new", "featured", "sustainable"] },
  { sku: "ARK-ACC-002", name: "Cinturón Piel Nappa", slug: "cinturon-piel-nappa", desc: "Cinturón clásico en suave piel nappa con hebilla minimalista.", price: 55000, cat: "accesorios", subcat: "cinturones", colors: [{name:"Marrón", hex:"#8B4513"}, {name:"Negro", hex:"#000000"}], sizes: ["UNICA"], tags: ["new"] },
  { sku: "ARK-ACC-003", name: "Bufanda Cashmere", slug: "bufanda-cashmere", desc: "Bufanda de gran tamaño en cashmere puro. El accesorio de invierno definitivo.", price: 110000, salePrice: 88000, salePct: 20, cat: "accesorios", subcat: "bufandas", colors: [{name:"Camel", hex:"#C19A6B"}, {name:"Gris", hex:"#808080"}, {name:"Crudo", hex:"#F5F5DC"}], sizes: ["UNICA"], tags: ["new", "sale", "bestseller"] },
  { sku: "ARK-ACC-004", name: "Cartera Envelope", slug: "cartera-envelope", desc: "Cartera de mano estilo sobre en piel texturizada. Elegante y compacta.", price: 75000, cat: "accesorios", subcat: "carteras", colors: [{name:"Negro", hex:"#000000"}, {name:"Stone", hex:"#877F6C"}], sizes: ["UNICA"], tags: ["new"] }
];

export const accessoriesData = [
  { sku: "ARK-ACC-005", name: "Gafas de Sol Aviador", slug: "gafas-sol-aviador", desc: "Montura metálica ligera con lentes polarizadas. Protección UV400.", price: 85000, cat: "accesorios", subcat: "gafas", colors: [{name:"Oro", hex:"#FFD700"}, {name:"Plata", hex:"#C0C0C0"}], sizes: ["UNICA"], tags: ["new", "bestseller"] },
  { sku: "ARK-ACC-006", name: "Gafas de Sol Cat-Eye", slug: "gafas-sol-cat-eye", desc: "Diseño retro cat-eye en acetato premium. Lentes degradadas.", price: 92000, cat: "accesorios", subcat: "gafas", colors: [{name:"Carey", hex:"#654321"}, {name:"Negro", hex:"#000000"}], sizes: ["UNICA"], tags: ["new", "featured"] },
  { sku: "ARK-ACC-007", name: "Reloj Minimalista Cuero", slug: "reloj-minimalista-cuero", desc: "Esfera limpia de 38mm con movimiento de cuarzo suizo y correa de cuero.", price: 145000, cat: "accesorios", subcat: "relojes", colors: [{name:"Marrón", hex:"#8B4513"}, {name:"Negro", hex:"#000000"}], sizes: ["UNICA"], tags: ["new"] },
  { sku: "ARK-ACC-008", name: "Reloj Cronógrafo Acero", slug: "reloj-cronografo-acero", desc: "Caja de acero inoxidable de 42mm, resistente al agua 5ATM.", price: 210000, salePrice: 168000, salePct: 20, cat: "accesorios", subcat: "relojes", colors: [{name:"Plata", hex:"#C0C0C0"}], sizes: ["UNICA"], tags: ["new", "sale"] },
  { sku: "ARK-ACC-009", name: "Collar Cadena Eslabones", slug: "collar-cadena-eslabones", desc: "Cadena de eslabones gruesos bañada en oro de 18k. Cierre de mosquetón.", price: 65000, cat: "accesorios", subcat: "joyería", colors: [{name:"Oro", hex:"#FFD700"}], sizes: ["UNICA"], tags: ["new", "bestseller"] },
  { sku: "ARK-ACC-010", name: "Pendientes Aro Clásicos", slug: "pendientes-aro-clasicos", desc: "Aros medianos tubulares en plata de ley 925 bañada en oro.", price: 48000, cat: "accesorios", subcat: "joyería", colors: [{name:"Oro", hex:"#FFD700"}, {name:"Plata", hex:"#C0C0C0"}], sizes: ["UNICA"], tags: ["new"] },
  { sku: "ARK-ACC-011", name: "Anillo Sello Minimal", slug: "anillo-sello-minimal", desc: "Anillo tipo sello con superficie plana pulida. Plata de ley 925.", price: 52000, cat: "accesorios", subcat: "joyería", colors: [{name:"Plata", hex:"#C0C0C0"}], sizes: ["S", "M", "L"], tags: ["new", "featured"] },
  { sku: "ARK-ACC-012", name: "Pulsera Cadena Fina", slug: "pulsera-cadena-fina", desc: "Pulsera delicada con detalle de pequeña placa. Ajustable.", price: 35000, cat: "accesorios", subcat: "joyería", colors: [{name:"Oro", hex:"#FFD700"}], sizes: ["UNICA"], tags: ["new"] },
  { sku: "ARK-ACC-013", name: "Sombrero Fedora Fieltro", slug: "sombrero-fedora-fieltro", desc: "Sombrero fedora clásico de fieltro de lana 100% con cinta de grosgrain.", price: 89000, cat: "accesorios", subcat: "sombreros", colors: [{name:"Camel", hex:"#C19A6B"}, {name:"Negro", hex:"#000000"}], sizes: ["M", "L"], tags: ["new", "featured"] },
  { sku: "ARK-ACC-014", name: "Gorra Béisbol Algodón", slug: "gorra-beisbol-algodon", desc: "Gorra de 6 paneles en sarga de algodón con logo bordado tonal.", price: 38000, cat: "accesorios", subcat: "sombreros", colors: [{name:"Navy", hex:"#000080"}, {name:"Oliva", hex:"#808000"}], sizes: ["UNICA"], tags: ["new"] },
  { sku: "ARK-ACC-015", name: "Gorro Beanie Lana Merino", slug: "gorro-beanie-lana-merino", desc: "Gorro de punto acanalado en lana merino extrafina.", price: 42000, cat: "accesorios", subcat: "sombreros", colors: [{name:"Gris", hex:"#808080"}, {name:"Negro", hex:"#000000"}], sizes: ["UNICA"], tags: ["new", "bestseller"] },
  { sku: "ARK-ACC-016", name: "Mochila Cuero Urbano", slug: "mochila-cuero-urbano", desc: "Mochila minimalista con compartimento para portátil de 15 pulgadas.", price: 195000, cat: "accesorios", subcat: "bolsos", colors: [{name:"Negro", hex:"#000000"}, {name:"Marrón", hex:"#8B4513"}], sizes: ["UNICA"], tags: ["new", "featured"] },
  { sku: "ARK-ACC-017", name: "Bolso Bandolera Mini", slug: "bolso-bandolera-mini", desc: "Bandolera compacta estructurada con cierre metálico.", price: 125000, salePrice: 87500, salePct: 30, cat: "accesorios", subcat: "bolsos", colors: [{name:"Burdeos", hex:"#800020"}, {name:"Negro", hex:"#000000"}], sizes: ["UNICA"], tags: ["new", "sale"] },
  { sku: "ARK-ACC-018", name: "Maletín Portadocumentos", slug: "maletin-portadocumentos", desc: "Maletín slim en piel texturizada. Elegancia para la oficina.", price: 210000, cat: "accesorios", subcat: "bolsos", colors: [{name:"Navy", hex:"#000080"}, {name:"Negro", hex:"#000000"}], sizes: ["UNICA"], tags: ["new"] },
  { sku: "ARK-ACC-019", name: "Cinturón Trenzado Piel", slug: "cinturon-trenzado-piel", desc: "Cinturón trenzado a mano en piel de vacuno. Ajuste personalizado.", price: 62000, cat: "accesorios", subcat: "cinturones", colors: [{name:"Marrón", hex:"#8B4513"}], sizes: ["S", "M", "L"], tags: ["new", "bestseller"] },
  { sku: "ARK-ACC-020", name: "Cinturón Hebilla Doble", slug: "cinturon-hebilla-doble", desc: "Cinturón de piel lisa con hebilla metálica de doble aro.", price: 58000, cat: "accesorios", subcat: "cinturones", colors: [{name:"Negro", hex:"#000000"}], sizes: ["S", "M", "L"], tags: ["new"] },
  { sku: "ARK-ACC-021", name: "Tarjetero Piel Premium", slug: "tarjetero-piel-premium", desc: "Tarjetero slim con 4 ranuras y compartimento central.", price: 35000, cat: "accesorios", subcat: "carteras", colors: [{name:"Verde Botella", hex:"#006400"}, {name:"Negro", hex:"#000000"}], sizes: ["UNICA"], tags: ["new"] },
  { sku: "ARK-ACC-022", name: "Monedero Cremallera", slug: "monedero-cremallera", desc: "Monedero compacto con cremallera perimetral y tirador de piel.", price: 45000, cat: "accesorios", subcat: "carteras", colors: [{name:"Camel", hex:"#C19A6B"}, {name:"Negro", hex:"#000000"}], sizes: ["UNICA"], tags: ["new"] },
  { sku: "ARK-ACC-023", name: "Pañuelo Seda Estampado", slug: "panuelo-seda-estampado", desc: "Pañuelo cuadrado 100% seda con estampado geométrico exclusivo.", price: 78000, cat: "accesorios", subcat: "bufandas", colors: [{name:"Multicolor", hex:"#FFFFFF"}], sizes: ["UNICA"], tags: ["new", "featured"] },
  { sku: "ARK-ACC-024", name: "Bufanda Punto Grueso", slug: "bufanda-punto-grueso", desc: "Bufanda envolvente en mezcla de lana y alpaca. Extra cálida.", price: 95000, salePrice: 76000, salePct: 20, cat: "accesorios", subcat: "bufandas", colors: [{name:"Crudo", hex:"#F5F5DC"}, {name:"Gris Oscuro", hex:"#A9A9A9"}], sizes: ["UNICA"], tags: ["new", "sale"] }
];

export async function seedProducts(db: Firestore) {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  
  if (!snapshot.empty) {
    throw new Error('Database already seeded. Products collection is not empty.');
  }

  const batch = [];
  
  for (const item of productsData) {
    const docRef = doc(productsRef);
    const product = {
      id: docRef.id,
      sku: item.sku,
      name: item.name,
      slug: item.slug,
      description: item.desc,
      basePrice: item.price,
      salePrice: item.salePrice || null,
      salePercentage: item.salePct || null,
      category: item.cat,
      subcategory: item.subcat,
      vertical: "fashion",
      images: generateImages(item.slug),
      variants: generateVariants(item.sku, item.colors, item.sizes),
      attributes: {
        material: item.cat === 'accesorios' ? '100% Cuero/Cashmere' : 'Mezcla Premium',
        care: ['Lavar en seco', 'No usar secadora'],
        fit: 'Regular',
        collection: 'Invierno 2024'
      },
      tags: item.tags,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    batch.push(setDoc(docRef, product, { merge: true }));
  }
  
  await Promise.all(batch);
}

export async function seedAccessories(db: Firestore) {
  const productsRef = collection(db, 'products');
  const batch = [];
  
  for (const item of accessoriesData) {
    const docRef = doc(productsRef);
    const product = {
      id: docRef.id,
      sku: item.sku,
      name: item.name,
      slug: item.slug,
      description: item.desc,
      basePrice: item.price,
      salePrice: item.salePrice || null,
      salePercentage: item.salePct || null,
      category: item.cat,
      subcategory: item.subcat,
      vertical: "fashion",
      images: generateImages(item.slug),
      variants: generateVariants(item.sku, item.colors, item.sizes),
      attributes: {
        material: '100% Premium',
        care: ['Limpiar con paño húmedo'],
        fit: 'Regular',
        collection: 'Accesorios 2024'
      },
      tags: item.tags,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    batch.push(setDoc(docRef, product, { merge: true }));
  }
  
  await Promise.all(batch);
}
