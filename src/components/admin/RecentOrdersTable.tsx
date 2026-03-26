'use client'

import React from 'react';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable 
} from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatusBadge, OrderStatus } from './StatusBadge';
import Link from 'next/link';

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  products: string;
  total: number;
  status: OrderStatus;
  createdAt: any;
}

const columnHelper = createColumnHelper<OrderRow>();

const columns = [
  columnHelper.accessor('orderNumber', {
    header: '# Pedido',
    cell: info => <span className="font-mono text-[13px] text-[#18181B]">{info.getValue()}</span>,
  }),
  columnHelper.accessor('customerName', {
    header: 'Cliente',
    cell: info => (
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-[#18181B]">{info.getValue()}</span>
        <span className="text-[11px] text-[#71717A]">{info.row.original.customerEmail}</span>
      </div>
    ),
  }),
  columnHelper.accessor('products', {
    header: 'Productos',
    cell: info => <span className="text-[13px] text-[#71717A]">{info.getValue()}</span>,
  }),
  columnHelper.accessor('total', {
    header: 'Total',
    cell: info => <span className="text-[13px] font-semibold text-[#18181B]">${info.getValue().toLocaleString('es-AR')}</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Estado',
    cell: info => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor('createdAt', {
    header: 'Fecha',
    cell: info => {
      const date = info.getValue()?.toDate?.() || new Date(info.getValue());
      return (
        <span className="text-[13px] text-[#71717A]">
          {formatDistanceToNow(date, { addSuffix: true, locale: es })}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Acción',
    cell: info => (
      <Link 
        href={`/admin/pedidos/${info.row.original.id}`}
        className="text-[12px] font-bold text-[#0D0D0D] hover:underline"
      >
        Ver →
      </Link>
    ),
  }),
];

export function RecentOrdersTable({ data }: { data: OrderRow[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="p-4 border-b border-[#E4E4E7] flex justify-between items-center bg-[#F9F9FB]">
        <h3 className="text-[14px] font-bold text-[#18181B] uppercase tracking-wider">Últimos pedidos</h3>
        <Link 
          href="/admin/pedidos"
          className="text-[11px] font-bold text-[#71717A] hover:text-[#18181B] transition-colors uppercase tracking-widest"
        >
          Ver todos →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-[#F9F9F9] border-b border-[#E4E4E7]">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="h-[52px] border-b border-[#F4F4F5] hover:bg-[#FAFAFA] transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
