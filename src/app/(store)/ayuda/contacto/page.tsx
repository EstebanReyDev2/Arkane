'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { Mail, Phone, Clock, Instagram, Twitter, Facebook } from 'lucide-react';

const contactSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  asunto: z.enum(['Pedido', 'Envío', 'Devolución', 'Producto', 'Otro'] as const, {
    message: 'Selecciona un asunto válido'
  }),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres')
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    reset();
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-24 pb-32">
        {/* Hero */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-[64px] font-display font-light text-[#0D0D0D] mb-6"
          >
            Contacto
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#8C8680] font-body text-lg max-w-2xl mx-auto"
          >
            Estamos para ayudarte. Completa el formulario o contáctanos directamente a través de nuestros canales de atención.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 max-w-5xl mx-auto">
          {/* Left Column: Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-display uppercase tracking-widest mb-8">Envíanos un mensaje</h2>
            
            {isSuccess ? (
              <div className="bg-[#F5F2ED] border border-[#E8E4E0] p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="font-display text-xl mb-2">Mensaje enviado</h3>
                <p className="text-[#8C8680] font-body text-sm">
                  Hemos recibido tu consulta. Te responderemos en un plazo máximo de 24 horas hábiles.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="nombre" className="block text-xs font-label uppercase tracking-widest text-[#8C8680] mb-2">
                    Nombre completo
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    {...register('nombre')}
                    className={`w-full bg-transparent border-b ${errors.nombre ? 'border-red-500' : 'border-[#E8E4E0] focus:border-[#0D0D0D]'} py-3 px-0 outline-none transition-colors font-body text-[#0D0D0D]`}
                    placeholder="Tu nombre"
                  />
                  {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-label uppercase tracking-widest text-[#8C8680] mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`w-full bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-[#E8E4E0] focus:border-[#0D0D0D]'} py-3 px-0 outline-none transition-colors font-body text-[#0D0D0D]`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="asunto" className="block text-xs font-label uppercase tracking-widest text-[#8C8680] mb-2">
                    Asunto
                  </label>
                  <select
                    id="asunto"
                    {...register('asunto')}
                    className={`w-full bg-transparent border-b ${errors.asunto ? 'border-red-500' : 'border-[#E8E4E0] focus:border-[#0D0D0D]'} py-3 px-0 outline-none transition-colors font-body text-[#0D0D0D] appearance-none`}
                  >
                    <option value="" disabled selected>Selecciona un asunto</option>
                    <option value="Pedido">Consulta sobre un pedido</option>
                    <option value="Envío">Información de envío</option>
                    <option value="Devolución">Cambios o devoluciones</option>
                    <option value="Producto">Consulta sobre un producto</option>
                    <option value="Otro">Otro motivo</option>
                  </select>
                  {errors.asunto && <p className="text-red-500 text-xs mt-1">{errors.asunto.message}</p>}
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-xs font-label uppercase tracking-widest text-[#8C8680] mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    {...register('mensaje')}
                    rows={5}
                    className={`w-full bg-transparent border-b ${errors.mensaje ? 'border-red-500' : 'border-[#E8E4E0] focus:border-[#0D0D0D]'} py-3 px-0 outline-none transition-colors font-body text-[#0D0D0D] resize-none`}
                    placeholder="¿En qué podemos ayudarte?"
                  />
                  {errors.mensaje && <p className="text-red-500 text-xs mt-1">{errors.mensaje.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0D0D0D] text-[#FAFAFA] py-4 font-label text-xs uppercase tracking-widest hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmitting ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Right Column: Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-2xl font-display uppercase tracking-widest mb-8">Información de contacto</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-[#8C8680]">
                    <Mail size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-label text-xs uppercase tracking-widest text-[#0D0D0D] mb-1">Email</h3>
                    <p className="font-body text-[#8C8680] text-sm">hola@arkade.com</p>
                    <p className="font-body text-[#8C8680] text-xs mt-1">Respondemos en 24hs hábiles</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 text-[#8C8680]">
                    <Phone size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-label text-xs uppercase tracking-widest text-[#0D0D0D] mb-1">WhatsApp</h3>
                    <p className="font-body text-[#8C8680] text-sm">+54 11 1234-5678</p>
                    <p className="font-body text-[#8C8680] text-xs mt-1">Solo mensajes de texto</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 text-[#8C8680]">
                    <Clock size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-label text-xs uppercase tracking-widest text-[#0D0D0D] mb-1">Horario de atención</h3>
                    <p className="font-body text-[#8C8680] text-sm">Lunes a Viernes</p>
                    <p className="font-body text-[#8C8680] text-sm">9:00 hs a 18:00 hs (ART)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#E8E4E0]">
              <h3 className="font-label text-xs uppercase tracking-widest text-[#0D0D0D] mb-6">Síguenos</h3>
              <div className="flex gap-6 text-[#8C8680]">
                <a href="#" className="hover:text-[#0D0D0D] transition-colors">
                  <Instagram size={24} strokeWidth={1.5} />
                </a>
                <a href="#" className="hover:text-[#0D0D0D] transition-colors">
                  <Twitter size={24} strokeWidth={1.5} />
                </a>
                <a href="#" className="hover:text-[#0D0D0D] transition-colors">
                  <Facebook size={24} strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
