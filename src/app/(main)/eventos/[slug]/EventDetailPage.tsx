"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  Shirt,
  BookOpen,
  ChevronLeft,
  ArrowRight,
  DollarSign,
  Tag,
  Star,
  Info,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CountdownTimer } from "@/components/CountdownTimer";
import { RegistrationDialog } from "@/components/RegistrationDialog";

interface EventData {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  location: string;
  distance: string;
  category: string;
  imageUrl: string;
  bannerImage: string;
  price: number;
  priceBs: number;
  status: string;
  maxParticipants: number;
  eventTime: string;
  featured: boolean;
  organizer: string;
  prizes: string;
  rules: string;
  kitInfo: string;
  sponsors: string;
  sportType: string;
  ageCalcMode: string;
  categoryInterval: number;
  registrationCount: number;
  hasShirt: boolean;
  categories: string;
}

interface CategoryOption {
  value: string;
  label: string;
  minAge: number;
  maxAge: number;
}

interface EventDetailPageProps {
  event: EventData;
  categories: CategoryOption[];
}

const sportTypeLabels: Record<string, string> = {
  running: "Running / Carrera",
  mtb: "Ciclismo MTB",
  triathlon: "Triatlón",
  trekking: "Trekking",
  virtual: "Virtual",
  duathlon: "Duatlón",
  aquathlon: "Acuatlón",
  trail: "Trail Running",
  recreativo: "Recreativo (Tiempo Protegido)",
  seguridad: "Organismos de Seguridad",
  other: "Otro",
};

const sportTypeColors: Record<string, string> = {
  running: "bg-red-100 text-red-700 border-red-200",
  mtb: "bg-amber-100 text-amber-700 border-amber-200",
  triathlon: "bg-emerald-100 text-emerald-700 border-emerald-200",
  trekking: "bg-green-100 text-green-700 border-green-200",
  virtual: "bg-violet-100 text-violet-700 border-violet-200",
  duathlon: "bg-blue-100 text-blue-700 border-blue-200",
  aquathlon: "bg-cyan-100 text-cyan-700 border-cyan-200",
  trail: "bg-orange-100 text-orange-700 border-orange-200",
  recreativo: "bg-pink-100 text-pink-700 border-pink-200",
  seguridad: "bg-slate-100 text-slate-700 border-slate-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EventDetailPage({ event, categories }: EventDetailPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const spotsLeft = event.maxParticipants - event.registrationCount;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            Volver al Inicio
          </Link>
        </div>
      </header>

      {/* Banner */}
      <div className="relative pt-16">
        {event.bannerImage || event.imageUrl ? (
          <div className="relative h-[280px] sm:h-[350px] md:h-[420px] w-full overflow-hidden">
            <img
              src={event.bannerImage || event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
        ) : (
          <div className="relative h-[280px] sm:h-[350px] md:h-[420px] w-full gradient-primary">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Content over banner */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex flex-wrap gap-2">
                <Badge className={sportTypeColors[event.sportType] || sportTypeColors.other}>
                  {sportTypeLabels[event.sportType] || event.category}
                </Badge>
                {event.featured && (
                  <Badge className="bg-red-500 text-white border-0">
                    <Star className="size-3 mr-1" /> Destacado
                  </Badge>
                )}
                {event.status === "active" && (
                  <Badge className="bg-green-500 text-white border-0">
                    Inscripciones Abiertas
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {formatDateFull(event.date)}
                </span>
                {event.eventTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {event.eventTime}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {event.location}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Countdown */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-2xl p-6 border"
              >
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Cuenta Regresiva
                </p>
                <CountdownTimer targetDate={event.date} />
              </motion.div>

              {/* Description */}
              {event.description && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                    <Info className="size-5 text-red-500" />
                    Información General
                  </h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                    {event.description}
                  </div>
                </motion.section>
              )}

              {/* Event Details Grid */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                  <Calendar className="size-5 text-red-500" />
                  Detalles del Evento
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-xs text-muted-foreground mb-1">Distancia(s)</p>
                    <p className="font-semibold text-foreground">{event.distance}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-xs text-muted-foreground mb-1">Disciplina</p>
                    <p className="font-semibold text-foreground">
                      {sportTypeLabels[event.sportType] || event.category}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-xs text-muted-foreground mb-1">Lugar</p>
                    <p className="font-semibold text-foreground">{event.location}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-xs text-muted-foreground mb-1">Organizador</p>
                    <p className="font-semibold text-foreground">{event.organizer || "VzlaBike and Run®"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-xs text-muted-foreground mb-1">Participantes</p>
                    <p className="font-semibold text-foreground">
                      {event.registrationCount} / {event.maxParticipants}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-xs text-muted-foreground mb-1">Cálculo de Edad</p>
                    <p className="font-semibold text-foreground">
                      {event.ageCalcMode === "calendar_year"
                        ? "Año Calendario"
                        : "Fecha del Día del Evento"}
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Categories — only show if admin explicitly created them */}
              {categories.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                    <Tag className="size-5 text-red-500" />
                    Categorías por Edad
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Las categorías se asignan automáticamente al momento de la inscripción según la disciplina{" "}
                    <strong>{sportTypeLabels[event.sportType] || event.category}</strong>.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {categories.map((cat) => (
                      <div
                        key={cat.value}
                        className="bg-white rounded-xl border p-3 text-center hover:border-red-300 transition-colors"
                      >
                        <p className="text-[10px] font-mono text-red-500 font-bold">{cat.value}</p>
                        <p className="font-semibold text-sm text-foreground mt-0.5">{cat.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Prizes */}
              {event.prizes && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                    <Trophy className="size-5 text-red-500" />
                    Premios
                  </h2>
                  <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                    <div className="prose prose-sm max-w-none text-yellow-900 whitespace-pre-line">
                      {event.prizes}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Kit Info */}
              {event.kitInfo && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                    <Shirt className="size-5 text-red-500" />
                    Kit de Participante
                  </h2>
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                    <div className="prose prose-sm max-w-none text-blue-900 whitespace-pre-line">
                      {event.kitInfo}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Rules */}
              {event.rules && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                    <BookOpen className="size-5 text-red-500" />
                    Reglas y Reglamento
                  </h2>
                  <div className="bg-gray-50 rounded-xl p-5 border">
                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                      {event.rules}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Sponsors */}
              {event.sponsors && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                    <Star className="size-5 text-red-500" />
                    Patrocinadores
                  </h2>
                  <div className="bg-white rounded-xl p-5 border">
                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                      {event.sponsors}
                    </div>
                  </div>
                </motion.section>
              )}
            </div>

            {/* Right Column - Registration Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Price Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border shadow-lg overflow-hidden"
                >
                  {/* Price Header */}
                  <div className="gradient-primary p-6 text-white text-center">
                    <p className="text-sm opacity-90 mb-1">Inversión</p>
                    <div className="flex items-center justify-center gap-3">
                      <div>
                        <span className="text-4xl font-bold">${event.price.toFixed(0)}</span>
                        <span className="text-sm opacity-80 ml-1">USD</span>
                      </div>
                    </div>
                    {event.priceBs > 0 && (
                      <p className="text-sm opacity-80 mt-1">
                        Bs. {event.priceBs.toFixed(0)}
                      </p>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Quick info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4 shrink-0" />
                        <span>{formatDateFull(event.date)}</span>
                      </div>
                      {event.eventTime && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="size-4 shrink-0" />
                          <span>{event.eventTime}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-4 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Spots */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cupos disponibles</span>
                        <span className={spotsLeft <= 10 ? "text-red-600 font-semibold" : "font-medium"}>
                          {spotsLeft > 0 ? spotsLeft : 0} de {event.maxParticipants}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((event.registrationCount / event.maxParticipants) * 100, 100)}%` }}
                        />
                      </div>
                      {spotsLeft <= 10 && spotsLeft > 0 && (
                        <p className="text-xs text-red-500 font-medium">
                          ¡Quedan pocos cupos!
                        </p>
                      )}
                      {spotsLeft <= 0 && (
                        <p className="text-xs text-red-500 font-medium">
                          Cupos agotados
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Register Button */}
                    {event.status === "cancelled" ? (
                      <Button disabled className="w-full" size="lg">
                        Evento Cancelado
                      </Button>
                    ) : spotsLeft <= 0 ? (
                      <Button disabled className="w-full" size="lg">
                        Cupos Agotados
                      </Button>
                    ) : (
                      <Button
                        className="w-full gradient-primary text-white border-0 hover:opacity-90"
                        size="lg"
                        onClick={() => setDialogOpen(true)}
                      >
                        Inscribirme Ahora
                        <ArrowRight className="size-4 ml-2" />
                      </Button>
                    )}

                    <p className="text-xs text-center text-muted-foreground">
                      Acepta la liberación de responsabilidad al inscribirte
                    </p>
                  </div>
                </motion.div>

                {/* Payment Methods Preview */}
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Métodos de pago aceptados:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Binance</Badge>
                    <Badge variant="outline" className="text-xs">Zelle</Badge>
                    <Badge variant="outline" className="text-xs">Pago Móvil</Badge>
                    <Badge variant="outline" className="text-xs">Transferencia</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VzlaBike and Run® — Todos los derechos reservados
          </p>
        </div>
      </footer>

      {/* Registration Dialog */}
      <RegistrationDialog
        event={{
          id: event.id,
          slug: event.slug,
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          distance: event.distance,
          category: event.category,
          imageUrl: event.bannerImage || event.imageUrl,
          price: event.price,
          priceBs: event.priceBs,
          featured: event.featured,
          sportType: event.sportType || "running",
          ageCalcMode: event.ageCalcMode || "calendar_year",
          hasShirt: event.hasShirt,
          categories: event.categories,
        }}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventData={{
          organizer: event.organizer,
        }}
      />
    </div>
  );
}
