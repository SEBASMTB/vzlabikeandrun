/**
 * Categorías deportivas VzlaBike and Run®
 *
 * Cada disciplina tiene sus propias categorías con identificadores únicos
 * para timing/results (RUN-JUV-M, MTB-MAA-F, TRK-LEY-M, etc.)
 *
 * Todas las categorías incluyen campo `gender`:
 *   - "M": Categoría Masculina (Varones)
 *   - "F": Categoría Femenina (Damas)
 *   - undefined: Categoría Abierta (ambos géneros, ej: E-Bike)
 *
 * ageCalcMode:
 *   - "calendar_year": edad = año del evento - año de nacimiento (por defecto)
 *   - "event_day":      edad = fecha del evento - fecha de nacimiento (edad exacta)
 */

export interface CategoryOption {
  value: string;   // Identificador: RUN-JUV-M, MTB-MAA-F, TRK-LEY-M, etc.
  label: string;   // Etiqueta visible: "Juvenil Varones (16-19)", "Máster A Damas (30-39)", etc.
  minAge: number;
  maxAge: number;
  gender?: string; // "M", "F", o undefined (mixto/abierto)
}

// ============================================================
// Helper: Crear variantes Masculinas y Femeninas
// ============================================================
function makePair(
  prefix: string,
  name: string,
  minAge: number,
  maxAge: number
): CategoryOption[] {
  return [
    { value: `${prefix}-M`, label: `${name} Varones (${minAge === 999 ? "70+" : `${minAge}-${maxAge}`})`, minAge, maxAge, gender: "M" },
    { value: `${prefix}-F`, label: `${name} Damas (${minAge === 999 ? "70+" : `${minAge}-${maxAge}`})`, minAge, maxAge, gender: "F" },
  ];
}

// ============================================================
// ATLETISMO / RUNNING (cada 10 años, M y F)
// ============================================================
const RUNNING_CATEGORIES: CategoryOption[] = [
  ...makePair("RUN-JUV", "Juvenil", 16, 19),
  ...makePair("RUN-LIB", "Libre", 20, 29),
  ...makePair("RUN-SMA", "Sub-Máster", 30, 39),
  ...makePair("RUN-MAA", "Máster A", 40, 49),
  ...makePair("RUN-MAB", "Máster B", 50, 59),
  ...makePair("RUN-MAC", "Máster C", 60, 69),
  ...makePair("RUN-PLU", "Plus", 70, 999),
];

// ============================================================
// CICLISMO MTB
// Varones: Recreativo 25+, Juvenil, Élite, Masters cada 10 años
// Damas: Sport Femenino 15-29, Master 30-39, 40-49, 50+
// Abiertas: E-Bike
// ============================================================
const MTB_CATEGORIES: CategoryOption[] = [
  // VARONES
  { value: "MTB-REC-M", label: "Recreativo Varones (25+)", minAge: 25, maxAge: 999, gender: "M" },
  { value: "MTB-JUV-M", label: "Juvenil Varones (15-18)", minAge: 15, maxAge: 18, gender: "M" },
  { value: "MTB-ELI-M", label: "Élite Varones (19-29)", minAge: 19, maxAge: 29, gender: "M" },
  { value: "MTB-MAA-M", label: "Máster A Varones (30-39)", minAge: 30, maxAge: 39, gender: "M" },
  { value: "MTB-MAB-M", label: "Máster B Varones (40-49)", minAge: 40, maxAge: 49, gender: "M" },
  { value: "MTB-MAC-M", label: "Máster C Varones (50-59)", minAge: 50, maxAge: 59, gender: "M" },
  { value: "MTB-MAD-M", label: "Máster D Varones (60+)", minAge: 60, maxAge: 999, gender: "M" },
  // DAMAS (solo 4 categorías)
  { value: "MTB-SPO-F", label: "Sport Femenino (15-29)", minAge: 15, maxAge: 29, gender: "F" },
  { value: "MTB-MAA-F", label: "Máster A Damas (30-39)", minAge: 30, maxAge: 39, gender: "F" },
  { value: "MTB-MAB-F", label: "Máster B Damas (40-49)", minAge: 40, maxAge: 49, gender: "F" },
  { value: "MTB-MAC-F", label: "Máster C Damas (50+)", minAge: 50, maxAge: 999, gender: "F" },
  // ABIERTAS
  { value: "MTB-EBK", label: "E-Bike (Abierta)", minAge: 15, maxAge: 999 },
];

// ============================================================
// TREKKING / TRAIL RUNNING (cada 10 años, M y F)
// ============================================================
const TREKKING_CATEGORIES: CategoryOption[] = [
  ...makePair("TRK-JUV", "Juvenil", 16, 19),
  ...makePair("TRK-LIB", "Libre", 20, 29),
  ...makePair("TRK-M1", "Máster 1", 30, 39),
  ...makePair("TRK-M2", "Máster 2", 40, 49),
  ...makePair("TRK-M3", "Máster 3", 50, 59),
  ...makePair("TRK-LEY", "Leyendas", 60, 999),
];

// ============================================================
// TRIATLÓN (cada 10 años, M y F)
// ============================================================
const TRIATHLON_CATEGORIES: CategoryOption[] = [
  ...makePair("TRI-JUN", "Junior", 16, 19),
  ...makePair("TRI-A", "Grupo A", 20, 29),
  ...makePair("TRI-B", "Grupo B", 30, 39),
  ...makePair("TRI-C", "Grupo C", 40, 49),
  ...makePair("TRI-D", "Grupo D", 50, 59),
  ...makePair("TRI-E", "Grupo E", 60, 999),
];

// ============================================================
// DUATLÓN (cada 10 años, M y F)
// ============================================================
const DUATHLON_CATEGORIES: CategoryOption[] = [
  ...makePair("DUA-JUN", "Junior", 16, 19),
  ...makePair("DUA-A", "Grupo A", 20, 29),
  ...makePair("DUA-B", "Grupo B", 30, 39),
  ...makePair("DUA-C", "Grupo C", 40, 49),
  ...makePair("DUA-D", "Grupo D", 50, 59),
  ...makePair("DUA-E", "Grupo E", 60, 999),
];

// ============================================================
// ACUATLÓN (cada 10 años, M y F)
// ============================================================
const AQUATHLON_CATEGORIES: CategoryOption[] = [
  ...makePair("AQU-JUN", "Junior", 16, 19),
  ...makePair("AQU-A", "Grupo A", 20, 29),
  ...makePair("AQU-B", "Grupo B", 30, 39),
  ...makePair("AQU-C", "Grupo C", 40, 49),
  ...makePair("AQU-D", "Grupo D", 50, 59),
  ...makePair("AQU-E", "Grupo E", 60, 999),
];

// ============================================================
// VIRTUAL (Running Virtual, cada 10 años, M y F)
// ============================================================
const VIRTUAL_CATEGORIES: CategoryOption[] = [
  ...makePair("VIR-JUV", "Juvenil", 16, 19),
  ...makePair("VIR-LIB", "Libre", 20, 29),
  ...makePair("VIR-SMA", "Sub-Máster", 30, 39),
  ...makePair("VIR-MAA", "Máster A", 40, 49),
  ...makePair("VIR-MAB", "Máster B", 50, 59),
  ...makePair("VIR-MAC", "Máster C", 60, 999),
];

// ============================================================
// RECREATIVO (25+ tiempo protegido, M y F)
// ============================================================
const RECREATIVO_CATEGORIES: CategoryOption[] = [
  ...makePair("REC-LIB", "Libre", 25, 999),
];

// ============================================================
// SEGURIDAD - Organismos de Seguridad del Estado
// Damas y Varones con categorías especiales por edad
// ============================================================
const SEGURIDAD_CATEGORIES: CategoryOption[] = [
  // Varones
  { value: "SEG-V1", label: "Varones 15-29 años", minAge: 15, maxAge: 29, gender: "M" },
  { value: "SEG-V2", label: "Varones 30-39 años", minAge: 30, maxAge: 39, gender: "M" },
  { value: "SEG-V3", label: "Varones 40+ años", minAge: 40, maxAge: 999, gender: "M" },
  // Damas
  { value: "SEG-D1", label: "Damas 15-29 años", minAge: 15, maxAge: 29, gender: "F" },
  { value: "SEG-D2", label: "Damas 30-39 años", minAge: 30, maxAge: 39, gender: "F" },
  { value: "SEG-D3", label: "Damas 40+ años", minAge: 40, maxAge: 999, gender: "F" },
];

// ============================================================
// MAPA DE DEPORTES -> CATEGORÍAS
// ============================================================
export const SPORT_CATEGORIES: Record<string, CategoryOption[]> = {
  running:    RUNNING_CATEGORIES,
  mtb:        MTB_CATEGORIES,
  trekking:   TREKKING_CATEGORIES,
  triathlon:  TRIATHLON_CATEGORIES,
  duathlon:   DUATHLON_CATEGORIES,
  aquathlon:  AQUATHLON_CATEGORIES,
  virtual:    VIRTUAL_CATEGORIES,
  recreativo: RECREATIVO_CATEGORIES,
  seguridad:  SEGURIDAD_CATEGORIES,
  trail:      TREKKING_CATEGORIES,
};

/**
 * Obtiene las categorías para un deporte específico
 */
export function getCategoriesForSport(sportType: string): CategoryOption[] {
  return SPORT_CATEGORIES[sportType] || RUNNING_CATEGORIES;
}

/**
 * Agrupa categorías por género para la UI del administrador
 * Retorna { M: [...], F: [...], open: [...] }
 */
export function getCategoriesByGender(sportType: string): {
  male: CategoryOption[];
  female: CategoryOption[];
  open: CategoryOption[];
} {
  const cats = getCategoriesForSport(sportType);
  return {
    male: cats.filter((c) => c.gender === "M"),
    female: cats.filter((c) => c.gender === "F"),
    open: cats.filter((c) => !c.gender),
  };
}

/**
 * Lista completa de categorías combinadas (para selects manuales si se necesita)
 */
export function getAllCategories(): CategoryOption[] {
  const all: CategoryOption[] = [];
  for (const cats of Object.values(SPORT_CATEGORIES)) {
    for (const cat of cats) {
      if (!all.find((c) => c.value === cat.value)) {
        all.push(cat);
      }
    }
  }
  return all;
}

/**
 * Calcula la edad del participante según el modo configurado del evento
 *
 * @param dateOfBirth - Fecha de nacimiento en formato "DD/MM/YYYY" o ISO "YYYY-MM-DD"
 * @param eventDate   - Fecha del evento (ISO string o Date)
 * @param mode        - "calendar_year" o "event_day"
 * @returns Edad calculada
 */
export function calculateAge(
  dateOfBirth: string,
  eventDate: string | Date,
  mode: string = "calendar_year"
): number {
  let birthDay: number, birthMonth: number, birthYear: number;

  // Support both "DD/MM/YYYY" and "YYYY-MM-DD" formats
  if (dateOfBirth.includes("/")) {
    const parts = dateOfBirth.split("/");
    if (parts.length !== 3) return 0;
    birthDay = parseInt(parts[0], 10);
    birthMonth = parseInt(parts[1], 10);
    birthYear = parseInt(parts[2], 10);
  } else if (dateOfBirth.includes("-")) {
    const parts = dateOfBirth.split("-");
    if (parts.length !== 3) return 0;
    birthYear = parseInt(parts[0], 10);
    birthMonth = parseInt(parts[1], 10);
    birthDay = parseInt(parts[2], 10);
  } else {
    return 0;
  }

  if (isNaN(birthDay) || isNaN(birthMonth) || isNaN(birthYear)) return 0;

  const evtDate = typeof eventDate === "string" ? new Date(eventDate) : eventDate;

  if (mode === "calendar_year") {
    return evtDate.getFullYear() - birthYear;
  }

  // "event_day": edad exacta al día del evento
  let age = evtDate.getFullYear() - birthYear;
  const monthDiff = evtDate.getMonth() - (birthMonth - 1);
  if (monthDiff < 0 || (monthDiff === 0 && evtDate.getDate() < birthDay)) {
    age--;
  }
  return age;
}

/**
 * Normaliza valores de género a "M" o "F"
 * Soporta: M, F, male, female, masculino, femenino, etc.
 */
export function normalizeGender(gender?: string): string | undefined {
  if (!gender) return undefined;
  const g = gender.toUpperCase();
  if (g === "M" || g === "MALE" || g === "MASCULINO") return "M";
  if (g === "F" || g === "FEMALE" || g === "FEMENINO") return "F";
  return g;
}

/**
 * Asigna la categoría correspondiente según edad, deporte y género
 *
 * @param age       - Edad calculada
 * @param sportType - Tipo de deporte (running, mtb, trekking, seguridad, etc.)
 * @param gender    - "M", "F", "male", "female", etc.
 * @returns La categoría asignada (CategoryOption) o null si es menor de edad
 */
export function assignCategory(
  age: number,
  sportType: string = "running",
  gender?: string
): CategoryOption | null {
  const categories = getCategoriesForSport(sportType);
  const normalizedGender = normalizeGender(gender);

  // 1) Buscar categoría que coincida en género Y edad
  if (normalizedGender) {
    for (const cat of categories) {
      if (cat.gender && cat.gender.toUpperCase() === normalizedGender) {
        if (age >= cat.minAge && age <= cat.maxAge) {
          return cat;
        }
      }
    }
  }

  // 2) Si no encontró por género o no tiene género, buscar categorías abiertas (sin género)
  const openCats = categories.filter((c) => !c.gender);
  for (const cat of openCats) {
    if (age >= cat.minAge && age <= cat.maxAge) {
      return cat;
    }
  }

  // 3) Fallback: buscar cualquier categoría que coincida con la edad
  for (const cat of categories) {
    if (age >= cat.minAge && age <= cat.maxAge) {
      return cat;
    }
  }

  // Menor de la edad mínima
  if (age < categories[0]?.minAge) {
    return null;
  }

  return categories[categories.length - 1] || null;
}

/**
 * Filtra categorías por género (para el formulario de inscripción)
 * Si gender es "M" o "male", solo retorna categorías masculinas + abiertas
 * Si gender es "F" o "female", solo retorna categorías femeninas + abiertas
 * Si no hay género, retorna todas
 */
export function filterCategoriesByGender(
  categories: CategoryOption[],
  gender?: string
): CategoryOption[] {
  const normalizedGender = normalizeGender(gender);
  if (!normalizedGender) return categories;

  return categories.filter(
    (cat) => !cat.gender || cat.gender.toUpperCase() === normalizedGender
  );
}

/**
 * Parsea fecha DD/MM/YYYY a objeto Date
 */
export function parseDateDDMMYYYY(dateStr: string): Date | null {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month - 1, day);
}
