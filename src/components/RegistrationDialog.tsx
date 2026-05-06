"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  MapPin,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { EventCardProps } from "./EventCard";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.email("Ingresa un email válido"),
  phone: z.string().min(7, "Ingresa un teléfono válido"),
  dateOfBirth: z.string().min(1, "Ingresa tu fecha de nacimiento"),
  gender: z.string().min(1, "Selecciona tu género"),
});

const raceInfoSchema = z.object({
  category: z.string().min(1, "Selecciona una categoría"),
  team: z.string().optional(),
});

const emergencySchema = z.object({
  emergencyContact: z.string().min(2, "Ingresa un nombre de contacto"),
  emergencyPhone: z.string().min(7, "Ingresa un teléfono válido"),
});

type PersonalInfo = z.infer<typeof personalInfoSchema>;
type RaceInfo = z.infer<typeof raceInfoSchema>;
type EmergencyInfo = z.infer<typeof emergencySchema>;

interface RegistrationDialogProps {
  event: EventCardProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { label: "Datos Personales", icon: User },
  { label: "Información de Carrera", icon: MapPin },
  { label: "Contacto de Emergencia", icon: Phone },
];

export function RegistrationDialog({
  event,
  open,
  onOpenChange,
}: RegistrationDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
    },
  });

  const raceForm = useForm<RaceInfo>({
    resolver: zodResolver(raceInfoSchema),
    defaultValues: { category: "", team: "" },
  });

  const emergencyForm = useForm<EmergencyInfo>({
    resolver: zodResolver(emergencySchema),
    defaultValues: { emergencyContact: "", emergencyPhone: "" },
  });

  const resetForms = () => {
    personalForm.reset();
    raceForm.reset();
    emergencyForm.reset();
    setCurrentStep(0);
  };

  const handleClose = (val: boolean) => {
    if (!val) resetForms();
    onOpenChange(val);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      const result = personalForm.formState;
      personalForm.trigger().then((valid) => {
        if (valid) {
          setCurrentStep(1);
        }
      });
    } else if (currentStep === 1) {
      raceForm.trigger().then((valid) => {
        if (valid) setCurrentStep(2);
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!event?.slug) return;

    const emergencyValid = await emergencyForm.trigger();
    if (!emergencyValid) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/events/${event.slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...personalForm.getValues(),
          ...raceForm.getValues(),
          ...emergencyForm.getValues(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "¡Inscripción Exitosa! 🎉",
          description: `Te has inscrito en ${event.title}. Tu número de dorsal es #${data.bibNumber}. Revisa tu email para más detalles.`,
        });
        handleClose(false);
      } else {
        toast({
          title: "Error en la inscripción",
          description: data.error || "Ocurrió un error al procesar tu inscripción.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscripción - {event?.title}</DialogTitle>
          <DialogDescription>
            {event?.distance} • {event?.location}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 px-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div
                className={`flex items-center gap-2 cursor-pointer ${
                  i <= currentStep ? "text-red-500" : "text-muted-foreground"
                }`}
                onClick={() => {
                  if (i < currentStep) setCurrentStep(i);
                }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    i < currentStep
                      ? "bg-green-500 text-white"
                      : i === currentStep
                      ? "gradient-primary text-white"
                      : "bg-gray-200 text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs hidden sm:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    i < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Personal Info */}
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    {...personalForm.register("firstName")}
                  />
                  {personalForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">
                      {personalForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    placeholder="Pérez"
                    {...personalForm.register("lastName")}
                  />
                  {personalForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">
                      {personalForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@email.com"
                  {...personalForm.register("email")}
                />
                {personalForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {personalForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+58 412-123-4567"
                  {...personalForm.register("phone")}
                />
                {personalForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {personalForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...personalForm.register("dateOfBirth")}
                  />
                  {personalForm.formState.errors.dateOfBirth && (
                    <p className="text-sm text-destructive">
                      {personalForm.formState.errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Género *</Label>
                  <Select
                    value={personalForm.watch("gender")}
                    onValueChange={(val) =>
                      personalForm.setValue("gender", val, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                  {personalForm.formState.errors.gender && (
                    <p className="text-sm text-destructive">
                      {personalForm.formState.errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Race Info */}
          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {event?.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event?.distance} • {event?.location}
                    </p>
                  </div>
                  <Badge className="gradient-primary text-white border-0">
                    ${event?.price} USD
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={raceForm.watch("category")}
                  onValueChange={(val) =>
                    raceForm.setValue("category", val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="elite">Élite</SelectItem>
                    <SelectItem value="master-a">Master A (30-39)</SelectItem>
                    <SelectItem value="master-b">Master B (40-49)</SelectItem>
                    <SelectItem value="master-c">Master C (50+)</SelectItem>
                    <SelectItem value="juvenil">Juvenil</SelectItem>
                  </SelectContent>
                </Select>
                {raceForm.formState.errors.category && (
                  <p className="text-sm text-destructive">
                    {raceForm.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Equipo (Opcional)</Label>
                <Input
                  id="team"
                  placeholder="Nombre del equipo o club"
                  {...raceForm.register("team")}
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Emergency Contact */}
          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">
                  Nombre de Contacto de Emergencia *
                </Label>
                <Input
                  id="emergencyContact"
                  placeholder="María Pérez"
                  {...emergencyForm.register("emergencyContact")}
                />
                {emergencyForm.formState.errors.emergencyContact && (
                  <p className="text-sm text-destructive">
                    {emergencyForm.formState.errors.emergencyContact.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">
                  Teléfono de Emergencia *
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  placeholder="+58 414-123-4567"
                  {...emergencyForm.register("emergencyPhone")}
                />
                {emergencyForm.formState.errors.emergencyPhone && (
                  <p className="text-sm text-destructive">
                    {emergencyForm.formState.errors.emergencyPhone.message}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-sm mb-2 text-red-800">
                  Resumen de Inscripción
                </h4>
                <div className="space-y-1 text-sm text-red-700">
                  <p>
                    <strong>Evento:</strong> {event?.title}
                  </p>
                  <p>
                    <strong>Participante:</strong>{" "}
                    {personalForm.getValues().firstName}{" "}
                    {personalForm.getValues().lastName}
                  </p>
                  <p>
                    <strong>Categoría:</strong> {raceForm.getValues().category}
                  </p>
                  <p>
                    <strong>Precio:</strong> ${event?.price} USD
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="size-4 mr-2" />
            Anterior
          </Button>
          {currentStep < 2 ? (
            <Button
              className="gradient-primary text-white border-0"
              onClick={handleNext}
            >
              Siguiente
              <ArrowRight className="size-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="gradient-primary text-white border-0"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Confirmar Inscripción
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
