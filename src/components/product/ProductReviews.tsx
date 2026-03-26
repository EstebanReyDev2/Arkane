'use client';

import { useState } from 'react';
import { Star, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { cn } from '@/src/lib/utils';

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  verified: boolean;
  useful: number;
}

const mockReviews: Review[] = [
  {
    id: '1',
    name: 'Valentina R.',
    rating: 5,
    date: '15 Mar 2026',
    title: 'Calidad excepcional',
    text: 'La tela es increíblemente suave y el corte es perfecto. Se nota que es una prenda de alta gama. El envío fue súper rápido.',
    verified: true,
    useful: 12
  },
  {
    id: '2',
    name: 'Mateo G.',
    rating: 4,
    date: '02 Mar 2026',
    title: 'Muy buen diseño',
    text: 'Me encanta el estilo, es muy versátil. La talla me quedó un poco justa, recomendaría pedir una más si preferís un calce más relajado.',
    verified: true,
    useful: 8
  },
  {
    id: '3',
    name: 'Sofía L.',
    rating: 5,
    date: '20 Feb 2026',
    title: 'Mi nueva prenda favorita',
    text: 'No me la saco más. El color es exactamente igual al de las fotos. Muy conforme con la compra.',
    verified: true,
    useful: 5
  },
  {
    id: '4',
    name: 'Julieta M.',
    rating: 4,
    date: '10 Feb 2026',
    title: 'Excelente atención',
    text: 'Tuve una duda con el talle y me respondieron enseguida por WhatsApp. La prenda es hermosa.',
    verified: true,
    useful: 3
  },
  {
    id: '5',
    name: 'Ignacio P.',
    rating: 3,
    date: '25 Ene 2026',
    title: 'Buena pero demoró el envío',
    text: 'La calidad es buena, pero el correo tardó más de lo esperado en entregar. Sacando eso, todo bien.',
    verified: true,
    useful: 2
  }
];

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', text: '' });

  const averageRating = 4.2;
  const totalReviews = 23;

  const ratingBars = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 10 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 }
  ];

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, reviews.length));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock save
    setTimeout(() => {
      const review: Review = {
        id: Date.now().toString(),
        name: 'Usuario Invitado',
        rating: newReview.rating,
        date: 'Hoy',
        title: newReview.title,
        text: newReview.text,
        verified: false,
        useful: 0
      };
      setReviews([review, ...reviews]);
      setIsSubmitting(false);
      setNewReview({ rating: 5, title: '', text: '' });
    }, 1000);
  };

  return (
    <section className="py-20 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <h2 className="text-3xl font-display uppercase tracking-widest text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
          Reseñas
        </h2>
        <Dialog>
          <DialogTrigger className="border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-all uppercase tracking-widest text-xs font-label px-6 py-3">
            Escribir una reseña
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#FAFAFA] border-[#E8E4E0]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display uppercase tracking-widest text-[#0D0D0D]">Tu opinión nos importa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitReview} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-label uppercase tracking-widest text-[#8C8680]">Calificación</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="text-[#0D0D0D] hover:scale-110 transition-transform"
                    >
                      <Star 
                        size={24} 
                        fill={star <= newReview.rating ? "#0D0D0D" : "transparent"} 
                        strokeWidth={1.5} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-label uppercase tracking-widest text-[#8C8680]">Título</Label>
                <Input 
                  id="title" 
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="Ej: Excelente calidad" 
                  className="rounded-none border-[#E8E4E0] focus:border-[#0D0D0D] bg-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-xs font-label uppercase tracking-widest text-[#8C8680]">Comentario</Label>
                <Textarea 
                  id="comment" 
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  placeholder="Contanos tu experiencia con el producto..." 
                  className="rounded-none border-[#E8E4E0] focus:border-[#0D0D0D] bg-white min-h-[120px]"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full rounded-none bg-[#0D0D0D] text-white hover:opacity-90 uppercase tracking-widest text-xs font-label h-12"
              >
                {isSubmitting ? 'Publicando...' : 'Publicar reseña'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-16">
        {/* Rating Overview */}
        <div className="space-y-8">
          <div className="bg-[#F2EDE8] p-8 rounded-[4px] space-y-4 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <span className="text-6xl font-display text-[#0D0D0D]">{averageRating}</span>
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={20} 
                      fill={star <= Math.floor(averageRating) ? "#0D0D0D" : "transparent"} 
                      strokeWidth={1.5} 
                      className="text-[#0D0D0D]"
                    />
                  ))}
                </div>
                <p className="text-xs font-label uppercase tracking-widest text-[#8C8680]">({totalReviews} reseñas)</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              {ratingBars.map((bar) => (
                <div key={bar.stars} className="flex items-center gap-4">
                  <span className="text-xs font-label text-[#0D0D0D] w-4">{bar.stars}★</span>
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${bar.percentage}%` }}
                      viewport={{ once: true }}
                      className="h-full bg-[#0D0D0D]"
                    />
                  </div>
                  <span className="text-[10px] font-label text-[#8C8680] w-8">{bar.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-12">
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {reviews.slice(0, visibleCount).map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="pb-8 border-b border-[#E8E4E0] space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-label uppercase tracking-widest text-[#0D0D0D]">{review.name}</span>
                        {review.verified && (
                          <span className="bg-[#7A9E87]/10 text-[#7A9E87] text-[10px] font-label uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={10} /> Compra verificada
                          </span>
                        )}
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            fill={star <= review.rating ? "#0D0D0D" : "transparent"} 
                            strokeWidth={1.5} 
                            className="text-[#0D0D0D]"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-label uppercase tracking-widest text-[#8C8680]">{review.date}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-display uppercase tracking-widest text-[#0D0D0D]">{review.title}</h4>
                    <p className="text-sm font-body text-[#8C8680] leading-relaxed">{review.text}</p>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <button className="text-[10px] font-label uppercase tracking-widest text-[#8C8680] hover:text-[#0D0D0D] transition-colors flex items-center gap-1.5">
                      <ThumbsUp size={12} /> ¿Fue útil? ({review.useful})
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {visibleCount < reviews.length && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                className="rounded-none border-[#E8E4E0] text-[#0D0D0D] hover:border-[#0D0D0D] transition-all uppercase tracking-widest text-xs font-label px-12 h-12"
              >
                Cargar más reseñas
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
