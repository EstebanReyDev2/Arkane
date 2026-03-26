'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronDown, ChevronUp, Lock, CreditCard } from 'lucide-react';
import { useCartStore } from '@/src/lib/store/cartStore';
import { db } from '@/src/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const checkoutSchema = z.object({
  email: z.string().email('Email inválido'),
  newsletter: z.boolean().optional(),
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  address: z.string().min(5, 'Dirección requerida'),
  apartment: z.string().optional(),
  province: z.string().min(2, 'Provincia requerida'),
  zipCode: z.string().min(4, 'CP requerido'),
  city: z.string().min(2, 'Ciudad requerida'),
  phone: z.string().min(8, 'Teléfono requerido'),
  shippingMethod: z.enum(['standard', 'express', 'pickup']),
  paymentMethod: z.enum(['credit_card', 'mercado_pago', 'transfer']),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  installments: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === 'credit_card') {
    if (!data.cardNumber || data.cardNumber.length < 15) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Número de tarjeta inválido', path: ['cardNumber'] });
    }
    if (!data.cardName || data.cardName.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nombre requerido', path: ['cardName'] });
    }
    if (!data.cardExpiry || data.cardExpiry.length < 5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'MM/AA requerido', path: ['cardExpiry'] });
    }
    if (!data.cardCvv || data.cardCvv.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CVV requerido', path: ['cardCvv'] });
    }
  }
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: {
      newsletter: true,
      shippingMethod: 'standard',
      paymentMethod: 'credit_card',
      installments: '1',
    },
  });

  const shippingMethod = watch('shippingMethod');
  const paymentMethod = watch('paymentMethod');

  const getShippingCost = () => {
    if (shippingMethod === 'express') return 2500;
    return 0; // standard and pickup are free
  };

  const finalTotal = totalPrice() + getShippingCost();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  const handleNextStep = async (targetStep: 2 | 3) => {
    let fieldsToValidate: any[] = [];
    if (targetStep === 2) {
      fieldsToValidate = ['email', 'firstName', 'lastName', 'address', 'province', 'zipCode', 'city', 'phone'];
    } else if (targetStep === 3) {
      fieldsToValidate = ['shippingMethod'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const orderData = {
        customerInfo: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        },
        shippingAddress: {
          address: data.address,
          apartment: data.apartment || '',
          city: data.city,
          province: data.province,
          zipCode: data.zipCode,
        },
        shippingMethod: data.shippingMethod,
        paymentMethod: data.paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          image: item.image,
        })),
        subtotal: totalPrice(),
        shippingCost: getShippingCost(),
        total: finalTotal,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      router.push(`/pedido-confirmado/${docRef.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      setIsSubmitting(false);
    }
  };

  const InputField = ({ label, name, type = 'text', placeholder = '', width = 'w-full', maxLength }: any) => {
    const error = errors[name as keyof CheckoutFormValues];
    const value = watch(name as keyof CheckoutFormValues);
    const isSuccess = value && !error && value.toString().length > 0;

    return (
      <div className={`flex flex-col gap-2 ${width}`}>
        <label className="text-sm font-body text-[#0D0D0D]">{label}</label>
        <div className="relative">
          <input
            {...register(name as keyof CheckoutFormValues)}
            type={type}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`w-full h-12 px-4 border rounded-[2px] font-body text-[15px] outline-none transition-colors ${
              error ? 'border-red-500 focus:border-red-500' : 
              isSuccess ? 'border-green-500 focus:border-green-500' : 
              'border-[#E8E4E0] focus:border-[#0D0D0D]'
            }`}
          />
          {isSuccess && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
              <Check size={16} />
            </div>
          )}
        </div>
        {error && <span className="text-xs text-red-500 font-body">{error.message as string}</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simplified Header */}
      <header className="w-full border-b border-[#E8E4E0] bg-white py-6 flex justify-center sticky top-0 z-50">
        <Link href="/" className="text-2xl font-display tracking-widest uppercase text-[#0D0D0D]">
          ARKADE
        </Link>
      </header>

      <div className="flex-grow flex flex-col lg:flex-row max-w-[1440px] mx-auto w-full">
        {/* Mobile Order Summary Toggle */}
        <div className="lg:hidden w-full bg-[#F2EDE8] border-b border-[#E8E4E0]">
          <button 
            onClick={() => setShowSummary(!showSummary)}
            className="w-full px-6 py-4 flex items-center justify-between text-[#0D0D0D] font-body text-sm"
          >
            <span className="flex items-center gap-2 text-[#C4714A]">
              {showSummary ? 'Ocultar resumen' : 'Mostrar resumen'}
              {showSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
            <span className="font-medium text-lg">{formatPrice(finalTotal)}</span>
          </button>
          
          <AnimatePresence>
            {showSummary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-6 pb-6"
              >
                {/* Cart Items Mobile */}
                <div className="space-y-4 mb-6 pt-4 border-t border-[#E8E4E0]">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                      <div className="relative w-16 aspect-[3/4] bg-white border border-[#E8E4E0] rounded-[2px] overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        <div className="absolute -top-2 -right-2 bg-[#8C8680] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center z-10">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-grow flex flex-col justify-center">
                        <h4 className="text-sm font-medium text-[#0D0D0D] font-body">{item.name}</h4>
                        <p className="text-xs text-[#8C8680] font-body">{item.color} / {item.size}</p>
                      </div>
                      <div className="flex flex-col justify-center text-right">
                        <span className="text-sm font-medium text-[#0D0D0D] font-body">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Totals Mobile */}
                <div className="space-y-2 text-sm font-body border-t border-[#E8E4E0] pt-4">
                  <div className="flex justify-between text-[#8C8680]">
                    <span>Subtotal</span>
                    <span className="text-[#0D0D0D]">{formatPrice(totalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-[#8C8680]">
                    <span>Envío</span>
                    <span className="text-[#0D0D0D]">{getShippingCost() === 0 ? 'Gratis' : formatPrice(getShippingCost())}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Left Column - Form */}
        <div className="w-full lg:w-[60%] px-6 md:px-12 py-12 lg:py-16 lg:border-r border-[#E8E4E0]">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-12 font-label text-xs uppercase tracking-widest">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#0D0D0D]' : 'text-[#8C8680]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-[#0D0D0D] bg-[#0D0D0D] text-white' : 'border-[#C8C2BC]'}`}>1</span>
              <span className="hidden md:inline">Datos</span>
            </div>
            <span className="text-[#C8C2BC]">→</span>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#0D0D0D]' : 'text-[#8C8680]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-[#0D0D0D] bg-[#0D0D0D] text-white' : 'border-[#C8C2BC]'}`}>2</span>
              <span className="hidden md:inline">Envío</span>
            </div>
            <span className="text-[#C8C2BC]">→</span>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#0D0D0D]' : 'text-[#8C8680]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${step >= 3 ? 'border-[#0D0D0D] bg-[#0D0D0D] text-white' : 'border-[#C8C2BC]'}`}>3</span>
              <span className="hidden md:inline">Pago</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto">
            {/* STEP 1: Datos */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="mb-10">
                  <div className="flex gap-4 mb-6">
                    <button type="button" className="flex-1 h-12 bg-[#0D0D0D] text-white rounded-[2px] font-body text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90">
                      G Pay
                    </button>
                    <button type="button" className="flex-1 h-12 bg-[#009EE3] text-white rounded-[2px] font-body text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90">
                      Mercado Pago
                    </button>
                  </div>
                  
                  <div className="relative flex items-center py-5">
                    <div className="flex-grow border-t border-[#E8E4E0]"></div>
                    <span className="flex-shrink-0 mx-4 text-[#8C8680] text-sm font-body">o completá manualmente</span>
                    <div className="flex-grow border-t border-[#E8E4E0]"></div>
                  </div>
                </div>

                <div className="mb-10">
                  <div className="flex justify-between items-end mb-6">
                    <h2 className="text-xl font-display text-[#0D0D0D]">Información de contacto</h2>
                    <Link href="/cuenta/login" className="text-sm text-[#C4714A] hover:underline font-body">¿Ya tenés cuenta? Iniciá sesión</Link>
                  </div>
                  
                  <InputField label="Email" name="email" type="email" />
                  
                  <div className="mt-4 flex items-center gap-3">
                    <input type="checkbox" id="newsletter" {...register('newsletter')} className="w-5 h-5 border-[#E8E4E0] rounded-[2px] accent-[#0D0D0D]" />
                    <label htmlFor="newsletter" className="text-sm font-body text-[#8C8680]">Recibir novedades y ofertas exclusivas</label>
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-xl font-display text-[#0D0D0D] mb-6">Dirección de envío</h2>
                  
                  <div className="flex flex-col gap-6">
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
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button 
                    type="button" 
                    onClick={() => handleNextStep(2)}
                    className="bg-[#0D0D0D] text-white px-8 py-4 text-xs font-label uppercase tracking-widest hover:bg-[#333333] transition-colors"
                  >
                    Continuar al envío →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Envío */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-display text-[#0D0D0D] mb-6">Método de envío</h2>
                
                <div className="space-y-4 mb-10">
                  <label className={`flex items-center justify-between p-4 border rounded-[2px] cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'border-[#0D0D0D] bg-[#FAFAFA]' : 'border-[#E8E4E0] hover:border-[#C8C2BC]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${shippingMethod === 'standard' ? 'border-[#0D0D0D]' : 'border-[#C8C2BC]'}`}>
                        {shippingMethod === 'standard' && <div className="w-2.5 h-2.5 bg-[#0D0D0D] rounded-full" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body text-[15px] text-[#0D0D0D]">Envío estándar</span>
                        <span className="font-body text-xs text-[#8C8680]">3 a 5 días hábiles</span>
                      </div>
                    </div>
                    <span className="font-body text-[15px] font-medium text-[#0D0D0D]">GRATIS</span>
                    <input type="radio" value="standard" {...register('shippingMethod')} className="hidden" />
                  </label>

                  <label className={`flex items-center justify-between p-4 border rounded-[2px] cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-[#0D0D0D] bg-[#FAFAFA]' : 'border-[#E8E4E0] hover:border-[#C8C2BC]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${shippingMethod === 'express' ? 'border-[#0D0D0D]' : 'border-[#C8C2BC]'}`}>
                        {shippingMethod === 'express' && <div className="w-2.5 h-2.5 bg-[#0D0D0D] rounded-full" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body text-[15px] text-[#0D0D0D]">Envío express</span>
                        <span className="font-body text-xs text-[#8C8680]">24hs hábiles</span>
                      </div>
                    </div>
                    <span className="font-body text-[15px] font-medium text-[#0D0D0D]">$2.500</span>
                    <input type="radio" value="express" {...register('shippingMethod')} className="hidden" />
                  </label>

                  <label className={`flex items-center justify-between p-4 border rounded-[2px] cursor-pointer transition-colors ${shippingMethod === 'pickup' ? 'border-[#0D0D0D] bg-[#FAFAFA]' : 'border-[#E8E4E0] hover:border-[#C8C2BC]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${shippingMethod === 'pickup' ? 'border-[#0D0D0D]' : 'border-[#C8C2BC]'}`}>
                        {shippingMethod === 'pickup' && <div className="w-2.5 h-2.5 bg-[#0D0D0D] rounded-full" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body text-[15px] text-[#0D0D0D]">Retiro en tienda</span>
                        <span className="font-body text-xs text-[#8C8680]">Av. Santa Fe 1234, CABA</span>
                      </div>
                    </div>
                    <span className="font-body text-[15px] font-medium text-[#0D0D0D]">GRATIS</span>
                    <input type="radio" value="pickup" {...register('shippingMethod')} className="hidden" />
                  </label>
                </div>

                <div className="flex justify-between items-center mt-8">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="text-[#8C8680] hover:text-[#0D0D0D] font-body text-sm transition-colors"
                  >
                    ← Volver a datos
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleNextStep(3)}
                    className="bg-[#0D0D0D] text-white px-8 py-4 text-xs font-label uppercase tracking-widest hover:bg-[#333333] transition-colors"
                  >
                    Continuar al pago →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Pago */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-display text-[#0D0D0D] mb-6">Información de pago</h2>
                
                <div className="border border-[#E8E4E0] rounded-[2px] mb-10 overflow-hidden">
                  {/* Credit Card */}
                  <div className={`border-b border-[#E8E4E0] ${paymentMethod === 'credit_card' ? 'bg-[#FAFAFA]' : 'bg-white'}`}>
                    <label className="flex items-center p-4 cursor-pointer">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${paymentMethod === 'credit_card' ? 'border-[#0D0D0D]' : 'border-[#C8C2BC]'}`}>
                        {paymentMethod === 'credit_card' && <div className="w-2.5 h-2.5 bg-[#0D0D0D] rounded-full" />}
                      </div>
                      <span className="font-body text-[15px] text-[#0D0D0D] flex-grow">Tarjeta de crédito/débito</span>
                      <CreditCard size={20} className="text-[#8C8680]" />
                      <input type="radio" value="credit_card" {...register('paymentMethod')} className="hidden" />
                    </label>
                    
                    <AnimatePresence>
                      {paymentMethod === 'credit_card' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="p-4 pt-0 space-y-4">
                            <InputField label="Número de tarjeta" name="cardNumber" placeholder="0000 0000 0000 0000" maxLength={19} />
                            <InputField label="Nombre en la tarjeta" name="cardName" />
                            <div className="flex gap-4">
                              <InputField label="Vencimiento (MM/AA)" name="cardExpiry" width="w-1/2" placeholder="MM/AA" maxLength={5} />
                              <InputField label="Código de seguridad" name="cardCvv" width="w-1/2" placeholder="CVV" maxLength={4} />
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-4">
                              <label className="text-sm font-body text-[#0D0D0D]">Cuotas</label>
                              <select {...register('installments')} className="w-full h-12 px-4 border border-[#E8E4E0] rounded-[2px] font-body text-[15px] outline-none bg-white focus:border-[#0D0D0D]">
                                <option value="1">1 cuota de {formatPrice(finalTotal)}</option>
                                <option value="3">3 cuotas de {formatPrice(finalTotal / 3)} s/i</option>
                                <option value="6">6 cuotas de {formatPrice(finalTotal / 6)}</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mercado Pago */}
                  <div className={`border-b border-[#E8E4E0] ${paymentMethod === 'mercado_pago' ? 'bg-[#FAFAFA]' : 'bg-white'}`}>
                    <label className="flex items-center p-4 cursor-pointer">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${paymentMethod === 'mercado_pago' ? 'border-[#0D0D0D]' : 'border-[#C8C2BC]'}`}>
                        {paymentMethod === 'mercado_pago' && <div className="w-2.5 h-2.5 bg-[#0D0D0D] rounded-full" />}
                      </div>
                      <span className="font-body text-[15px] text-[#0D0D0D]">Mercado Pago</span>
                      <input type="radio" value="mercado_pago" {...register('paymentMethod')} className="hidden" />
                    </label>
                    <AnimatePresence>
                      {paymentMethod === 'mercado_pago' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="p-4 pt-0 text-sm text-[#8C8680] font-body text-center py-6">
                            Serás redirigido a Mercado Pago para completar tu compra de forma segura.
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Transferencia */}
                  <div className={`${paymentMethod === 'transfer' ? 'bg-[#FAFAFA]' : 'bg-white'}`}>
                    <label className="flex items-center p-4 cursor-pointer">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${paymentMethod === 'transfer' ? 'border-[#0D0D0D]' : 'border-[#C8C2BC]'}`}>
                        {paymentMethod === 'transfer' && <div className="w-2.5 h-2.5 bg-[#0D0D0D] rounded-full" />}
                      </div>
                      <span className="font-body text-[15px] text-[#0D0D0D]">Transferencia bancaria (10% OFF)</span>
                      <input type="radio" value="transfer" {...register('paymentMethod')} className="hidden" />
                    </label>
                    <AnimatePresence>
                      {paymentMethod === 'transfer' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="p-4 pt-0 text-sm text-[#8C8680] font-body bg-[#F5F2ED] m-4 rounded-[2px]">
                            <p className="mb-2">Realizá la transferencia a la siguiente cuenta:</p>
                            <p className="font-medium text-[#0D0D0D]">CBU: 0000000000000000000000</p>
                            <p className="font-medium text-[#0D0D0D] mb-2">Alias: ARKADE.STORE</p>
                            <p className="text-xs">Una vez confirmado el pedido, te enviaremos las instrucciones por email.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-8 mb-6">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="text-[#8C8680] hover:text-[#0D0D0D] font-body text-sm transition-colors"
                  >
                    ← Volver a envío
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#0D0D0D] text-white text-xs font-label uppercase tracking-widest hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-[#8C8680]">
                  <Lock size={14} />
                  <span className="text-xs font-body">Pago 100% seguro y encriptado</span>
                </div>
              </motion.div>
            )}
          </form>
        </div>

        {/* Right Column - Order Summary (Desktop) */}
        <div className="hidden lg:block w-[40%] bg-[#FAFAFA] border-l border-[#E8E4E0] p-12">
          <div className="sticky top-32">
            <h2 className="text-xl font-display text-[#0D0D0D] mb-8">Resumen de pedido</h2>
            
            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                  <div className="relative w-16 aspect-[3/4] bg-[#F2EDE8] border border-[#E8E4E0] rounded-[2px] overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <div className="absolute -top-2 -right-2 bg-[#8C8680] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center z-10">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h4 className="text-sm font-medium text-[#0D0D0D] font-body">{item.name}</h4>
                    <p className="text-xs text-[#8C8680] font-body">{item.color} / {item.size}</p>
                  </div>
                  <div className="flex flex-col justify-center text-right">
                    <span className="text-sm font-medium text-[#0D0D0D] font-body">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8E4E0] pt-6 mb-6">
              <div className="flex gap-2">
                <input type="text" placeholder="Código de descuento" className="flex-grow h-12 px-4 border border-[#E8E4E0] rounded-[2px] font-body text-sm outline-none focus:border-[#0D0D0D]" />
                <button className="h-12 px-6 bg-[#E8E4E0] text-[#0D0D0D] font-label text-xs uppercase tracking-widest rounded-[2px] hover:bg-[#C8C2BC] transition-colors">
                  Aplicar
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm font-body border-t border-[#E8E4E0] pt-6 mb-6">
              <div className="flex justify-between text-[#8C8680]">
                <span>Subtotal</span>
                <span className="text-[#0D0D0D]">{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-[#8C8680]">
                <span>Envío</span>
                <span className="text-[#0D0D0D]">{getShippingCost() === 0 ? 'Gratis' : formatPrice(getShippingCost())}</span>
              </div>
            </div>

            <div className="border-t border-[#E8E4E0] pt-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-[#0D0D0D] font-body">Total</span>
                <div className="text-right">
                  <span className="text-xs text-[#8C8680] mr-2">ARS</span>
                  <span className="text-2xl font-display text-[#0D0D0D]">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
