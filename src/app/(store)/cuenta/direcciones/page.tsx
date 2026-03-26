'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { useAuthState, getUserData, updateUserProfile } from '@/src/lib/firebase/auth';
import { AccountLayout } from '@/src/components/account/AccountLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

const addressSchema = z.object({
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  address: z.string().min(5, 'Dirección requerida'),
  apartment: z.string().optional(),
  province: z.string().min(2, 'Provincia requerida'),
  zipCode: z.string().min(4, 'CP requerido'),
  city: z.string().min(2, 'Ciudad requerida'),
  phone: z.string().min(8, 'Teléfono requerido'),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const { user } = useAuthState();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      isDefault: false,
    },
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      try {
        const data = await getUserData(user.uid);
        if (data && data.addresses) {
          setAddresses(data.addresses);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const onSubmit = async (data: AddressFormValues) => {
    if (!user) return;

    try {
      let updatedAddresses = [...addresses];
      
      // If setting as default, remove default from others
      if (data.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
      }

      // If it's the first address, make it default automatically
      if (updatedAddresses.length === 0) {
        data.isDefault = true;
      }

      if (editingIndex !== null) {
        updatedAddresses[editingIndex] = data;
      } else {
        updatedAddresses.push(data);
      }

      await updateUserProfile(user.uid, { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setIsDialogOpen(false);
      reset();
      setEditingIndex(null);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleDelete = async (index: number) => {
    if (!user) return;
    try {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      // If we deleted the default address and there are others left, make the first one default
      if (addresses[index].isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }
      await updateUserProfile(user.uid, { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefault = async (index: number) => {
    if (!user || addresses[index].isDefault) return;
    try {
      const updatedAddresses = addresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index
      }));
      await updateUserProfile(user.uid, { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const openEditDialog = (index: number) => {
    setEditingIndex(index);
    const addr = addresses[index];
    Object.keys(addr).forEach((key) => {
      setValue(key as keyof AddressFormValues, addr[key]);
    });
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      reset();
      setEditingIndex(null);
    }
  };

  const InputField = ({ label, name, type = 'text', width = 'w-full' }: any) => {
    const error = errors[name as keyof AddressFormValues];
    return (
      <div className={`flex flex-col gap-2 ${width}`}>
        <label className="text-sm font-body text-[#0D0D0D]">{label}</label>
        <input
          {...register(name as keyof AddressFormValues)}
          type={type}
          className={`w-full h-12 px-4 border rounded-[2px] font-body text-[15px] outline-none transition-colors ${
            error ? 'border-red-500 focus:border-red-500' : 'border-[#E8E4E0] focus:border-[#0D0D0D]'
          }`}
        />
        {error && <span className="text-xs text-red-500 font-body">{error.message as string}</span>}
      </div>
    );
  };

  return (
    <AccountLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-display text-[#0D0D0D]">Mis Direcciones</h2>
          
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger className="flex items-center gap-2 border border-[#0D0D0D] text-[#0D0D0D] px-6 py-3 text-xs font-label uppercase tracking-widest hover:bg-[#0D0D0D] hover:text-white transition-colors">
              <Plus size={16} />
              Agregar nueva dirección
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white rounded-[2px]">
              <DialogHeader className="p-6 border-b border-[#E8E4E0] bg-[#FAFAFA]">
                <DialogTitle className="text-xl font-display text-[#0D0D0D]">
                  {editingIndex !== null ? 'Editar dirección' : 'Nueva dirección'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="flex gap-4">
                  <InputField label="Nombre" name="firstName" width="w-1/2" />
                  <InputField label="Apellido" name="lastName" width="w-1/2" />
                </div>
                
                <InputField label="Dirección (calle y número)" name="address" />
                <InputField label="Piso / Depto (Opcional)" name="apartment" />
                
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 w-1/2">
                    <label className="text-sm font-body text-[#0D0D0D]">Provincia</label>
                    <select {...register('province')} className={`w-full h-12 px-4 border rounded-[2px] font-body text-[15px] outline-none bg-white ${errors.province ? 'border-red-500' : 'border-[#E8E4E0] focus:border-[#0D0D0D]'}`}>
                      <option value="">Seleccionar...</option>
                      <option value="CABA">CABA</option>
                      <option value="Buenos Aires">Buenos Aires</option>
                      <option value="Córdoba">Córdoba</option>
                      <option value="Santa Fe">Santa Fe</option>
                      <option value="Mendoza">Mendoza</option>
                    </select>
                    {errors.province && <span className="text-xs text-red-500 font-body">{errors.province.message as string}</span>}
                  </div>
                  <InputField label="Código Postal" name="zipCode" width="w-1/2" />
                </div>
                
                <InputField label="Ciudad" name="city" />
                <InputField label="Teléfono" name="phone" type="tel" />
                
                <div className="flex items-center gap-3 mt-2">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    {...register('isDefault')}
                    className="w-5 h-5 border-[#E8E4E0] rounded-[2px] accent-[#0D0D0D]" 
                  />
                  <label htmlFor="isDefault" className="text-sm font-body text-[#8C8680]">
                    Establecer como dirección principal
                  </label>
                </div>

                <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-[#E8E4E0]">
                  <button 
                    type="button" 
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6 py-3 text-sm font-body text-[#8C8680] hover:text-[#0D0D0D] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-[#0D0D0D] text-white px-8 py-3 text-xs font-label uppercase tracking-widest hover:bg-[#333333] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar dirección'}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#E8E4E0] border-t-[#0D0D0D] rounded-full animate-spin"></div>
          </div>
        ) : addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr, index) => (
              <div key={index} className={`border rounded-[2px] p-6 relative flex flex-col ${addr.isDefault ? 'border-[#0D0D0D] bg-[#FAFAFA]' : 'border-[#E8E4E0]'}`}>
                {addr.isDefault && (
                  <div className="absolute top-0 right-0 bg-[#0D0D0D] text-white text-[10px] font-label uppercase tracking-widest px-3 py-1 rounded-bl-[2px]">
                    Principal
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 bg-[#F2EDE8] rounded-full flex items-center justify-center text-[#0D0D0D] flex-shrink-0 mt-1">
                    <MapPin size={20} strokeWidth={1.5} />
                  </div>
                  <div className="text-sm font-body text-[#8C8680] space-y-1">
                    <p className="font-medium text-[#0D0D0D] text-base mb-2">{addr.firstName} {addr.lastName}</p>
                    <p>{addr.address} {addr.apartment}</p>
                    <p>{addr.city}, {addr.province}</p>
                    <p>CP: {addr.zipCode}</p>
                    <p className="pt-2">Tel: {addr.phone}</p>
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-[#E8E4E0] flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => openEditDialog(index)}
                      className="text-xs font-label uppercase tracking-widest text-[#8C8680] hover:text-[#0D0D0D] flex items-center gap-1 transition-colors"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(index)}
                      className="text-xs font-label uppercase tracking-widest text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                  
                  {!addr.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(index)}
                      className="text-xs font-label uppercase tracking-widest text-[#0D0D0D] hover:underline flex items-center gap-1"
                    >
                      <Check size={14} /> Hacer principal
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[#E8E4E0] rounded-[2px] p-12 text-center flex flex-col items-center justify-center">
            <MapPin size={48} className="text-[#C8C2BC] mb-6" strokeWidth={1} />
            <p className="text-[#8C8680] font-body mb-8 text-lg">No tenés direcciones guardadas</p>
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="border border-[#0D0D0D] text-[#0D0D0D] px-8 py-4 text-xs font-label uppercase tracking-widest hover:bg-[#0D0D0D] hover:text-white transition-colors"
            >
              Agregar mi primera dirección
            </button>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
