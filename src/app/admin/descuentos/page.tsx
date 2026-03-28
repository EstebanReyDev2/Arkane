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
  Plus, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Tag,
  Copy,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle
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
import { Switch } from '@/src/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/src/components/ui/select';
import { Checkbox } from '@/src/components/ui/checkbox';
import { cn } from '@/src/lib/utils';
import { getDiscounts, createDiscount, toggleDiscount, Discount } from '@/src/lib/firebase/admin-queries';
import { format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/src/hooks/use-toast';

const columnHelper = createColumnHelper<Discount>();

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(0);
  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [hasMinPurchase, setHasMinPurchase] = useState(false);
  const [maxUses, setMaxUses] = useState<number>(0);
  const [hasMaxUses, setHasMaxUses] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [applicableTo, setApplicableTo] = useState('all');

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const data = await getDiscounts();
      setDiscounts(data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleGenerateCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setCode(`ARKADE${random}`);
  };

  const handleCreate = async () => {
    if (!code || value <= 0) {
      toast({ title: "Por favor completa los campos obligatorios", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      await createDiscount({
        code: code.toUpperCase(),
        type,
        value,
        minPurchase: hasMinPurchase ? minPurchase : undefined,
        isActive: true,
        expiryDate: hasExpiry ? new Date(expiryDate) : null,
        // In a real app we'd add more fields like maxUses, applicableTo, etc.
      } as any);
      
      toast({ title: "✅ Código de descuento creado" });
      fetchDiscounts();
      // Reset form
      setCode('');
      setValue(0);
      setMinPurchase(0);
      setHasMinPurchase(false);
      setHasMaxUses(false);
      setHasExpiry(false);
    } catch (error) {
      toast({ title: "Error al crear el código", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleDiscount(id, active);
      setDiscounts(prev => prev.map(d => d.id === id ? { ...d, isActive: active } : d));
      toast({ title: active ? "Código activado" : "Código desactivado" });
    } catch (error) {
      toast({ title: "Error al actualizar estado", variant: "destructive" });
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Código copiado" });
  };

  const columns = [
    columnHelper.accessor('code', {
      header: "Código",
      cell: info => (
        <span className="font-mono font-bold text-[#18181B] text-[14px] uppercase tracking-wider">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('type', {
      header: "Tipo",
      cell: info => (
        <span className="text-[13px] text-[#71717A] capitalize">
          {info.getValue() === 'percentage' ? 'Porcentaje' : 'Monto fijo'}
        </span>
      ),
    }),
    columnHelper.accessor('value', {
      header: "Valor",
      cell: info => (
        <span className="text-[13px] font-bold text-[#18181B]">
          {info.row.original.type === 'percentage' ? `${info.getValue()}%` : `$${info.getValue().toLocaleString('es-AR')}`}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'uses',
      header: "Usos/Máx",
      cell: info => {
        const uses = (info.row.original as any).uses || 0;
        const max = (info.row.original as any).maxUses || '∞';
        const progress = typeof max === 'number' ? (uses / max) * 100 : 0;
        
        return (
          <div className="flex flex-col gap-1.5 w-24">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-[#18181B]">{uses}</span>
              <span className="text-[#71717A]">/ {max}</span>
            </div>
            {typeof max === 'number' && (
              <div className="h-1 w-full bg-[#F4F4F5] rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all",
                    progress > 90 ? "bg-[#DC2626]" : "bg-[#0D0D0D]"
                  )} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('expiryDate', {
      header: "Vencimiento",
      cell: info => {
        const date = info.getValue()?.toDate();
        if (!date) return <span className="text-[13px] text-[#A1A1AA]">Sin límite</span>;
        
        const expired = isAfter(new Date(), date);
        return (
          <span className={cn("text-[13px]", expired ? "text-[#DC2626] font-medium" : "text-[#71717A]")}>
            {format(date, 'dd MMM yyyy', { locale: es })}
          </span>
        );
      },
    }),
    columnHelper.accessor('isActive', {
      header: "Estado",
      cell: info => (
        <Switch 
          checked={info.getValue()} 
          onCheckedChange={(v) => handleToggle(info.row.original.id, v)}
          className="data-[state=checked]:bg-[#16A34A]"
        />
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-[#71717A] hover:text-[#18181B]"
            onClick={() => copyCode(info.row.original.code)}
          >
            <Copy size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#71717A] hover:text-[#DC2626]">
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: discounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-[24px] font-bold text-[#18181B] tracking-tight">Descuentos</h2>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#71717A]">
          <span>Admin</span>
          <span>/</span>
          <span className="text-[#18181B]">Descuentos</span>
        </div>
      </div>

      {/* CREATE DISCOUNT CARD */}
      <Card className="border-[#E4E4E7] shadow-sm overflow-hidden">
        <CardHeader className="p-6 border-b border-[#F4F4F5]">
          <CardTitle className="text-[16px] font-bold text-[#18181B]">Crear nuevo código</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[13px] font-bold">Código</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ej: VERANO2024" 
                    className="h-10 font-mono uppercase font-bold"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                  <Button 
                    variant="outline" 
                    className="h-10 gap-2 text-[11px] font-bold uppercase tracking-wider border-[#E4E4E7]"
                    onClick={handleGenerateCode}
                  >
                    <RefreshCw size={14} />
                    Generar
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[13px] font-bold">Tipo de descuento</Label>
                <RadioGroup 
                  value={type} 
                  onValueChange={(v: any) => setType(v as "percentage" | "fixed")}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage" className="text-[13px] font-medium cursor-pointer">Porcentaje (%)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="text-[13px] font-medium cursor-pointer">Monto fijo ($)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold">Valor</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]">
                      {type === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                    </div>
                    <Input 
                      type="number" 
                      className="h-10 pl-8" 
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold">Mínimo de compra</Label>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]">
                        <DollarSign size={14} />
                      </div>
                      <Input 
                        type="number" 
                        className="h-10 pl-8" 
                        disabled={!hasMinPurchase}
                        value={minPurchase}
                        onChange={(e) => setMinPurchase(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="no-min" 
                        checked={!hasMinPurchase} 
                        onCheckedChange={(v) => setHasMinPurchase(!v)} 
                      />
                      <Label htmlFor="no-min" className="text-[12px] text-[#71717A]">Sin mínimo</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold">Usos máximos</Label>
                  <div className="flex flex-col gap-2">
                    <Input 
                      type="number" 
                      className="h-10" 
                      disabled={!hasMaxUses}
                      value={maxUses}
                      onChange={(e) => setMaxUses(Number(e.target.value))}
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="no-limit" 
                        checked={!hasMaxUses} 
                        onCheckedChange={(v) => setHasMaxUses(!v)} 
                      />
                      <Label htmlFor="no-limit" className="text-[12px] text-[#71717A]">Sin límite</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold">Vencimiento</Label>
                  <div className="flex flex-col gap-2">
                    <Input 
                      type="date" 
                      className="h-10" 
                      disabled={!hasExpiry}
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="no-expiry" 
                        checked={!hasExpiry} 
                        onCheckedChange={(v) => setHasExpiry(!v)} 
                      />
                      <Label htmlFor="no-expiry" className="text-[12px] text-[#71717A]">Sin vencimiento</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-bold">Aplicable a</Label>
                <Select value={applicableTo} onValueChange={(v) => v && setApplicableTo(v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar alcance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo el sitio</SelectItem>
                    <SelectItem value="category">Categoría específica</SelectItem>
                    <SelectItem value="product">Producto específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  className="h-11 px-8 bg-[#0D0D0D] text-white font-bold uppercase tracking-widest text-[12px]"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creando...' : 'Crear código'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DISCOUNTS TABLE */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F4F4F5]">
          <h3 className="text-[14px] font-bold text-[#18181B]">Códigos activos</h3>
        </div>
        <Table>
          <TableHeader className="bg-[#F9F9FB]">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-[#F4F4F5]">
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="h-12 px-4">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="h-16 animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j} className="px-4">
                      <div className="h-4 bg-[#F4F4F5] rounded w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="h-16 hover:bg-[#F9F9FB] border-b border-[#F4F4F5] transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-[#71717A] text-[13px]">
                  No hay códigos de descuento creados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
