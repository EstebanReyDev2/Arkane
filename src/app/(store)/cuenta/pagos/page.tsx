'use client';

import { CreditCard, Plus } from 'lucide-react';
import { AccountLayout } from '@/src/components/account/AccountLayout';

export default function PaymentsPage() {
  return (
    <AccountLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-display text-[#0D0D0D]">Métodos de Pago</h2>
          
          <button className="flex items-center gap-2 border border-[#0D0D0D] text-[#0D0D0D] px-6 py-3 text-xs font-label uppercase tracking-widest hover:bg-[#0D0D0D] hover:text-white transition-colors">
            <Plus size={16} />
            Agregar método
          </button>
        </div>

        <div className="border border-[#E8E4E0] rounded-[2px] p-12 text-center flex flex-col items-center justify-center">
          <CreditCard size={48} className="text-[#C8C2BC] mb-6" strokeWidth={1} />
          <p className="text-[#8C8680] font-body mb-2 text-lg">No tenés métodos de pago guardados</p>
          <p className="text-sm text-[#8C8680] font-body mb-8">Agregá una tarjeta para agilizar tus próximas compras.</p>
          <button className="border border-[#0D0D0D] text-[#0D0D0D] px-8 py-4 text-xs font-label uppercase tracking-widest hover:bg-[#0D0D0D] hover:text-white transition-colors">
            Agregar nueva tarjeta
          </button>
        </div>
      </div>
    </AccountLayout>
  );
}
