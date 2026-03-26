'use client'

import React, { useState, useEffect, useMemo } from 'react';
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
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  User,
  ShoppingBag,
  TrendingUp,
  Users,
  Mail,
  Calendar,
  ExternalLink
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
import { Card, CardContent } from '@/src/components/ui/card';
import { cn } from '@/src/lib/utils';
import { getCustomers } from '@/src/lib/firebase/admin-queries';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/src/hooks/use-toast';
import Link from 'next/link';

const columnHelper = createColumnHelper<any>();

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const stats = useMemo(() => {
    const total = customers.length;
    const newThisMonth = customers.filter(c => {
      const date = c.createdAt?.toDate() || new Date();
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    
    const totalSpent = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
    const totalOrders = customers.reduce((acc, c) => acc + (c.orderCount || 0), 0);
    const aov = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    const recurrent = customers.filter(c => (c.orderCount || 0) > 1).length;

    return [
      { label: 'Total clientes', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Nuevos este mes', value: newThisMonth, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'AOV promedio', value: `$${aov.toLocaleString('es-AR')}`, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Clientes recurrentes', value: recurrent, icon: User, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
  }, [customers]);

  const columns = [
    columnHelper.accessor('displayName', {
      header: "Cliente",
      cell: info => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-[#E4E4E7]">
            <AvatarImage src={info.row.original.photoURL} />
            <AvatarFallback className="bg-[#0D0D0D] text-white text-[12px] font-bold">
              {info.getValue()?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#18181B]">{info.getValue() || 'Usuario sin nombre'}</span>
            <span className="text-[11px] text-[#71717A]">{info.row.original.email}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-[#71717A]"
        >
          Registro
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: info => {
        const date = info.getValue()?.toDate();
        return (
          <span className="text-[13px] text-[#18181B]">
            {date ? format(date, 'dd MMM yyyy', { locale: es }) : '—'}
          </span>
        );
      },
    }),
    columnHelper.accessor('orderCount', {
      header: "Pedidos",
      cell: info => (
        <Badge variant="secondary" className="bg-[#F4F4F5] text-[#18181B] text-[12px] font-bold border-none">
          {info.getValue() || 0}
        </Badge>
      ),
    }),
    columnHelper.accessor('totalSpent', {
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-[#71717A]"
        >
          Total gastado
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: info => (
        <span className="text-[13px] font-bold text-[#18181B]">
          ${(info.getValue() || 0).toLocaleString('es-AR')}
        </span>
      ),
    }),
    columnHelper.accessor('lastOrderAt', {
      header: "Último pedido",
      cell: info => {
        const date = info.getValue()?.toDate();
        return (
          <span className="text-[13px] text-[#71717A]">
            {date ? format(date, 'dd/MM/yyyy', { locale: es }) : 'Nunca'}
          </span>
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
            asChild
          >
            <Link href={`/admin/clientes/${info.row.original.id}`}>
              <Eye size={16} />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#71717A] hover:text-[#18181B]">
            <Mail size={16} />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: customers,
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

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-[24px] font-bold text-[#18181B] tracking-tight">Clientes</h2>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#71717A]">
          <span>Admin</span>
          <span>/</span>
          <span className="text-[#18181B]">Clientes</span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-[#E4E4E7] shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#71717A]">{stat.label}</p>
                <p className="text-[24px] font-bold text-[#18181B] mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F4F4F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
            <Input 
              placeholder="Buscar por nombre o email..." 
              className="pl-10 h-10 text-[13px] border-[#E4E4E7]"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 gap-2 text-[12px] font-bold uppercase tracking-wider border-[#E4E4E7]">
              <Filter size={16} />
              Filtros
            </Button>
            <Button variant="outline" className="h-10 gap-2 text-[12px] font-bold uppercase tracking-wider border-[#E4E4E7]">
              <Download size={16} />
              Exportar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                    {Array.from({ length: 6 }).map((_, j) => (
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
                    className="h-16 hover:bg-[#F9F9FB] border-b border-[#F4F4F5] transition-colors"
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
                        <Users size={24} />
                      </div>
                      <p className="text-[14px] font-bold text-[#18181B]">No se encontraron clientes</p>
                      <p className="text-[12px] text-[#71717A]">Prueba ajustando la búsqueda.</p>
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
            Mostrando <span className="font-bold text-[#18181B]">{table.getRowModel().rows.length}</span> de <span className="font-bold text-[#18181B]">{customers.length}</span> clientes
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
    </div>
  );
}
