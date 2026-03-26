'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';

const CATEGORIES = ['Todos', 'Pedidos', 'Envíos', 'Pagos', 'Devoluciones', 'Productos'];

const FAQS = [
  // Pedidos
  { id: '1', category: 'Pedidos', question: '¿Cómo puedo hacer un seguimiento de mi pedido?', answer: 'Una vez que tu pedido sea despachado, recibirás un correo electrónico con el número de seguimiento y un enlace para rastrearlo en la página del correo.' },
  { id: '2', category: 'Pedidos', question: '¿Puedo modificar o cancelar mi pedido?', answer: 'Puedes cancelar tu pedido dentro de las primeras 2 horas de haberlo realizado, contactando a nuestro servicio de atención al cliente. Una vez procesado, no es posible modificarlo.' },
  { id: '3', category: 'Pedidos', question: '¿Qué hago si recibo un artículo incorrecto?', answer: 'Si recibes un artículo que no pediste, por favor contáctanos inmediatamente a hola@arkade.com con tu número de pedido y fotos del producto recibido.' },
  { id: '4', category: 'Pedidos', question: '¿Tienen tienda física?', answer: 'Actualmente operamos exclusivamente de forma online. Esto nos permite ofrecerte los mejores precios y envíos a todo el país.' },
  { id: '5', category: 'Pedidos', question: '¿Cómo sé si mi pedido fue confirmado?', answer: 'Recibirás un correo electrónico de confirmación con los detalles de tu compra inmediatamente después de realizar el pago.' },
  
  // Envíos
  { id: '6', category: 'Envíos', question: '¿Cuánto tarda en llegar mi pedido?', answer: 'Los envíos a CABA y GBA demoran entre 24 y 48 horas hábiles. Para el interior del país, el tiempo estimado es de 3 a 5 días hábiles.' },
  { id: '7', category: 'Envíos', question: '¿Cuál es el costo de envío?', answer: 'El envío es gratuito para compras superiores a $150.000 ARS. Para compras menores, el costo estándar es de $4.500 ARS en CABA/GBA y $6.500 ARS en el interior.' },
  { id: '8', category: 'Envíos', question: '¿Hacen envíos internacionales?', answer: 'Por el momento, solo realizamos envíos dentro del territorio argentino.' },
  { id: '9', category: 'Envíos', question: '¿Qué pasa si no estoy en casa cuando llega el pedido?', answer: 'El correo realizará hasta dos visitas. Si no te encuentran, el paquete será enviado a la sucursal más cercana para que lo retires en un plazo de 5 días hábiles.' },
  { id: '10', category: 'Envíos', question: '¿Puedo retirar mi pedido en persona?', answer: 'No, actualmente no contamos con puntos de retiro físico. Todos nuestros pedidos se envían a domicilio o a sucursal de correo.' },

  // Pagos
  { id: '11', category: 'Pagos', question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos tarjetas de crédito y débito (Visa, MasterCard, American Express), Mercado Pago, y transferencia bancaria (con 10% de descuento).' },
  { id: '12', category: 'Pagos', question: '¿Es seguro comprar en ARKADE?', answer: 'Sí, nuestra plataforma utiliza encriptación SSL para proteger tus datos personales y financieros. No almacenamos la información de tu tarjeta.' },
  { id: '13', category: 'Pagos', question: '¿Ofrecen cuotas sin interés?', answer: 'Sí, ofrecemos 3 y 6 cuotas sin interés con tarjetas de crédito bancarizadas en compras superiores a $100.000 ARS.' },
  { id: '14', category: 'Pagos', question: '¿Puedo pagar con dos tarjetas diferentes?', answer: 'Actualmente nuestro sistema solo permite un método de pago por transacción.' },
  { id: '15', category: 'Pagos', question: '¿Emiten factura A?', answer: 'Sí, emitimos factura A y B. Puedes solicitar tu factura A durante el proceso de checkout ingresando tu CUIT.' },

  // Devoluciones
  { id: '16', category: 'Devoluciones', question: '¿Cuál es el plazo para realizar un cambio?', answer: 'Tienes 30 días corridos desde la recepción de tu pedido para solicitar un cambio o devolución.' },
  { id: '17', category: 'Devoluciones', question: '¿Los cambios tienen costo?', answer: 'El primer cambio es gratuito. Si deseas realizar un segundo cambio del mismo pedido, el costo de envío correrá por tu cuenta.' },
  { id: '18', category: 'Devoluciones', question: '¿Cómo solicito un reembolso?', answer: 'Para solicitar un reembolso, debes iniciar el proceso de devolución desde tu cuenta. Una vez que recibamos y verifiquemos el producto, el reembolso se procesará en un plazo de 5 a 10 días hábiles.' },
  { id: '19', category: 'Devoluciones', question: '¿Qué artículos no tienen cambio?', answer: 'Por cuestiones de higiene, no aceptamos cambios ni devoluciones de ropa interior, trajes de baño o aros, a menos que presenten un defecto de fábrica.' },
  { id: '20', category: 'Devoluciones', question: '¿Puedo cambiar un artículo de Sale?', answer: 'Los artículos adquiridos en la sección "Sale" o con descuentos especiales solo pueden cambiarse por talle o color del mismo modelo, sujetos a disponibilidad.' },

  // Productos
  { id: '21', category: 'Productos', question: '¿Cómo sé cuál es mi talle?', answer: 'Te recomendamos consultar nuestra Guía de Tallas, disponible en la página de cada producto y en el pie de página, donde encontrarás las medidas exactas de cada prenda.' },
  { id: '22', category: 'Productos', question: '¿Reponen el stock de artículos agotados?', answer: 'Depende de la colección. Los artículos de temporada suelen tener stock limitado, mientras que los básicos se reponen regularmente. Puedes suscribirte a las alertas de stock en la página del producto.' },
  { id: '23', category: 'Productos', question: '¿Dónde se fabrican sus prendas?', answer: 'Trabajamos con talleres especializados en Argentina y talleres éticos en el exterior, priorizando siempre la calidad de los materiales y las condiciones laborales justas.' },
  { id: '24', category: 'Productos', question: '¿Cómo debo cuidar mis prendas ARKADE?', answer: 'Cada prenda incluye una etiqueta con instrucciones de cuidado específicas. También puedes consultar nuestra sección "Cuidado de Prendas" para consejos detallados por material.' },
  { id: '25', category: 'Productos', question: '¿Los colores de las fotos son exactos?', answer: 'Hacemos nuestro mejor esfuerzo para mostrar los colores con la mayor precisión posible. Sin embargo, debido a las variaciones en las pantallas, el color real puede diferir ligeramente.' }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'Todos' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-light text-[#0D0D0D] mb-6">
            Preguntas Frecuentes
          </h1>
          <p className="text-[#8C8680] font-body text-lg max-w-2xl mx-auto">
            Encuentra respuestas rápidas a las dudas más comunes sobre nuestros productos, envíos y políticas.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-2xl mx-auto mb-12"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8C8680]">
            <Search size={20} strokeWidth={1.5} />
          </div>
          <input
            type="text"
            placeholder="Buscar una pregunta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E8E4E0] rounded-full py-4 pl-12 pr-6 outline-none focus:border-[#0D0D0D] transition-colors font-body text-[#0D0D0D]"
          />
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex overflow-x-auto hide-scrollbar gap-4 mb-12 pb-2 justify-start md:justify-center"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-label uppercase tracking-widest whitespace-nowrap px-6 py-3 rounded-full transition-colors ${
                activeCategory === cat 
                  ? 'bg-[#0D0D0D] text-white' 
                  : 'bg-white border border-[#E8E4E0] text-[#8C8680] hover:border-[#0D0D0D] hover:text-[#0D0D0D]'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 text-[#8C8680] font-body">
              No encontramos resultados para &quot;{searchQuery}&quot;.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
