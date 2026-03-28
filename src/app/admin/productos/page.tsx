'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2, 
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/src/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Switch } from '@/src/components/ui/switch';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Badge } from '@/src/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/src/components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { getAllProducts, updateProduct, deleteProduct } from '@/src/lib/firebase/admin-queries';
import { Product } from '@/src/types/product';
import Image from 'next/image';
import { toast } from '@/src/hooks/use-toast';

const columnHelper = createColumnHelper<Product>();

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({ title: "Error al cargar productos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const filteredData = useMemo(() => {
    return products.filter((product: Product) => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' ? product.isActive : !product.isActive);
      
      const totalStock = product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;
      const matchesStock = stockFilter === 'all' || 
        (stockFilter === 'normal' && totalStock >= 10) ||
        (stockFilter === 'low' && totalStock > 0 && totalStock < 10) ||
        (stockFilter === 'none' && totalStock === 0);

      return matchesCategory && matchesStatus && matchesStock;
    });
  }, [products, categoryFilter, statusFilter, stockFilter]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    const previousProducts = [...products];
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));

    try {
      await updateProduct(id, { isActive: !currentStatus });
      toast({ title: `Producto ${!currentStatus ? 'activado' : 'desactivado'}` });
    } catch (error) {
      console.error('Error updating product status:', error);
      setProducts(previousProducts);
      toast({ title: "Error al actualizar estado", variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Producto eliminado correctamente" });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: "Error al eliminar producto", variant: "destructive" });
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original.id);
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(selectedIds.map(id => updateProduct(id, { isActive })));
      setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isActive } : p));
      setRowSelection({});
      toast({ title: `Productos ${isActive ? 'activados' : 'desactivados'} correctamente` });
    } catch (error) {
      console.error('Error updating products:', error);
      toast({ title: "Error al actualizar productos", variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original.id);
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(selectedIds.map(id => deleteProduct(id)));
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setRowSelection({});
      setIsDeleteDialogOpen(false);
      toast({ title: "Productos eliminados correctamente" });
    } catch (error) {
      console.error('Error deleting products:', error);
      toast({ title: "Error al eliminar productos", variant: "destructive" });
    }
  };

  const columns = [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-[#71717A]"
        >
          Producto
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: info => {
        const product = info.row.original;
        const mainImage = product.images?.find(img => img.type === 'main') || product.images?.[0];
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-16 bg-[#F4F4F5] rounded-[4px] overflow-hidden flex-shrink-0">
              {mainImage ? (
                <Image 
                  src={mainImage.url} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={20} className="text-[#A1A1AA]" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <Link 
                href={`/admin/productos/${product.id}/editar`}
                className="text-[14px] font-medium text-[#18181B] hover:underline"
              >
                {product.name}
              </Link>
              <span className="text-[11px] font-mono text-[#71717A]">{product.sku}</span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('category', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-[#71717A]"
        >
          Categoría
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: info => (
        <div className="flex flex-col">
          <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wider px-1.5 py-0">
            {info.getValue()}
          </Badge>
          <span className="text-[11px] text-[#71717A] mt-1">{info.row.original.subcategory}</span>
        </div>
      ),
    }),
    columnHelper.accessor('basePrice', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-[#71717A]"
        >
          Precio
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: info => {
        const product = info.row.original;
        return (
          <div className="flex flex-col">
            <span className={cn(
              "text-[13px] font-semibold text-[#18181B]",
              product.salePrice && "line-through text-[#A1A1AA] text-[11px]"
            )}>
              ${product.basePrice.toLocaleString('es-AR')}
            </span>
            {product.salePrice && (
              <span className="text-[13px] font-semibold text-[#C4714A]">
                ${product.salePrice.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'stock',
      header: 'Stock',
      cell: info => {
        const totalStock = info.row.original.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
        let color = "#16A34A";
        let label = totalStock.toString();
        
        if (totalStock === 0) {
          color = "#DC2626";
          label = "Sin stock";
        } else if (totalStock < 10) {
          color = "#D97706";
          label = `${totalStock} ⚠️ Stock bajo`;
        }

        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[13px] font-medium" style={{ color }}>{label}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('isActive', {
      header: 'Estado',
      cell: info => (
        <Switch 
          checked={info.getValue()} 
          onCheckedChange={() => handleToggleStatus(info.row.original.id, info.getValue())}
        />
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      cell: info => {
        const product = info.row.original;
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-[#71717A] hover:text-[#18181B]">
              <a href={`/producto/${product.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye size={16} />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-[#71717A] hover:text-[#18181B]">
              <Link href={`/admin/productos/${product.id}/editar`}>
                <Pencil size={16} />
              </Link>
            </Button>
            <Dialog>
              <DialogTrigger render={<Slot />}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#71717A] hover:text-[#DC2626]">
                  <Trash2 size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Eliminar producto?</DialogTitle>
                  <DialogDescription>
                    Esta acción no se puede deshacer. El producto &quot;{product.name}&quot; será eliminado permanentemente.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Slot />}>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <DialogClose render={<Slot />}>
                    <Button variant="destructive" onClick={() => handleDeleteProduct(product.id)}>Eliminar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-semibold text-[#18181B]">Productos</h2>
          <span className="text-[14px] text-[#71717A]">({filteredData.length})</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <Input 
              placeholder="Buscar productos..." 
              className="pl-9 h-9 text-[13px] border-[#E4E4E7] focus:ring-[#0D0D0D]"
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Slot />}>
              <Button variant="outline" className="h-9 text-[13px] gap-2 border-[#E4E4E7]">
                <Filter size={14} />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-[#71717A]">Categoría</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
                <DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="mujer">Mujer</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="hombre">Hombre</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="accesorios">Accesorios</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-[#71717A]">Estado</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="active">Activos</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="inactive">Inactivos</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-[#71717A]">Stock</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={stockFilter} onValueChange={setStockFilter}>
                <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="normal">Normal</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="low">Stock bajo</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="none">Sin stock</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            onClick={() => router.push('/admin/productos/nuevo')}
            className="h-9 bg-[#0D0D0D] text-white text-[12px] font-bold uppercase tracking-wider hover:bg-[#333333]"
          >
            <Plus size={14} className="mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <div className="bg-white border border-[#E4E4E7] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader className="bg-[#F9F9F9]">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="h-10 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j} className="h-16">
                      <div className="h-4 bg-[#F4F4F5] animate-pulse rounded w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="h-[72px] hover:bg-[#FAFAFA] transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Package size={48} className="text-[#A1A1AA]" />
                    <p className="text-[14px] text-[#71717A]">No hay productos que coincidan</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCategoryFilter('all');
                        setStatusFilter('all');
                        setStockFilter('all');
                        setGlobalFilter('');
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="px-4 py-4 border-t border-[#E4E4E7] flex items-center justify-between bg-white">
          <span className="text-[12px] text-[#71717A]">
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} de {filteredData.length} productos
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-3 text-[12px] gap-1"
            >
              <ChevronLeft size={14} />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: table.getPageCount() }).map((_, i) => (
                <Button
                  key={i}
                  variant={table.getState().pagination.pageIndex === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => table.setPageIndex(i)}
                  className={cn(
                    "h-8 w-8 p-0 text-[12px]",
                    table.getState().pagination.pageIndex === i ? "bg-[#0D0D0D] text-white" : ""
                  )}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-3 text-[12px] gap-1"
            >
              Siguiente
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0D0D0D] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50"
          >
            <span className="text-[13px] font-medium border-r border-white/20 pr-6">
              {selectedCount} productos seleccionados
            </span>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/10 text-[12px] h-8"
                onClick={() => handleBulkStatusUpdate(true)}
              >
                Activar todos
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/10 text-[12px] h-8"
                onClick={() => handleBulkStatusUpdate(false)}
              >
                Desactivar todos
              </Button>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger render={<Slot />}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#EF4444] hover:bg-[#EF4444]/10 text-[12px] h-8"
                  >
                    Eliminar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Eliminar {selectedCount} productos?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer. Los productos seleccionados serán eliminados permanentemente.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleBulkDelete}>Eliminar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#A1A1AA] hover:text-white text-[12px] h-8"
                onClick={() => setRowSelection({})}
              >
                Cancelar selección
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
