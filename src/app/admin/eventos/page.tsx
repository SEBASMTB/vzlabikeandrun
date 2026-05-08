"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  Loader2,
  Image as ImageIcon,
  Upload,
  X,
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
import {
  SPORT_CATEGORIES,
  getCategoriesByGender,
  type CategoryOption,
} from "@/lib/categories";
import { cn } from "@/lib/utils";

// ============================================================
// Types
// ============================================================
interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  location: string;
  distance: string;
  category: string;
  sportType: string;
  imageUrl: string;
  bannerImage: string;
  price: number;
  priceBs: number;
  status: string;
  maxParticipants: number;
  featured: boolean;
  organizer: string;
  prizes: string;
  rules: string;
  kitInfo: string;
  sponsors: string;
  categories: string;
  _count?: { registrations: number };
}

interface FormData {
  title: string;
  slug: string;
  description: string;
  date: string;
  location: string;
  distance: string;
  category: string;
  sportType: string;
  imageUrl: string;
  bannerImage: string;
  price: number;
  priceBs: number;
  status: string;
  maxParticipants: number;
  featured: boolean;
  organizer: string;
  prizes: string;
  rules: string;
  kitInfo: string;
  sponsors: string;
  categories: string;
}

const emptyForm: FormData = {
  title: "",
  slug: "",
  description: "",
  date: "",
  location: "",
  distance: "",
  category: "running",
  sportType: "running",
  imageUrl: "",
  bannerImage: "",
  price: 0,
  priceBs: 0,
  status: "upcoming",
  maxParticipants: 500,
  featured: false,
  organizer: "",
  prizes: "",
  rules: "",
  kitInfo: "",
  sponsors: "",
  categories: "",
};

// ============================================================
// Constants
// ============================================================
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

const sportTypeLabels: Record<string, string> = {
  running: "Running / Carrera",
  mtb: "MTB / Ciclismo",
  trekking: "Trekking / Trail",
  triathlon: "Triatlón",
  duathlon: "Duatlón",
  aquathlon: "Acuatlón",
  virtual: "Virtual",
  recreativo: "Recreativo",
  seguridad: "Seguridad",
  trail: "Trail Running",
};

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

function parseSelectedCategories(catsStr: string): string[] {
  if (!catsStr) return [];
  return catsStr.split(",").map((s) => s.trim()).filter(Boolean);
}

// ============================================================
// Main Component
// ============================================================
export default function AdminEventosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [formError, setFormError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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

  // ---- Handlers ----
  const handleNew = () => {
    setEditingEvent(null);
    setFormData(emptyForm);
    setFormError("");
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
      category: event.category || event.sportType,
      sportType: event.sportType || "running",
      imageUrl: event.imageUrl || "",
      bannerImage: event.bannerImage || "",
      price: event.price,
      priceBs: event.priceBs || 0,
      status: event.status,
      maxParticipants: event.maxParticipants,
      featured: event.featured,
      organizer: event.organizer || "",
      prizes: event.prizes || "",
      rules: event.rules || "",
      kitInfo: event.kitInfo || "",
      sponsors: event.sponsors || "",
      categories: event.categories || "",
    });
    setFormError("");
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

  const handleSportTypeChange = (sportType: string) => {
    setFormData((prev) => ({
      ...prev,
      sportType,
      category: sportType,
      categories: "", // Reset categories when sport changes
    }));
  };

  const handleCategoryToggle = (catValue: string) => {
    setFormData((prev) => {
      const selected = parseSelectedCategories(prev.categories);
      const updated = selected.includes(catValue)
        ? selected.filter((c) => c !== catValue)
        : [...selected, catValue];
      return { ...prev, categories: updated.join(",") };
    });
  };

  const handleSelectAllGender = (gender: "male" | "female" | "open") => {
    const grouped = getCategoriesByGender(formData.sportType);
    const genderCats = gender === "male"
      ? grouped.male
      : gender === "female"
        ? grouped.female
        : grouped.open;
    const values = genderCats.map((c) => c.value);

    setFormData((prev) => {
      const selected = parseSelectedCategories(prev.categories);
      const allSelected = genderCats.every((c) =>
        selected.includes(c.value)
      );
      const updated = allSelected
        ? selected.filter((c) => !values.includes(c))
        : [...new Set([...selected, ...values])];
      return { ...prev, categories: updated.join(",") };
    });
  };

  // ---- Image Upload ----
  const handleImageUpload = async (file: File, type: "card" | "banner") => {
    if (type === "banner") setUploadingBanner(true);
    else setUploadingImage(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (type === "banner") {
          setFormData((prev) => ({ ...prev, bannerImage: data.url }));
        } else {
          setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        }
      }
    } catch {
      // Silently handle
    } finally {
      setUploadingImage(false);
      setUploadingBanner(false);
    }
  };

  // ---- Submit ----
  const handleSubmit = async () => {
    setFormError("");
    if (!formData.title || !formData.slug || !formData.date || !formData.location || !formData.distance) {
      setFormError("Completa todos los campos obligatorios (Título, Fecha, Ubicación, Distancia)");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      const url = editingEvent
        ? `/api/admin/events/${editingEvent.id}`
        : "/api/events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setDialogOpen(false);
        fetchEvents();
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || `Error al ${editingEvent ? "actualizar" : "crear"} el evento (${res.status})`);
      }
    } catch (err) {
      setFormError("Error de conexión. Verifica tu internet e intenta de nuevo.");
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

  // ---- Filter ----
  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      (e.sportType || e.category).toLowerCase().includes(search.toLowerCase())
  );

  // ---- Categories for current sport ----
  const selectedCats = parseSelectedCategories(formData.categories);
  const groupedCats = getCategoriesByGender(formData.sportType);

  // ============================================================
  // Render
  // ============================================================
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
        <Button onClick={handleNew} className="gradient-primary text-white border-0 hover:opacity-90 shrink-0">
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
                  <TableHead className="text-xs w-16">Img</TableHead>
                  <TableHead className="text-xs">Título</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Ubicación</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Deporte</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Precio</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Inscritos</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      {search ? "No se encontraron eventos" : "No hay eventos registrados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title} className="size-10 rounded-lg object-cover" />
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
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {sportTypeLabels[event.sportType] || event.sportType || event.category}
                        </Badge>
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
                          className={cn("text-xs whitespace-nowrap", statusColors[event.status] || "")}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Modifica los datos del evento" : "Completa los datos para crear un nuevo evento"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* ---- BASIC INFO ---- */}
            <SectionTitle>Información Básica</SectionTitle>

            <div className="sm:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Nombre del evento" className="mt-1" />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} placeholder="url-del-evento" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Input id="location" value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} placeholder="Ciudad, Estado" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="distance">Distancia *</Label>
              <Input id="distance" value={formData.distance} onChange={(e) => setFormData((p) => ({ ...p, distance: e.target.value }))} placeholder="Ej: 5K, 10K, 21K" className="mt-1" />
            </div>

            <div>
              <Label>Tipo de Deporte</Label>
              <Select value={formData.sportType} onValueChange={handleSportTypeChange}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sportTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxParticipants">Máx. Participantes</Label>
              <Input id="maxParticipants" type="number" min={1} value={formData.maxParticipants} onChange={(e) => setFormData((p) => ({ ...p, maxParticipants: parseInt(e.target.value) || 500 }))} className="mt-1" />
            </div>

            <div>
              <Label>Estado</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
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

            {/* ---- PRICING ---- */}
            <SectionTitle>Precios</SectionTitle>

            <div>
              <Label htmlFor="price">Precio (USD)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                <Input
                  id="price"
                  type="text"
                  inputMode="decimal"
                  value={formData.price || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setFormData((p) => ({ ...p, price: parseFloat(val) || 0 }));
                  }}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="priceBs">Precio (Bs)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Bs.</span>
                <Input
                  id="priceBs"
                  type="text"
                  inputMode="decimal"
                  value={formData.priceBs || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setFormData((p) => ({ ...p, priceBs: parseFloat(val) || 0 }));
                  }}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>

            {/* ---- IMAGES ---- */}
            <SectionTitle>Imágenes</SectionTitle>

            {/* Card Image Upload */}
            <div>
              <Label>Imagen del Evento</Label>
              <div className="mt-1 flex items-center gap-3">
                {formData.imageUrl ? (
                  <div className="relative">
                    <img src={formData.imageUrl} alt="Preview" className="size-16 rounded-lg object-cover border" />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, imageUrl: "" }))}
                      className="absolute -top-1.5 -right-1.5 size-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : null}
                <div className="flex-1">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "card");
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full"
                  >
                    {uploadingImage ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {uploadingImage ? "Subiendo..." : "Subir Imagen"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Banner Image Upload */}
            <div>
              <Label>Banner del Evento</Label>
              <div className="mt-1 flex items-center gap-3">
                {formData.bannerImage ? (
                  <div className="relative">
                    <img src={formData.bannerImage} alt="Banner Preview" className="size-16 rounded-lg object-cover border" />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, bannerImage: "" }))}
                      className="absolute -top-1.5 -right-1.5 size-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : null}
                <div className="flex-1">
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "banner");
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="w-full"
                  >
                    {uploadingBanner ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {uploadingBanner ? "Subiendo..." : "Subir Banner"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Image URL fallback */}
            <div className="sm:col-span-2">
              <Label htmlFor="imageUrl">URL de Imagen (alternativa)</Label>
              <Input id="imageUrl" value={formData.imageUrl} onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://ejemplo.com/imagen.jpg" className="mt-1" />
            </div>

            {/* ---- CATEGORIES ---- */}
            <SectionTitle>Categorías del Evento</SectionTitle>
            <div className="sm:col-span-2 text-xs text-muted-foreground">
              Deporte seleccionado: <span className="font-semibold">{sportTypeLabels[formData.sportType] || formData.sportType}</span>
              {" — "}{groupedCats.male.length + groupedCats.female.length + groupedCats.open.length} categorías disponibles
            </div>

            {/* Male Categories */}
            {groupedCats.male.length > 0 && (
              <div className="sm:col-span-2 border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-blue-500 inline-block" />
                    Varones ({groupedCats.male.length})
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleSelectAllGender("male")}
                  >
                    {groupedCats.male.every((c) => selectedCats.includes(c.value)) ? "Limpiar" : "Marcar todas"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {groupedCats.male.map((cat) => (
                    <CategoryChip
                      key={cat.value}
                      cat={cat}
                      selected={selectedCats.includes(cat.value)}
                      onToggle={() => handleCategoryToggle(cat.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Female Categories */}
            {groupedCats.female.length > 0 && (
              <div className="sm:col-span-2 border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-pink-500 inline-block" />
                    Damas ({groupedCats.female.length})
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleSelectAllGender("female")}
                  >
                    {groupedCats.female.every((c) => selectedCats.includes(c.value)) ? "Limpiar" : "Marcar todas"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {groupedCats.female.map((cat) => (
                    <CategoryChip
                      key={cat.value}
                      cat={cat}
                      selected={selectedCats.includes(cat.value)}
                      onToggle={() => handleCategoryToggle(cat.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Open Categories */}
            {groupedCats.open.length > 0 && (
              <div className="sm:col-span-2 border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
                    Abiertas ({groupedCats.open.length})
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleSelectAllGender("open")}
                  >
                    {groupedCats.open.every((c) => selectedCats.includes(c.value)) ? "Limpiar" : "Marcar todas"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {groupedCats.open.map((cat) => (
                    <CategoryChip
                      key={cat.value}
                      cat={cat}
                      selected={selectedCats.includes(cat.value)}
                      onToggle={() => handleCategoryToggle(cat.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedCats.length > 0 && (
              <div className="sm:col-span-2 text-xs text-muted-foreground">
                {selectedCats.length} categoría(s) seleccionada(s)
              </div>
            )}

            {/* ---- ADDITIONAL INFO ---- */}
            <SectionTitle>Información Adicional</SectionTitle>

            <div className="sm:col-span-2">
              <Label htmlFor="organizer">Organizador</Label>
              <Input id="organizer" value={formData.organizer} onChange={(e) => setFormData((p) => ({ ...p, organizer: e.target.value }))} placeholder="Nombre del organizador" className="mt-1" />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="sponsors">Patrocinadores</Label>
              <Input id="sponsors" value={formData.sponsors} onChange={(e) => setFormData((p) => ({ ...p, sponsors: e.target.value }))} placeholder="Nombre de patrocinadores" className="mt-1" />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Descripción del evento..." rows={3} className="mt-1" />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="prizes">Premios</Label>
              <Textarea id="prizes" value={formData.prizes} onChange={(e) => setFormData((p) => ({ ...p, prizes: e.target.value }))} placeholder="Descripción de premios..." rows={2} className="mt-1" />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="rules">Reglas</Label>
              <Textarea id="rules" value={formData.rules} onChange={(e) => setFormData((p) => ({ ...p, rules: e.target.value }))} placeholder="Reglas del evento..." rows={2} className="mt-1" />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="kitInfo">Información del Kit</Label>
              <Textarea id="kitInfo" value={formData.kitInfo} onChange={(e) => setFormData((p) => ({ ...p, kitInfo: e.target.value }))} placeholder="Qué incluye el kit de participante..." rows={2} className="mt-1" />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, featured: checked === true }))}
                />
                <Label htmlFor="featured" className="cursor-pointer">Evento Destacado</Label>
              </div>
            </div>
          </div>

          {formError && (
            <div className="sm:col-span-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {formError}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
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
              ) : editingEvent ? "Actualizar Evento" : "Crear Evento"}
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
              <span className="font-semibold text-foreground">&quot;{deleteTarget?.title}&quot;</span>{" "}
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

// ============================================================
// Sub-components
// ============================================================
function CardWrapper({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border shadow-sm overflow-hidden">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="sm:col-span-2 pt-2 first:pt-0">
      <h3 className="text-sm font-semibold text-foreground border-b pb-1">{children}</h3>
    </div>
  );
}

function CategoryChip({
  cat,
  selected,
  onToggle,
}: {
  cat: CategoryOption;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150",
        selected
          ? cat.gender === "M"
            ? "bg-blue-100 border-blue-300 text-blue-800"
            : cat.gender === "F"
              ? "bg-pink-100 border-pink-300 text-pink-800"
              : "bg-emerald-100 border-emerald-300 text-emerald-800"
          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
      )}
    >
      {cat.label}
    </button>
  );
}
