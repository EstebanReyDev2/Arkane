'use client'

import React from 'react';
import { cn } from '@/src/lib/utils';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendiente', bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]' },
  confirmed: { label: 'Confirmado', bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]' },
  shipped: { label: 'Enviado', bg: 'bg-[#EDE9FE]', text: 'text-[#8B5CF6]' },
  delivered: { label: 'Entregado', bg: 'bg-[#F0FDF4]', text: 'text-[#7A9E87]' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
      config.bg,
      config.text,
      className
    )}>
      {config.label}
    </span>
  );
}
