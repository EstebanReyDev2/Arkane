'use client'

import React from 'react';
import { AlertCircle, Clock, Package, UserPlus } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

interface ActivityEvent {
  id: string;
  type: 'order' | 'user' | 'stock' | 'product';
  text: string;
  time: string;
}

interface AlertsRowProps {
  lowStock: LowStockProduct[];
  activity: ActivityEvent[];
}

export function AlertsRow({ lowStock, activity }: AlertsRowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LOW STOCK ALERT */}
      <div className="bg-white p-6 rounded-lg border border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-[#DC2626]" />
          <h3 className="text-[14px] font-bold text-[#18181B] uppercase tracking-wider">Stock bajo</h3>
        </div>
        <div className="space-y-3">
          {lowStock.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-md">
              <div className="flex items-center gap-3">
                <Package size={14} className="text-[#DC2626]" />
                <span className="text-[13px] font-medium text-[#991B1B]">{product.name}</span>
              </div>
              <span className="text-[12px] font-bold text-[#DC2626] uppercase tracking-wider">
                Quedan {product.stock}
              </span>
            </div>
          ))}
          {lowStock.length === 0 && (
            <div className="text-center py-4 text-[#71717A] text-[13px]">
              No hay productos con stock bajo.
            </div>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITY TIMELINE */}
      <div className="bg-white p-6 rounded-lg border border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-[#18181B]" />
          <h3 className="text-[14px] font-bold text-[#18181B] uppercase tracking-wider">Actividad reciente</h3>
        </div>
        <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E4E4E7]">
          {activity.map((event) => (
            <div key={event.id} className="relative pl-8 flex flex-col gap-1">
              <div className={cn(
                "absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center",
                event.type === 'order' ? "bg-[#3B82F6]" : 
                event.type === 'user' ? "bg-[#10B981]" : "bg-[#F59E0B]"
              )}>
                {event.type === 'order' && <Package size={8} className="text-white" />}
                {event.type === 'user' && <UserPlus size={8} className="text-white" />}
                {event.type === 'stock' && <AlertCircle size={8} className="text-white" />}
              </div>
              <span className="text-[13px] text-[#18181B] font-medium leading-tight">{event.text}</span>
              <span className="text-[11px] text-[#71717A]">{event.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
