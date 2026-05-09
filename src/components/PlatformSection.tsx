"use client";

import { motion } from "framer-motion";
import {
  Monitor,
  Users,
  CreditCard,
  BarChart3,
  QrCode,
  Shield,
  Smartphone,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";

const RESULTS_URL = "https://vbr-results-portal.vercel.app";

const platformFeatures = [
  {
    icon: Monitor,
    title: "Panel de Administración",
    description: "Control total del evento desde un dashboard intuitivo y fácil de usar.",
  },
  {
    icon: Users,
    title: "Gestión de Participantes",
    description: "Registro, categorización y gestión completa de todos los participantes.",
  },
  {
    icon: CreditCard,
    title: "Pagos Integrados",
    description: "Procesamiento de pagos seguro con múltiples opciones de pago.",
  },
  {
    icon: BarChart3,
    title: "Estadísticas Avanzadas",
    description: "Análisis detallado de datos del evento con gráficos interactivos.",
  },
  {
    icon: QrCode,
    title: "Check-in Digital",
    description: "Sistema de registro rápido con códigos QR para cada participante.",
  },
  {
    icon: Shield,
    title: "Seguridad y Respaldo",
    description: "Datos protegidos con encriptación y respaldo automático en la nube.",
  },
  {
    icon: Smartphone,
    title: "App Móvil",
    description: "Aplicación móvil para participantes con resultados y seguimiento en vivo.",
  },
  {
    icon: Globe,
    title: "Páginas Personalizadas",
    description: "Landing pages profesionales para cada evento con branding personalizado.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export function PlatformSection() {
  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="resultados" className="py-20 md:py-28 gradient-dark text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="VBRWorks®"
          subtitle="Nuestra plataforma integral de gestión de eventos deportivos. Potencia tu evento con la tecnología más avanzada del mercado."
          light
        />

        {/* Platform mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white/10 rounded-md px-4 py-1 text-xs text-white/60">
                  app.vzlabikeandrun.com/dashboard
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">1,247</div>
                  <div className="text-xs text-white/60 mt-1">Participantes</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">98.5%</div>
                  <div className="text-xs text-white/60 mt-1">Lecturas Exitosas</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">3</div>
                  <div className="text-xs text-white/60 mt-1">Puntos de Control</div>
                </div>
              </div>
              {/* Fake table */}
              <div className="space-y-2">
                <div className="flex items-center text-xs text-white/40 px-4">
                  <span className="w-12">#</span>
                  <span className="flex-1">Atleta</span>
                  <span className="w-20 text-right">Tiempo</span>
                  <span className="w-16 text-right">Pace</span>
                </div>
                {[
                  { pos: 1, name: "Carlos Rodríguez", time: "32:15", pace: "4:35" },
                  { pos: 2, name: "María González", time: "34:22", pace: "4:54" },
                  { pos: 3, name: "José Martínez", time: "35:08", pace: "5:01" },
                ].map((row) => (
                  <div
                    key={row.pos}
                    className="flex items-center bg-white/5 rounded-lg px-4 py-2 text-sm"
                  >
                    <span className="w-12 font-bold text-red-400">
                      {row.pos}
                    </span>
                    <span className="flex-1 text-white/90">{row.name}</span>
                    <span className="w-20 text-right text-white/70">
                      {row.time}
                    </span>
                    <span className="w-16 text-right text-white/50">
                      {row.pace}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {platformFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <feature.icon className="size-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="gradient-primary text-white border-0 text-base px-8 h-12"
            onClick={() => { window.location.href = RESULTS_URL; }}
          >
            Ver Plataforma de Resultados
            <ArrowRight className="size-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
