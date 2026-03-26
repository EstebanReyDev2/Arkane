'use client'

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  subtext?: string;
  subtextHref?: string;
  iconBg?: string;
}

export function KpiCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  subtext,
  subtextHref,
  iconBg = 'bg-[#F4F4F5]'
}: KpiCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg border border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col gap-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold text-[#18181B]">{title}</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-[28px] font-bold text-[#18181B] tracking-tight">{value}</h3>
            {change && (
              <span className={cn(
                "text-[12px] font-bold",
                changeType === 'positive' ? "text-[#16A34A]" : 
                changeType === 'negative' ? "text-[#DC2626]" : "text-[#6B7280]"
              )}>
                {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'} {change}
              </span>
            )}
          </div>
        </div>
        <div className={cn("p-2.5 rounded-lg", iconBg)}>
          <Icon size={20} strokeWidth={1.5} className="text-[#18181B]" />
        </div>
      </div>
      
      {subtext && (
        <div className="pt-4 border-t border-[#F4F4F5]">
          {subtextHref ? (
            <a 
              href={subtextHref}
              className="text-[11px] text-[#71717A] hover:text-[#18181B] hover:underline transition-colors"
            >
              {subtext}
            </a>
          ) : (
            <span className="text-[11px] text-[#71717A]">{subtext}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
