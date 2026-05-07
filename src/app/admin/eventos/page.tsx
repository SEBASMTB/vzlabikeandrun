"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  location: string;
  distance: string;
  category: string;
  imageUrl: string;
  price: number;
  status: string;
  maxParticipants: number;
  featured: boolean;
  organizer: string;
  prizes: string;
  rules: string;
  kitInfo: string;
  _count?: { registrations: number };
}

const emptyEvent: Omit<Event, "id"> = {
  title: "",
  slug: "",
  description: "",
  date: "",
  location: "",
  distance: "",
  category: "Carrera",
  imageUrl: "",
  price: 0,
  status: "upcoming",
  maxParticipants: 500,
  featured: false,
  organizer: "",
  prizes: "",
  rules: "",
  kitInfo: "",
};

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700 border-blue-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  upcoming: "Próximo",
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
};

const categories = ["Carrera", "Triatlón", "Virtual", "MTB"];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminEventosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Omit<Event, "id">>(emptyEvent);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleNew = () => {
    setEditingEvent(null);
    setFormData(emptyEvent);
    setDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      slug: event.slug,
      description: event.description,
      date: event.date ? event.date.split("T")[0] : "",
      location: event.location,
      distance: event.distance,
      category: event.category,
      imageUrl: event.imageUrl,
      price: event.price,
      status: event.status,
      maxParticipants: event.maxParticipants,
      featured: event.featured,
      organizer: event.organizer,
      prizes: event.prizes,
      rules: event.rules,
      kitInfo: event.kitInfo,
    });
    setDialogOpen(true);
  };

  const handleDelete = (event: Event) => {
    setDeleteTarget(event);
    setDeleteOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingEvent ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.date || !formData.location || !formData.distance) {
      return;
    }

    setSaving(true);
    try {
      if (editingEvent) {
        // Update
        const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            date: new Date(formData.date).toISOString(),
          }),
        });
        if (res.ok) {
          setDialogOpen(false);
          fetchEvents();
        }
      } else {
        // Create
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            date: new Date(formData.date).toISOString(),
          }),
        });
        if (res.ok) {
          setDialogOpen(false);
          fetchEvents();
        }
      }
    } catch {
      // Silently handle
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/events/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchEvents();
      }
    } catch {
      // Silently handle
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Gestión de Eventos
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra todos los eventos de la plataforma
          </p>
        </div>
        <Button
          onClick={handleNew}
          className="gradient-primary text-white border-0 hover:opacity-90 shrink-0"
        >
          <Plus className="size-4" />
          Nuevo Evento
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar eventos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Events Table */}
      <CardWrapper>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-16">Imagen</TableHead>
                  <TableHead className="text-xs">Título</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Ubicación</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Distancia</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Precio</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Inscritos</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {search ? "No se encontraron eventos" : "No hay eventos registrados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="size-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-lg bg-gradient-to-br from-red-500 to-red-400 flex items-center justify-center">
                            <ImageIcon className="size-4 text-white" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {formatDate(event.date)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[150px] truncate">
                        {event.location}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {event.distance}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm font-medium">
                        ${event.price.toFixed(0)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="size-3.5 text-muted-foreground" />
                          {event._count?.registrations || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs whitespace-nowrap",
                            statusColors[event.status] || ""
                          )}
                        >
                          {statusLabels[event.status] || event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-blue-600"
                            onClick={() => handleEdit(event)}
                            aria-label="Editar evento"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-red-600"
                            onClick={() => handleDelete(event)}
                            aria-label="Eliminar evento"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardWrapper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Editar Evento" : "Nuevo Evento"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent
                ? "Modifica los datos del evento"
                : "Completa los datos para crear un nuevo evento"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Title */}
            <div className="sm:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nombre del evento"
                className="mt-1"
              />
            </div>

            {/* Slug */}
            <div className="sm:col-span-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="url-del-evento"
                className="mt-1"
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="mt-1"
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Ciudad, Estado"
                className="mt-1"
              />
            </div>

            {/* Distance */}
            <div>
              <Label htmlFor="distance">Distancia *</Label>
              <Input
                id="distance"
                value={formData.distance}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, distance: e.target.value }))
                }
                placeholder="Ej: 5K, 10K, 21K"
                className="mt-1"
              />
            </div>

            {/* Category */}
            <div>
              <Label>Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, category: v }))
                }
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Precio (USD)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>

            {/* Max Participants */}
            <div>
              <Label htmlFor="maxParticipants">Máx. Participantes</Label>
              <Input
                id="maxParticipants"
                type="number"
                min={1}
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxParticipants: parseInt(e.target.value) || 500,
                  }))
                }
                className="mt-1"
              />
            </div>

            {/* Status */}
            <div>
              <Label>Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, status: v }))
                }
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Próximo</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <Label htmlFor="imageUrl">URL de Imagen</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                placeholder="https://ejemplo.com/imagen.jpg"
                className="mt-1"
              />
            </div>

            {/* Organizer */}
            <div className="sm:col-span-2">
              <Label htmlFor="organizer">Organizador</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, organizer: e.target.value }))
                }
                placeholder="Nombre del organizador"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descripción del evento..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Prizes */}
            <div className="sm:col-span-2">
              <Label htmlFor="prizes">Premios</Label>
              <Textarea
                id="prizes"
                value={formData.prizes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, prizes: e.target.value }))
                }
                placeholder="Descripción de premios..."
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Rules */}
            <div className="sm:col-span-2">
              <Label htmlFor="rules">Reglas</Label>
              <Textarea
                id="rules"
                value={formData.rules}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rules: e.target.value }))
                }
                placeholder="Reglas del evento..."
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Kit Info */}
            <div className="sm:col-span-2">
              <Label htmlFor="kitInfo">Información del Kit</Label>
              <Textarea
                id="kitInfo"
                value={formData.kitInfo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, kitInfo: e.target.value }))
                }
                placeholder="Qué incluye el kit de participante..."
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Featured */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured: checked === true,
                    }))
                  }
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Evento Destacado
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !formData.title || !formData.slug || !formData.date}
              className="gradient-primary text-white border-0 hover:opacity-90"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </span>
              ) : editingEvent ? (
                "Actualizar Evento"
              ) : (
                "Crear Evento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el evento{" "}
              <span className="font-semibold text-foreground">
                &quot;{deleteTarget?.title}&quot;
              </span>{" "}
              y todas sus inscripciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 border-0"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {children}
    </div>
  );
}
