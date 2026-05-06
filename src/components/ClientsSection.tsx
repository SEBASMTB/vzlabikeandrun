"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";

const partners = [
  { name: "Maratón de Caracas", color: "bg-orange-500" },
  { name: "Farmaluna", color: "bg-emerald-500" },
  { name: "Women's Run VE", color: "bg-pink-500" },
  { name: "Ministerio del Deporte", color: "bg-red-600" },
  { name: "Federación Venezolana de Atletismo", color: "bg-amber-500" },
  { name: "La Autopista 21K", color: "bg-violet-500" },
  { name: "Olympic Triathlon VE", color: "bg-teal-500" },
  { name: "Movistar", color: "bg-cyan-500" },
  { name: "Coca-Cola Venezuela", color: "bg-red-500" },
  { name: "PDVSA", color: "bg-green-600" },
  { name: "Banesco", color: "bg-yellow-600" },
  { name: "Mercantil", color: "bg-blue-500" },
];

const testimonials = [
  {
    name: "Carlos Mendoza",
    role: "Director, Maratón de Caracas",
    quote:
      "VzlaBike and Run transformó nuestro evento. Los resultados en tiempo real y la plataforma VBRWorks nos dieron un nivel de profesionalismo que nunca habíamos tenido.",
  },
  {
    name: "Ana Lucía Torres",
    role: "Organizadora, Women's Run",
    quote:
      "La atención al detalle y el soporte técnico 24/7 hacen de VzlaBike and Run el mejor aliado para cualquier evento deportivo. Altamente recomendados.",
  },
  {
    name: "Roberto Sánchez",
    role: "Atleta Profesional",
    quote:
      "Como atleta, poder ver mis tiempos parciales y resultados en tiempo real durante la carrera es increíble. La tecnología que usan es de primer nivel mundial.",
  },
];

export function ClientsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [nextTestimonial]);

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Clientes y Aliados"
          subtitle="Trabajamos con las marcas y organizaciones más importantes del deporte venezolano."
        />

        {/* Partner Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-16"
        >
          {partners.map((partner) => (
            <div
              key={partner.name}
              className={`${partner.color} rounded-xl p-4 flex items-center justify-center text-white font-semibold text-xs sm:text-sm text-center min-h-[72px] hover:scale-105 transition-transform cursor-default`}
            >
              {partner.name}
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-gray-50 rounded-2xl p-8 md:p-12">
            <Quote className="size-10 text-orange-300 mb-4" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
                  &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
                </p>
                <div>
                  <p className="font-bold text-foreground">
                    {testimonials[currentTestimonial].name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTestimonial}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentTestimonial
                        ? "bg-orange-500"
                        : "bg-gray-300"
                    }`}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTestimonial}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
