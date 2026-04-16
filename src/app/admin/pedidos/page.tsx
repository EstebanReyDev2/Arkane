'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';
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
  Search, 
  Filter, 
  Download, 
  Eye, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  X,
  MoreHorizontal,
  PackageCheck,
  RefreshCcw
} from 'lucide-react';
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
  DropdownMenuSeparator
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/src/components/ui/tooltip';
import { cn } from '@/src/lib/utils';
import { Order, OrderStatus, getOrders, updateOrderStatus } from '@/src/lib/firebase/admin-queries';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrderDetailDrawer } from '@/src/components/admin/OrderDetailDrawer';
import { toast } from '@/src/hooks/use-toast';
import Image from 'next/image';

const STATUS_TABS = [
  { id: 'all', label: 'Todos', count: 0 },
  { id: 'pending', label: 'Pendiente', count: 0 },
  { id: 'confirmed', label: 'Confirmado', count: 0 },
  { id: 'shipped', label: 'Enviado', count: 0 },
  { id: 'delivered', label: 'Entregado', count: 0 },
  { id: 'cancelled', label: 'Cancelado', count: 0 },
  { id: 'refunded', label: 'Reembolsado', count: 0 },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700 border-green-200', icon: PackageCheck },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: X },
  refunded: { label: 'Reembolsado', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: RefreshCcw }
};

// Default config para estados desconocidos
const DEFAULT_STATUS_CONFIG = { label: 'Desconocido', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Package };

const columnHelper = createColumnHelper<Order>();

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = orders;
    
    if (activeTab !== 'all') {
      result = result.filter((order: Order) => order.status === activeTab);
    }

    if (globalFilter) {
      const search = globalFilter.toLowerCase();
      result = result.filter((order: Order) => 
        order.id.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerEmail.toLowerCase().includes(search) ||
        (order.customerPhone && order.customerPhone.toLowerCase().includes(search)) ||
        order.items.some((item: any) => item.name?.toLowerCase().includes(search))
      );
    }

    if (paymentMethodFilter && paymentMethodFilter !== 'all') {
      result = result.filter((order: Order) => order.paymentMethod === paymentMethodFilter);
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((order: Order) => order.createdAt.toDate() >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((order: Order) => order.createdAt.toDate() <= end);
    }

    return result;
  }, [orders, activeTab, globalFilter, paymentMethodFilter, startDate, endDate]);

  const counts = useMemo(() => {
    const res: Record<string, number> = { all: orders.length };
    orders.forEach(o => {
      res[o.status] = (res[o.status] || 0) + 1;
    });
    return res;
  }, [orders]);

  const columns = [
    columnHelper.accessor('id', {
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-[#71717A]"
        >
          # Pedido
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: info => (
        <span className="font-mono font-bold text-[#18181B] text-[13px]">
          #{info.getValue().substring(0, 8).toUpperCase()}
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-[#71717A]"
        >
          Fecha
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: info => {
        const date = info.getValue().toDate();
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<Slot />}>
                <span className="text-[13px] text-[#18181B] cursor-default">
                  {format(date, 'dd MMM yyyy · HH:mm', { locale: es })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-[11px]">hace {formatDistanceToNow(date, { locale: es })}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    }),
    columnHelper.accessor('customerName', {
      header: "Cliente",
      cell: info => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-[#E4E4E7]">
            <AvatarFallback className="bg-[#0D0D0D] text-white text-[11px] font-bold">
              {info.getValue().charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-[#18181B]">{info.getValue()}</span>
            <span className="text-[11px] text-[#71717A]">{info.row.original.customerEmail}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('items', {
      header: "Productos",
      cell: info => {
        const items = info.getValue();
        return (
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {items.slice(0, 2).map((item, i) => (
                <div key={i} className="relative w-8 h-10 rounded border border-white bg-[#F9F9F9] overflow-hidden shadow-sm">
                  <Image 
                    src={item.image || 'https://picsum.photos/seed/product/50/70'} 
                    alt="" 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
            {items.length > 2 && (
              <span className="ml-2 text-[11px] font-bold text-[#71717A]">+{items.length - 2} más</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('total', {
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-[#71717A]"
        >
          Total
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: info => (
        <span className="text-[13px] font-bold text-[#18181B]">
          ${info.getValue().toLocaleString('es-AR')}
        </span>
      ),
    }),
    columnHelper.accessor('paymentMethod', {
      header: "Pago",
      cell: info => (
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-[#71717A]" />
          <span className="text-[12px] text-[#18181B]">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: "Estado",
      cell: info => {
        const [isOpen, setIsOpen] = useState(false);
        const status = info.getValue();
        const normalizedStatus = status?.toLowerCase() || 'pending';
        const config = STATUS_CONFIG[normalizedStatus as OrderStatus] || DEFAULT_STATUS_CONFIG;
        return (
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all hover:opacity-80 rounded",
                config.color
              )}
            >
              {config.label}
            </button>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-[#71717A]">Cambiar estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map(s => (
                <DropdownMenuItem 
                  key={s} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(info.row.original.id, s);
                    setIsOpen(false);
                  }}
                  className="text-[12px] gap-2"
                >
                  <div className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].color.split(' ')[0])} />
                  {STATUS_CONFIG[s].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-[#71717A] hover:text-[#18181B]"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(info.row.original);
              setIsDrawerOpen(true);
            }}
          >
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#71717A] hover:text-[#18181B]">
            <Printer size={16} />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleStatusUpdate = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      toast({ title: "Estado actualizado correctamente" });
      fetchOrders();
    } catch (error) {
      toast({ title: "Error al actualizar estado", variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Fecha", "Cliente", "Email", "Total", "Estado", "Metodo Pago"];
    const rows = orders.map(o => [
      o.id,
      format(o.createdAt.toDate(), 'yyyy-MM-dd HH:mm'),
      o.customerName,
      o.customerEmail,
      o.total,
      o.status,
      o.paymentMethod
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pedidos-arkade-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-[24px] font-bold text-[#18181B] tracking-tight">Pedidos</h2>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#71717A]">
          <span>Admin</span>
          <span>/</span>
          <span className="text-[#18181B]">Pedidos</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-[13px] font-bold transition-all relative flex items-center gap-2 whitespace-nowrap",
                  activeTab === tab.id 
                    ? "text-[#18181B] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0D0D0D]" 
                    : "text-[#71717A] hover:text-[#18181B]"
                )}
              >
                {tab.label}
                <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center bg-[#F4F4F5] text-[#71717A] text-[10px] font-bold">
                  {counts[tab.id] || 0}
                </Badge>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
              <Input 
                placeholder="Buscar por # pedido o email..." 
                className="pl-10 h-10 text-[13px] border-[#E4E4E7]"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="h-10 px-3 text-[13px] border border-[#E4E4E7] rounded-md bg-white"
            >
              <option value="all">Todos los pagos</option>
              <option value="contact">Contra entrega</option>
              <option value="transferencia">Transferencia</option>
              <option value="mercadopago">MercadoPago</option>
            </select>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-[#E4E4E7] rounded-md overflow-hidden h-10">
                <Input 
                  type="date" 
                  className="border-none h-full text-[12px] w-32 px-2" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <div className="w-[1px] h-4 bg-[#E4E4E7]" />
                <Input 
                  type="date" 
                  className="border-none h-full text-[12px] w-32 px-2" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="h-10 gap-2 text-[12px] font-bold uppercase tracking-wider border-[#E4E4E7]"
                onClick={handleExportCSV}
              >
                <Download size={16} />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="border-t border-[#F4F4F5]">
          <Table>
            <TableHeader className="bg-[#F9F9FB]">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-[#F4F4F5]">
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="h-12 px-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="h-16 animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j} className="px-4">
                        <div className="h-4 bg-[#F4F4F5] rounded w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <TableRow 
                    key={row.id} 
                    className="h-16 hover:bg-[#F9F9FB] cursor-pointer border-b border-[#F4F4F5] transition-colors"
                    onClick={() => {
                      setSelectedOrder(row.original);
                      setIsDrawerOpen(true);
                    }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#A1A1AA]">
                        <Package size={24} />
                      </div>
                      <p className="text-[14px] font-bold text-[#18181B]">No se encontraron pedidos</p>
                      <p className="text-[12px] text-[#71717A]">Prueba ajustando los filtros o la búsqueda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-[#F4F4F5] flex items-center justify-between">
          <p className="text-[12px] text-[#71717A]">
            Mostrando <span className="font-bold text-[#18181B]">{table.getRowModel().rows.length}</span> de <span className="font-bold text-[#18181B]">{filteredOrders.length}</span> pedidos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0 border-[#E4E4E7]"
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: table.getPageCount() }).map((_, i) => (
                <Button
                  key={i}
                  variant={table.getState().pagination.pageIndex === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => table.setPageIndex(i)}
                  className={cn(
                    "h-8 w-8 p-0 text-[12px] font-bold",
                    table.getState().pagination.pageIndex === i ? "bg-[#0D0D0D] text-white" : "border-[#E4E4E7] text-[#71717A]"
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
              className="h-8 w-8 p-0 border-[#E4E4E7]"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <OrderDetailDrawer 
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={() => {
          fetchOrders();
          if (selectedOrder) {
            // Refresh selected order data
            getOrders().then(data => {
              const updated = data.find(o => o.id === selectedOrder.id);
              if (updated) setSelectedOrder(updated);
            });
          }
        }}
      />
    </div>
  );
}
