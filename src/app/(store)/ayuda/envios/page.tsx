'use client';

import { motion } from 'motion/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import Link from 'next/link';

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-light text-[#0D0D0D] mb-6">
            Envíos y Devoluciones
          </h1>
          <p className="text-[#8C8680] font-body text-lg">
            Todo lo que necesitas saber sobre cómo recibir y devolver tus pedidos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Tiempos de envío</AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Nuestros tiempos de entrega varían según tu ubicación:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>CABA y GBA:</strong> 24 a 48 horas hábiles.</li>
                  <li><strong>Interior del país:</strong> 3 a 5 días hábiles.</li>
                  <li><strong>Zonas extendidas:</strong> Hasta 7 días hábiles.</li>
                </ul>
                <p className="mt-4 text-sm">
                  *Los tiempos se calculan a partir de la confirmación del pago. Durante períodos de alta demanda (Sale, Hot Sale, Cyber Monday), los envíos pueden sufrir demoras adicionales.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Costos de envío</AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Ofrecemos envío gratuito en compras superiores a un monto específico:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Envío Gratis:</strong> En compras superiores a $150.000 ARS.</li>
                  <li><strong>Envío Estándar (CABA/GBA):</strong> $4.500 ARS.</li>
                  <li><strong>Envío Estándar (Interior):</strong> $6.500 ARS.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Cómo hacer una devolución</AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Si no estás satisfecho con tu compra, puedes devolverla siguiendo estos pasos:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Inicia sesión en tu cuenta y ve a la sección &quot;Mis Pedidos&quot;.</li>
                  <li>Selecciona el pedido y haz clic en &quot;Solicitar Devolución&quot;.</li>
                  <li>Elige los artículos que deseas devolver y el motivo.</li>
                  <li>Recibirás una etiqueta de envío por correo electrónico.</li>
                  <li>Empaqueta los artículos en su estado original y adhiere la etiqueta.</li>
                  <li>Lleva el paquete a la sucursal de correo más cercana.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Política de cambios</AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Tienes <strong>30 días corridos</strong> desde la recepción de tu pedido para realizar cambios.
                </p>
                <p className="mb-4">
                  Condiciones para cambios:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Las prendas deben estar sin uso, sin lavar y con todas sus etiquetas originales.</li>
                  <li>El calzado debe ser devuelto en su caja original sin marcas de uso en la suela.</li>
                  <li>Por cuestiones de higiene, no se aceptan cambios de ropa interior ni trajes de baño.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Envíos internacionales</AccordionTrigger>
              <AccordionContent>
                <p>
                  Actualmente, nuestros envíos están limitados al territorio nacional (Argentina). Estamos trabajando para ofrecer envíos internacionales próximamente. Suscríbete a nuestro newsletter para recibir novedades.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <p className="text-[#8C8680] font-body mb-6">¿Tenés dudas adicionales?</p>
          <Link
            href="/ayuda/contacto"
            className="inline-block bg-[#0D0D0D] text-[#FAFAFA] px-8 py-4 font-label text-xs uppercase tracking-widest hover:bg-[#333333] transition-colors"
          >
            Contactanos →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
