"use client";

import { useState, useEffect } from "react";
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
  CreditCard,
  Wallet,
  Smartphone,
  Building2,
  Copy,
  FileText,
  Sparkles,
  Search,
} from "lucide-react";
import { LiabilityWaiver } from "./LiabilityWaiver";
import { calculateAge, assignCategory } from "@/lib/categories";
import type { EventCardProps } from "./EventCard";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.email("Ingresa un email válido"),
  phone: z.string().min(7, "Ingresa un teléfono válido"),
  idNumber: z.string().min(5, "Ingresa tu cédula de identidad"),
  dateOfBirth: z.string().min(1, "Ingresa tu fecha de nacimiento"),
  gender: z.string().min(1, "Selecciona tu género"),
  shirtSize: z.string().optional(),
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
  eventData?: {
    organizer?: string;
  };
}

type PaymentMethod = "binance" | "zelle" | "pagomovil" | "transferencia";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  icon: React.ElementType;
  description: string;
  wallet: string;
  instructions: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    id: "binance",
    label: "Binance",
    icon: Wallet,
    description: "Pago con criptomonedas vía Binance",
    wallet: "ID Binance: 816555002",
    instructions: "Abre Binance, selecciona Enviar/Pagar por ID (816555002) y envía el monto exacto en USDT. Guarda el hash de la transacción como referencia.",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
  },
  {
    id: "zelle",
    label: "Zelle",
    icon: CreditCard,
    description: "Pago rápido desde EE.UU.",
    wallet: "venezuelabikeandrun@gmail.com - A nombre de: KARLA QUINTERO",
    instructions: "Envía el pago vía Zelle al correo indicado a nombre de KARLA QUINTERO. Recibirás confirmación en minutos.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-300",
  },
  {
    id: "pagomovil",
    label: "Pago Móvil",
    icon: Smartphone,
    description: "Pago Móvil Venezuela",
    wallet: "Teléfono: 0412-016-2685 / CI: V-9479255",
    instructions: "Realiza el Pago Móvil al teléfono 0412-016-2685 con CI V-9479255. Guarda el número de referencia de 6 dígitos.",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-300",
  },
  {
    id: "transferencia",
    label: "Transferencia Bancaria",
    icon: Building2,
    description: "Transferencia bancaria nacional",
    wallet: "Escríbenos por WhatsApp para los datos bancarios",
    instructions: "Escríbenos al WhatsApp para recibir los datos de la cuenta bancaria y realizar tu transferencia. Envía foto del comprobante.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-300",
  },
];

const steps = [
  { label: "Datos Personales", icon: User },
  { label: "Categoría", icon: MapPin },
  { label: "Emergencia + Responsabilidad", icon: FileText },
  { label: "Método de Pago", icon: CreditCard },
];

export function RegistrationDialog({
  event,
  open,
  onOpenChange,
  eventData,
}: RegistrationDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [autoCategory, setAutoCategory] = useState<string>("");
  const [autoAge, setAutoAge] = useState<number | null>(null);
  const { toast } = useToast();

  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      idNumber: "",
      dateOfBirth: "",
      gender: "",
      shirtSize: "",
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

  // Auto-calculate category when DOB, gender, or event changes
  useEffect(() => {
    const dob = personalForm.getValues("dateOfBirth");
    const gender = personalForm.getValues("gender");
    if (dob && gender && event?.date) {
      const mode = event?.ageCalcMode || "calendar_year";
      const age = calculateAge(dob, event.date, mode);
      setAutoAge(age);
      const sportType = event?.sportType || "running";
      const assigned = assignCategory(age, sportType, gender);
      if (assigned) {
        const categoryValue = `${assigned.value} - ${assigned.label}`;
        setAutoCategory(categoryValue);
        raceForm.setValue("category", categoryValue);
      } else {
        setAutoCategory("");
        raceForm.setValue("category", "");
      }
    } else {
      setAutoAge(null);
      setAutoCategory("");
      raceForm.setValue("category", "");
    }
  }, [
    personalForm.watch("dateOfBirth"),
    personalForm.watch("gender"),
    event?.date,
    event?.ageCalcMode,
    event?.sportType,
  ]);

  const handleIdNumberBlur = async () => {
    const idNumber = personalForm.getValues("idNumber").trim();
    if (!idNumber || idNumber.length < 5) return;

    setLookingUp(true);
    try {
      const res = await fetch(`/api/registrations/lookup?id=${encodeURIComponent(idNumber.toUpperCase())}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.firstName) {
          personalForm.setValue("firstName", data.firstName || "");
          personalForm.setValue("lastName", data.lastName || "");
          personalForm.setValue("email", data.email || "");
          personalForm.setValue("phone", data.phone || "");
          if (data.gender) personalForm.setValue("gender", data.gender);
          if (data.dateOfBirth) personalForm.setValue("dateOfBirth", data.dateOfBirth);
          if (data.shirtSize) personalForm.setValue("shirtSize", data.shirtSize);
          setAutoFilled(true);
          toast({
            title: "Datos encontrados",
            description: "Se completaron tus datos automáticamente.",
          });
        }
      }
    } catch {
      // Silently handle lookup failure
    } finally {
      setLookingUp(false);
    }
  };

  const resetForms = () => {
    personalForm.reset();
    raceForm.reset();
    emergencyForm.reset();
    setCurrentStep(0);
    setSelectedPayment(null);
    setPaymentRef("");
    setWaiverAccepted(false);
    setAutoFilled(false);
    setLookingUp(false);
    setAutoCategory("");
    setAutoAge(null);
  };

  const handleClose = (val: boolean) => {
    if (!val) resetForms();
    onOpenChange(val);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      personalForm.trigger().then((valid) => {
        if (valid) setCurrentStep(1);
      });
    } else if (currentStep === 1) {
      raceForm.trigger().then((valid) => {
        if (valid) setCurrentStep(2);
      });
    } else if (currentStep === 2) {
      emergencyForm.trigger().then((valid) => {
        if (valid && waiverAccepted) setCurrentStep(3);
        else if (!waiverAccepted) {
          toast({
            title: "Debes aceptar la liberación de responsabilidad",
            description: "Lee la declaración y marca la casilla de aceptación para continuar.",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado",
        description: "Se copió al portapapeles.",
      });
    });
  };

  const handleSubmit = async () => {
    if (!event?.slug || !selectedPayment) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/events/${event.slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...personalForm.getValues(),
          ...raceForm.getValues(),
          ...emergencyForm.getValues(),
          paymentMethod: selectedPayment,
          paymentRef: paymentRef,
          waiverAccepted: true,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const payLabel = paymentMethods.find((p) => p.id === selectedPayment)?.label;
        toast({
          title: "¡Inscripción Recibida!",
          description: `Te has inscrito en ${event.title}. Tu dorsal es #${data.bibNumber}. Completa el pago con ${payLabel} y envía tu comprobante para confirmar.`,
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

  const currentPayment = paymentMethods.find((p) => p.id === selectedPayment);

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
              {/* CÉDULA - PRIMER CAMPO con auto-búsqueda */}
              <div className="space-y-2">
                <Label htmlFor="idNumber" className="flex items-center gap-2">
                  Cédula de Identidad *
                  {lookingUp && (
                    <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  )}
                  {autoFilled && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-normal">
                      <Sparkles className="size-3" /> Datos cargados
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="idNumber"
                    placeholder="V-12345678"
                    {...personalForm.register("idNumber")}
                    onBlur={handleIdNumberBlur}
                    className={autoFilled ? "border-green-400 bg-green-50/50" : ""}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {autoFilled
                    ? "Se completaron tus datos automáticamente. Verifica y corrige si es necesario."
                    : "Coloca tu cédula y buscaremos tus datos de inscripciones anteriores."}
                </p>
                {personalForm.formState.errors.idNumber && (
                  <p className="text-sm text-destructive">
                    {personalForm.formState.errors.idNumber.message}
                  </p>
                )}
              </div>

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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="shirtSize">Talla de Camiseta (si aplica)</Label>
                <Select
                  value={personalForm.watch("shirtSize")}
                  onValueChange={(val) =>
                    personalForm.setValue("shirtSize", val)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar talla" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
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
                      {event?.distance} - {event?.location}
                    </p>
                  </div>
                  <Badge className="gradient-primary text-white border-0">
                    ${event?.price} USD
                  </Badge>
                </div>
              </div>

              {/* Age and Category Auto-Assigned */}
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3 text-red-800">
                    Tu Categoría (calculada automáticamente)
                  </h4>
                  
                  {autoAge !== null && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-red-700">Edad calculada:</span>
                      <Badge variant="secondary" className="font-bold">
                        {autoAge} años
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({event?.ageCalcMode === "event_day" ? "Edad exacta al día del evento" : "Año calendario"})
                      </span>
                    </div>
                  )}

                  {autoCategory ? (
                    <div className="bg-white rounded-md p-3 border border-red-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="font-bold text-foreground">
                          {autoCategory.includes(" - ") ? autoCategory.split(" - ").pop() : autoCategory}
                        </span>
                      </div>
                      <input type="hidden" {...raceForm.register("category")} />
                      <p className="text-xs text-muted-foreground mt-1">
                        Código: {autoCategory.includes(" - ") ? autoCategory.split(" - ")[0] : autoCategory}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-md p-3 border border-amber-200">
                      <p className="text-xs text-amber-700">
                        No se pudo asignar una categoría. Verifica que la fecha de nacimiento y el género sean correctos en el paso anterior.
                      </p>
                    </div>
                  )}
                </div>

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

          {/* Step 3: Emergency Contact + Liability Waiver */}
          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Emergency Contact */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Phone className="size-4 text-red-500" />
                  Contacto de Emergencia
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">
                    Nombre del Contacto *
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
              </div>

              {/* Divider */}
              <div className="border-t" />

              {/* Liability Waiver */}
              <LiabilityWaiver
                eventTitle={event?.title || ""}
                eventDate={event?.date || ""}
                organizer={eventData?.organizer || "VzlaBike and Run®"}
                accepted={waiverAccepted}
                onAccept={setWaiverAccepted}
              />
            </motion.div>
          )}

          {/* Step 4: Payment Method */}
          {currentStep === 3 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Amount to pay */}
              <div className="gradient-primary rounded-lg p-4 text-white text-center">
                <p className="text-sm opacity-90">Monto a pagar</p>
                <p className="text-3xl font-bold">${event?.price} USD</p>
                <p className="text-sm opacity-80">{event?.title}</p>
              </div>

              {/* Payment method selection */}
              <p className="text-sm font-medium text-foreground">
                Selecciona tu método de pago:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPayment(pm.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedPayment === pm.id
                          ? `${pm.bg} ${pm.border} ${pm.color} shadow-md`
                          : "bg-white border-gray-200 hover:border-gray-300 text-foreground"
                      }`}
                    >
                      {selectedPayment === pm.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="size-4 text-white" />
                        </div>
                      )}
                      <Icon className="size-8" />
                      <span className="text-xs font-bold">{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment details */}
              {currentPayment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${currentPayment.bg} border ${currentPayment.border} rounded-lg p-4`}
                >
                  <h4 className={`font-semibold text-sm mb-2 ${currentPayment.color}`}>
                    Datos para pagar con {currentPayment.label}
                  </h4>
                  <div className="flex items-center gap-2 bg-white rounded-md p-3 mb-2">
                    <code className="text-xs flex-1 break-all text-foreground">
                      {currentPayment.wallet}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentPayment.wallet)}
                      className="shrink-0 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Copy className="size-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentPayment.instructions}
                  </p>
                </motion.div>
              )}

              {/* Payment reference */}
              <div className="space-y-2">
                <Label htmlFor="paymentRef">
                  Número de referencia / Comprobante
                </Label>
                <Input
                  id="paymentRef"
                  placeholder="Ej: 000012345678"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa el número de referencia de tu pago para agilizar la confirmación.
                </p>
              </div>

              {/* Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
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
                    <strong>Pago:</strong> ${event?.price} USD via{" "}
                    {currentPayment?.label}
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
          {currentStep < 3 ? (
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
              disabled={submitting || !selectedPayment}
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
