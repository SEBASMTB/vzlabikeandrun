"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Mail,
  Phone,
  CreditCard,
  Hash,
  Calendar,
  MapPin,
  Tag,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Registration {
  id: string;
  eventId: string;
  event: { title: string };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  gender: string;
  dateOfBirth: string;
  shirtSize: string;
  category: string;
  team: string;
  emergencyContact: string;
  emergencyPhone: string;
  paymentMethod: string;
  paymentRef: string;
  status: string;
  waiverAccepted: boolean;
  bibNumber: number | null;
  createdAt: string;
}

interface EventsData {
  id: string;
  title: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  rejected: "Rechazado",
};

const PAGE_SIZE = 10;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminInscripcionesPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<EventsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {
      // Silently handle
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", PAGE_SIZE.toString());
      if (eventFilter !== "all") params.set("eventId", eventFilter);
      if (statusFilter !== "todos") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
        const pag = data.pagination || data;
        setTotal(pag.total || 0);
        setTotalPages(pag.totalPages || 0);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [page, eventFilter, statusFilter, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchRegistrations();
      }
    } catch {
      // Silently handle
    } finally {
      setUpdating(null);
    }
  };

  const handleViewDetail = (reg: Registration) => {
    setSelectedReg(reg);
    setDetailOpen(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setPage(1);
    if (key === "event") setEventFilter(value);
    if (key === "status") setStatusFilter(value);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Gestión de Inscripciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Revisa y gestiona las inscripciones de los participantes
          </p>
        </div>
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 shrink-0"
        >
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Event Filter */}
          <Select
            value={eventFilter}
            onValueChange={(v) => handleFilterChange("event", v)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="size-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Todos los eventos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los eventos</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => handleFilterChange("status", v)}
          >
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="rejected">Rechazado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground mt-3">
          {total} {total === 1 ? "resultado" : "resultados"} encontrados
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-12">#Dorsal</TableHead>
                    <TableHead className="text-xs">Nombre</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Teléfono</TableHead>
                    <TableHead className="text-xs hidden xl:table-cell">Cédula</TableHead>
                    <TableHead className="text-xs hidden xl:table-cell">Categoría</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Evento</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Pago</TableHead>
                    <TableHead className="text-xs hidden xl:table-cell">Referencia</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No se encontraron inscripciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-mono text-sm font-bold text-muted-foreground">
                          {reg.bibNumber || "—"}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {reg.firstName} {reg.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {reg.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[180px] truncate">
                          {reg.email}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {reg.phone}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">
                          {reg.idNumber}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {reg.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[150px] truncate">
                          {reg.event.title}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {reg.paymentMethod || "—"}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm font-mono">
                          {reg.paymentRef || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs whitespace-nowrap",
                              statusColors[reg.status] || ""
                            )}
                          >
                            {statusLabels[reg.status] || reg.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {reg.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-emerald-600"
                                  onClick={() =>
                                    handleStatusUpdate(reg.id, "confirmed")
                                  }
                                  disabled={updating === reg.id}
                                  aria-label="Confirmar inscripción"
                                >
                                  {updating === reg.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="size-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-red-600"
                                  onClick={() =>
                                    handleStatusUpdate(reg.id, "rejected")
                                  }
                                  disabled={updating === reg.id}
                                  aria-label="Rechazar inscripción"
                                >
                                  <XCircle className="size-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-blue-600"
                              onClick={() => handleViewDetail(reg)}
                              aria-label="Ver detalle"
                            >
                              <Eye className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Página siguiente"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Inscripción</DialogTitle>
            <DialogDescription>
              Información completa del participante
            </DialogDescription>
          </DialogHeader>

          {selectedReg && (
            <div className="space-y-4 py-2">
              {/* Status & Bib */}
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm",
                    statusColors[selectedReg.status] || ""
                  )}
                >
                  {statusLabels[selectedReg.status] || selectedReg.status}
                </Badge>
                {selectedReg.bibNumber && (
                  <Badge variant="secondary" className="text-sm">
                    Dorsal #{selectedReg.bibNumber}
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Personal Info */}
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <User className="size-4 text-red-500" />
                  Datos Personales
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <DetailField label="Nombre" value={`${selectedReg.firstName} ${selectedReg.lastName}`} />
                  <DetailField label="Cédula" value={selectedReg.idNumber} />
                  <DetailField label="Email" value={selectedReg.email} />
                  <DetailField label="Teléfono" value={selectedReg.phone} />
                  <DetailField label="Género" value={selectedReg.gender} />
                  <DetailField label="Fecha de Nacimiento" value={selectedReg.dateOfBirth} />
                  <DetailField label="Talla Camisa" value={selectedReg.shirtSize} />
                  <DetailField label="Equipo" value={selectedReg.team} />
                </div>
              </div>

              <Separator />

              {/* Event Info */}
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Calendar className="size-4 text-red-500" />
                  Información del Evento
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <DetailField label="Evento" value={selectedReg.event.title} />
                  <DetailField label="Categoría" value={selectedReg.category} />
                  <DetailField
                    label="Fecha de Registro"
                    value={formatDate(selectedReg.createdAt)}
                  />
                </div>
              </div>

              <Separator />

              {/* Payment Info */}
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <CreditCard className="size-4 text-red-500" />
                  Información de Pago
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <DetailField label="Método de Pago" value={selectedReg.paymentMethod} />
                  <DetailField label="Referencia" value={selectedReg.paymentRef} />
                </div>
              </div>

              <Separator />

              {/* Emergency Contact */}
              {selectedReg.emergencyContact && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Phone className="size-4 text-red-500" />
                    Contacto de Emergencia
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <DetailField
                      label="Nombre"
                      value={selectedReg.emergencyContact}
                    />
                    <DetailField
                      label="Teléfono"
                      value={selectedReg.emergencyPhone}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedReg.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedReg.id, "confirmed");
                      setDetailOpen(false);
                    }}
                    disabled={updating === selectedReg.id}
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 border-0"
                  >
                    {updating === selectedReg.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle className="size-4" />
                    )}
                    Confirmar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleStatusUpdate(selectedReg.id, "rejected");
                      setDetailOpen(false);
                    }}
                    disabled={updating === selectedReg.id}
                    className="flex-1"
                  >
                    <XCircle className="size-4" />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}
