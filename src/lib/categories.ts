/**
 * Categorías deportivas VzlaBike and Run®
 *
 * Soporta dos intervalos de edad:
 *   - "10": cada 10 años (ej: 20-29, 30-39, 40-49)
 *   - "5":  cada 5 años (ej: 20-24, 25-29, 30-34, 35-39, 40-44)
 *
 * Todas las categorías incluyen campo `gender`:
 *   - "M": Categoría Masculina (Varones)
 *   - "F": Categoría Femenina (Damas)
 *   - undefined: Categoría Abierta (ambos géneros)
 */

export interface CategoryOption {
  value: string;
  label: string;
  minAge: number;
  maxAge: number;
  gender?: string; // "M", "F", o undefined (mixto/abierto)
  profile?: "competitivo" | "recreativo"; // for MTB category filtering
}

// ============================================================
// MTB Profile-based category options
// ============================================================

export interface MTBCategoryOptions {
  competitivo: CategoryOption[];  // Only the 1 UCI category that matches
  recreativo: CategoryOption[];   // Recreativo + E-Bike + 100kg categories where age qualifies
  open: CategoryOption[];         // E-Bike, 100kg (always available, any age)
}

/**
 * For MTB events: returns categories split by competitivo/recreativo profile.
 */
export function getMTBCategoryOptions(
  age: number,
  categories: CategoryOption[],
  gender?: string
): MTBCategoryOptions {
  const normalizedGender = normalizeGender(gender);

  // Filter by gender (same as existing logic - show gender-specific + open categories)
  let genderFiltered: CategoryOption[];
  if (normalizedGender) {
    genderFiltered = categories.filter(
      (cat) => !cat.gender || cat.gender.toUpperCase() === normalizedGender
    );
  } else {
    genderFiltered = [...categories];
  }

  // Find competitivo categories where age matches (UCI official)
  const competitivoFiltered = genderFiltered.filter(
    (cat) => cat.profile === "competitivo" && age >= cat.minAge && age <= cat.maxAge
  );
  // Sort by specificity (smallest range first) and pick only the most specific one
  competitivoFiltered.sort((a, b) => (a.maxAge - a.minAge) - (b.maxAge - b.minAge));
  const competitivo = competitivoFiltered.length > 0 ? [competitivoFiltered[0]] : [];

  // Find recreativo categories where age matches
  const recreativo = genderFiltered.filter(
    (cat) => cat.profile === "recreativo" && age >= cat.minAge && age <= cat.maxAge
  );

  // Open categories (no gender restriction AND no profile restriction — E-Bike, 100kg)
  // Actually, E-Bike and 100kg have profile "recreativo" now, so they'll be in the recreativo list
  // But we also keep an "open" list for always-available ones
  const open = genderFiltered.filter(
    (cat) => !cat.gender && !cat.profile
  );

  return { competitivo, recreativo, open };
}

/**
 * Validates that a selected MTB category matches the declared profile.
 */
export function validateMTBCategory(
  categoryValue: string,
  age: number,
  categories: CategoryOption[],
  gender?: string,
  profile?: "competitivo" | "recreativo"
): { valid: boolean; error?: string } {
  // Parse categoryValue: format is "MTB-ELI-M - Élite Varones (19-29)"
  const catCode = categoryValue.includes(" - ") ? categoryValue.split(" - ")[0].trim() : categoryValue.trim();

  // Find the category in the list
  const selectedCat = categories.find((c) => {
    const fullValue = `${c.value} - ${c.label}`;
    return c.value === catCode || c.value === categoryValue || fullValue === categoryValue;
  });

  if (!selectedCat) {
    return { valid: false, error: "La categoría seleccionada no es válida para este evento." };
  }

  if (!profile) {
    // No profile selected, just validate age range
    if (age >= selectedCat.minAge && age <= selectedCat.maxAge) {
      return { valid: true };
    }
    return { valid: false, error: "La categoría seleccionada no corresponde a tu edad." };
  }

  if (profile === "competitivo") {
    // Must have profile "competitivo" and age must match
    if (selectedCat.profile !== "competitivo") {
      return { valid: false, error: "La categoría seleccionada no corresponde al perfil competitivo." };
    }
    if (age < selectedCat.minAge || age > selectedCat.maxAge) {
      return { valid: false, error: "La categoría seleccionada no corresponde a tu edad para el perfil competitivo." };
    }
    return { valid: true };
  }

  if (profile === "recreativo") {
    // Must have profile "recreativo" and age must match
    // Open categories (no profile) are also acceptable under recreativo
    if (selectedCat.profile && selectedCat.profile !== "recreativo") {
      return { valid: false, error: "La categoría seleccionada no corresponde al perfil recreativo." };
    }
    if (!selectedCat.profile || selectedCat.profile === "recreativo") {
      // For open categories (no profile), skip age check
      // For recreativo categories, check age
      if (selectedCat.profile === "recreativo") {
        if (age < selectedCat.minAge || age > selectedCat.maxAge) {
          return { valid: false, error: "La categoría seleccionada no corresponde a tu edad para el perfil recreativo." };
        }
      }
      return { valid: true };
    }
  }

  return { valid: false, error: "La categoría seleccionada no corresponde al perfil elegido." };
}

// ============================================================
// Helpers
// ============================================================

function makePair(
  prefix: string,
  name: string,
  minAge: number,
  maxAge: number,
  profile?: "competitivo" | "recreativo"
): CategoryOption[] {
  const range = minAge === 999 ? "70+" : `${minAge}-${maxAge}`;
  return [
    { value: `${prefix}-M`, label: `${name} Varones (${range})`, minAge, maxAge, gender: "M", profile },
    { value: `${prefix}-F`, label: `${name} Damas (${range})`, minAge, maxAge, gender: "F", profile },
  ];
}

function ageLabel(maxAge: number): string {
  return maxAge >= 999 ? "70+" : `${maxAge - 9}-${maxAge}`;
}

function ageLabel5(maxAge: number): string {
  return maxAge >= 999 ? "70+" : `${maxAge - 4}-${maxAge}`;
}

// ============================================================
// Generadores dinámicos por intervalo (5 o 10 años)
// ============================================================

/** Running / Carrera / Atletismo */
function generateRunning(interval: "5" | "10"): CategoryOption[] {
  const cats: CategoryOption[] = [];
  // Juvenil fijo 16-19
  cats.push(...makePair("RUN-JUV", "Juvenil", 16, 19));

  if (interval === "10") {
    cats.push(...makePair("RUN-LIB", "Libre", 20, 29));
    cats.push(...makePair("RUN-SMA", "Sub-Máster", 30, 39));
    cats.push(...makePair("RUN-MAA", "Máster A", 40, 49));
    cats.push(...makePair("RUN-MAB", "Máster B", 50, 59));
    cats.push(...makePair("RUN-MAC", "Máster C", 60, 69));
    cats.push(...makePair("RUN-PLU", "Plus", 70, 999));
  } else {
    // Cada 5 años: 20-24, 25-29, 30-34, ..., 65-69, 70+
    let start = 20;
    let idx = 0;
    const names5 = ["Libre A", "Libre B", "Sub-Máster A", "Sub-Máster B", "Máster A", "Máster B", "Máster C", "Máster D", "Máster E", "Máster F", "Plus"];
    while (start < 70) {
      const end = Math.min(start + (interval === "5" ? 4 : 9), start <= 60 ? start + (interval === "5" ? 4 : 9) : 999);
      const name = names5[idx] || `Grupo ${idx}`;
      cats.push(...makePair(`RUN-G${idx}`, name, start, end < 70 ? end : 999));
      start = end + 1;
      idx++;
    }
    cats.push(...makePair("RUN-PLU", "Plus", 70, 999));
  }

  return cats;
}

/** MTB / Ciclismo de Montaña */
function generateMTB(interval: "5" | "10"): CategoryOption[] {
  const cats: CategoryOption[] = [];

  if (interval === "10") {
    // VARONES - competitivo (UCI official categories)
    cats.push({ value: "MTB-JUV-M", label: "Juvenil Varones (15-18)", minAge: 15, maxAge: 18, gender: "M", profile: "competitivo" });
    cats.push({ value: "MTB-ELI-M", label: "Élite Varones (19-29)", minAge: 19, maxAge: 29, gender: "M", profile: "competitivo" });
    cats.push({ value: "MTB-MAA-M", label: "Máster A Varones (30-39)", minAge: 30, maxAge: 39, gender: "M", profile: "competitivo" });
    cats.push({ value: "MTB-MAB-M", label: "Máster B Varones (40-49)", minAge: 40, maxAge: 49, gender: "M", profile: "competitivo" });
    cats.push({ value: "MTB-MAC-M", label: "Máster C Varones (50-59)", minAge: 50, maxAge: 59, gender: "M", profile: "competitivo" });
    cats.push({ value: "MTB-MAD-M", label: "Máster D Varones (60+)", minAge: 60, maxAge: 999, gender: "M", profile: "competitivo" });
    // Recreativo
    cats.push({ value: "MTB-REC-M", label: "Recreativo Varones (25+)", minAge: 25, maxAge: 999, gender: "M", profile: "recreativo" });
    // DAMAS - competitivo (UCI official categories)
    cats.push({ value: "MTB-SPO-F", label: "Sport Femenino (15-29)", minAge: 15, maxAge: 29, gender: "F", profile: "competitivo" });
    cats.push({ value: "MTB-MAA-F", label: "Máster A Damas (30-39)", minAge: 30, maxAge: 39, gender: "F", profile: "competitivo" });
    cats.push({ value: "MTB-MAB-F", label: "Máster B Damas (40-49)", minAge: 40, maxAge: 49, gender: "F", profile: "competitivo" });
    cats.push({ value: "MTB-MAC-F", label: "Máster C Damas (50+)", minAge: 50, maxAge: 999, gender: "F", profile: "competitivo" });
  } else {
    // Cada 5 años
    // VARONES - competitivo
    cats.push({ value: "MTB-JUV-M", label: "Juvenil Varones (15-18)", minAge: 15, maxAge: 18, gender: "M", profile: "competitivo" });
    cats.push({ value: "MTB-ELI-M", label: "Élite Varones (19-24)", minAge: 19, maxAge: 24, gender: "M", profile: "competitivo" });
    cats.push({ value: "MTB-SMA-M", label: "Sub-Élite Varones (25-29)", minAge: 25, maxAge: 29, gender: "M", profile: "competitivo" });
    let start = 30;
    let idx = 1;
    while (start < 70) {
      const end = Math.min(start + 4, 69);
      cats.push({ value: `MTB-MA${idx}-M`, label: `Máster ${idx} Varones (${start}-${end})`, minAge: start, maxAge: end, gender: "M", profile: "competitivo" });
      start = end + 1;
      idx++;
    }
    // Recreativo
    cats.push({ value: "MTB-REC-M", label: "Recreativo Varones (25+)", minAge: 25, maxAge: 999, gender: "M", profile: "recreativo" });
    // DAMAS - competitivo
    cats.push({ value: "MTB-SPO-F", label: "Sport Femenino (15-24)", minAge: 15, maxAge: 24, gender: "F", profile: "competitivo" });
    cats.push({ value: "MTB-SMA-F", label: "Sub-Sport Femenino (25-29)", minAge: 25, maxAge: 29, gender: "F", profile: "competitivo" });
    start = 30; idx = 1;
    while (start < 70) {
      const end = Math.min(start + 4, 69);
      cats.push({ value: `MTB-MA${idx}-F`, label: `Máster ${idx} Damas (${start}-${end})`, minAge: start, maxAge: end, gender: "F", profile: "competitivo" });
      start = end + 1;
      idx++;
    }
  }

  // ABIERTAS (recreativo profile - accessible to anyone regardless of profile)
  cats.push({ value: "MTB-EBK", label: "E-Bike (Abierta)", minAge: 15, maxAge: 999, profile: "recreativo" });
  cats.push({ value: "MTB-100", label: "100 kg+ (Abierta)", minAge: 15, maxAge: 999, profile: "recreativo" });

  return cats;
}

/** Trekking / Trail Running */
function generateTrekking(interval: "5" | "10"): CategoryOption[] {
  const cats: CategoryOption[] = [];
  cats.push(...makePair("TRK-JUV", "Juvenil", 16, 19));

  if (interval === "10") {
    cats.push(...makePair("TRK-LIB", "Libre", 20, 29));
    cats.push(...makePair("TRK-M1", "Máster 1", 30, 39));
    cats.push(...makePair("TRK-M2", "Máster 2", 40, 49));
    cats.push(...makePair("TRK-M3", "Máster 3", 50, 59));
    cats.push(...makePair("TRK-LEY", "Leyendas", 60, 999));
  } else {
    let start = 20; let idx = 0;
    while (start < 70) {
      const end = Math.min(start + 4, 999);
      cats.push(...makePair(`TRK-G${idx}`, `Grupo ${idx}`, start, end));
      start = end + 1;
      idx++;
    }
    cats.push(...makePair("TRK-LEY", "Leyendas", 70, 999));
  }

  return cats;
}

/** Triatlón / Duatlón / Acuatlón (misma estructura) */
function generateMultiSport(prefix: string, interval: "5" | "10"): CategoryOption[] {
  const cats: CategoryOption[] = [];
  cats.push(...makePair(`${prefix}-JUN`, "Junior", 16, 19));

  if (interval === "10") {
    cats.push(...makePair(`${prefix}-A`, "Grupo A", 20, 29));
    cats.push(...makePair(`${prefix}-B`, "Grupo B", 30, 39));
    cats.push(...makePair(`${prefix}-C`, "Grupo C", 40, 49));
    cats.push(...makePair(`${prefix}-D`, "Grupo D", 50, 59));
    cats.push(...makePair(`${prefix}-E`, "Grupo E", 60, 999));
  } else {
    let start = 20; let idx = 0;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVW";
    while (start < 70) {
      const end = Math.min(start + 4, 999);
      const letter = letters[idx] || `${idx}`;
      cats.push(...makePair(`${prefix}-${letter}`, `Grupo ${letter}`, start, end));
      start = end + 1;
      idx++;
    }
  }

  return cats;
}

/** Virtual */
function generateVirtual(interval: "5" | "10"): CategoryOption[] {
  // Usa la misma lógica que Running
  return generateRunning(interval).map((c) => ({
    ...c,
    value: c.value.replace("RUN-", "VIR-"),
    label: c.label,
  }));
}

/** Recreativo (siempre igual) */
function generateRecreativo(): CategoryOption[] {
  return makePair("REC-LIB", "Libre", 25, 999);
}

/** Seguridad (siempre igual) */
function generateSeguridad(): CategoryOption[] {
  return [
    { value: "SEG-V1", label: "Varones 15-29 años", minAge: 15, maxAge: 29, gender: "M" },
    { value: "SEG-V2", label: "Varones 30-39 años", minAge: 30, maxAge: 39, gender: "M" },
    { value: "SEG-V3", label: "Varones 40+ años", minAge: 40, maxAge: 999, gender: "M" },
    { value: "SEG-D1", label: "Damas 15-29 años", minAge: 15, maxAge: 29, gender: "F" },
    { value: "SEG-D2", label: "Damas 30-39 años", minAge: 30, maxAge: 39, gender: "F" },
    { value: "SEG-D3", label: "Damas 40+ años", minAge: 40, maxAge: 999, gender: "F" },
  ];
}

// ============================================================
// Función principal: obtiene categorías por deporte e intervalo
// ============================================================

/**
 * Obtiene categorías para un deporte e intervalo de edad.
 * @param sportType - running, mtb, trekking, triathlon, duathlon, aquathlon, virtual, recreativo, seguridad, trail
 * @param interval  - "10" (cada 10 años) o "5" (cada 5 años). Default: "10"
 */
export function getCategoriesForSport(
  sportType: string,
  interval: "5" | "10" = "10"
): CategoryOption[] {
  switch (sportType) {
    case "running":    return generateRunning(interval);
    case "mtb":        return generateMTB(interval);
    case "trekking":   return generateTrekking(interval);
    case "trail":      return generateTrekking(interval);
    case "triathlon":  return generateMultiSport("TRI", interval);
    case "duathlon":   return generateMultiSport("DUA", interval);
    case "aquathlon":  return generateMultiSport("AQU", interval);
    case "virtual":    return generateVirtual(interval);
    case "recreativo": return generateRecreativo();
    case "seguridad":  return generateSeguridad();
    default:           return generateRunning(interval);
  }
}

/**
 * Obtiene categorías por deporte (compatibilidad con versiones anteriores)
 */
export function getCategoriesByGender(sportType: string): {
  male: CategoryOption[];
  female: CategoryOption[];
  open: CategoryOption[];
} {
  const cats = getCategoriesForSport(sportType, "10");
  return {
    male: cats.filter((c) => c.gender === "M"),
    female: cats.filter((c) => c.gender === "F"),
    open: cats.filter((c) => !c.gender),
  };
}

export function getAllCategories(): CategoryOption[] {
  const all: CategoryOption[] = [];
  const seen = new Set<string>();
  for (const sport of ["running", "mtb", "trekking", "triathlon", "duathlon", "aquathlon", "virtual", "recreativo", "seguridad"]) {
    for (const cat of getCategoriesForSport(sport, "10")) {
      if (!seen.has(cat.value)) {
        seen.add(cat.value);
        all.push(cat);
      }
    }
  }
  return all;
}

// ============================================================
// Cálculo de edad
// ============================================================

export function calculateAge(
  dateOfBirth: string,
  eventDate: string | Date,
  mode: string = "calendar_year"
): number {
  let birthDay: number, birthMonth: number, birthYear: number;

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

  let age = evtDate.getFullYear() - birthYear;
  const monthDiff = evtDate.getMonth() - (birthMonth - 1);
  if (monthDiff < 0 || (monthDiff === 0 && evtDate.getDate() < birthDay)) {
    age--;
  }
  return age;
}

// ============================================================
// Género
// ============================================================

export function normalizeGender(gender?: string): string | undefined {
  if (!gender) return undefined;
  const g = gender.toUpperCase();
  if (g === "M" || g === "MALE" || g === "MASCULINO") return "M";
  if (g === "F" || g === "FEMALE" || g === "FEMENINO") return "F";
  return g;
}

// ============================================================
// Asignación de categoría (la más específica)
// ============================================================

export function assignCategory(
  age: number,
  sportType: string = "running",
  gender?: string
): CategoryOption | null {
  const categories = getCategoriesForSport(sportType, "10");
  return assignCategoryFromList(age, categories, gender);
}

export function assignCategoryFromList(
  age: number,
  categories: CategoryOption[],
  gender?: string
): CategoryOption | null {
  if (!categories || categories.length === 0) return null;
  const normalizedGender = normalizeGender(gender);

  let genderFiltered: CategoryOption[];
  if (normalizedGender) {
    genderFiltered = categories.filter(
      (cat) => !cat.gender || cat.gender.toUpperCase() === normalizedGender
    );
  } else {
    genderFiltered = categories;
  }

  const sorted = [...genderFiltered].sort(
    (a, b) => (a.maxAge - a.minAge) - (b.maxAge - b.minAge)
  );

  for (const cat of sorted) {
    if (age >= cat.minAge && age <= cat.maxAge) {
      return cat;
    }
  }

  return sorted[0] || null;
}

// ============================================================
// NOVEDAD: Obtener TODAS las categorías elegibles
// Devuelve la más específica como "sugerida" y las demás como "opcionales"
// ============================================================

export interface CategorySuggestion {
  suggested: CategoryOption | null;      // La más específica (auto-asignada)
  eligible: CategoryOption[];            // Todas las categorías donde el participante califica
}

/**
 * Retorna TODAS las categorías en las que un participante es elegible.
 * La primera es la "sugerida" (más específica), las demás son opcionales.
 *
 * Ejemplo: un hombre de 28 años en MTB podría calificar para:
 *   - Sugerida: Élite Varones (19-29)  → la más específica
 *   - Opcionales: Recreativo Varones (25+), E-Bike (Abierta), 100 kg+ (Abierta)
 */
export function getEligibleCategories(
  age: number,
  categories: CategoryOption[],
  gender?: string
): CategorySuggestion {
  const normalizedGender = normalizeGender(gender);

  // Filtrar por género
  let genderFiltered: CategoryOption[];
  if (normalizedGender) {
    genderFiltered = categories.filter(
      (cat) => !cat.gender || cat.gender.toUpperCase() === normalizedGender
    );
  } else {
    genderFiltered = [...categories];
  }

  // Encontrar todas las categorías donde la edad está dentro del rango
  const eligible = genderFiltered.filter(
    (cat) => age >= cat.minAge && age <= cat.maxAge
  );

  // Ordenar por especificidad (rango más pequeño primero)
  eligible.sort((a, b) => (a.maxAge - a.minAge) - (b.maxAge - b.minAge));

  // La primera es la sugerida
  const suggested = eligible.length > 0 ? eligible[0] : null;

  return { suggested, eligible };
}

// ============================================================
// Utilidades
// ============================================================

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

export function parseEventCategories(
  categoriesStr: string | null | undefined,
  sportType: string = "running"
): CategoryOption[] {
  if (!categoriesStr || !categoriesStr.trim()) {
    return getCategoriesForSport(sportType, "10");
  }

  try {
    const parsed = JSON.parse(categoriesStr);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((c) => ({
        value: c.value || "",
        label: c.label || "",
        minAge: Number(c.minAge) || 0,
        maxAge: Number(c.maxAge) || 999,
        gender: c.gender || undefined,
        profile: c.profile || undefined,
      }));
    }
  } catch {
    // No es JSON
  }

  const values = categoriesStr.split(",").map((s) => s.trim()).filter(Boolean);
  if (values.length === 0) {
    return getCategoriesForSport(sportType, "10");
  }

  const allPresets = getAllCategories();
  const matched: CategoryOption[] = [];
  for (const val of values) {
    const found = allPresets.find((c) => c.value === val);
    if (found) matched.push(found);
  }

  return matched.length > 0 ? matched : getCategoriesForSport(sportType, "10");
}

export function serializeEventCategories(categories: CategoryOption[]): string {
  return JSON.stringify(
    categories.map((c) => ({
      value: c.value,
      label: c.label,
      minAge: c.minAge,
      maxAge: c.maxAge,
      gender: c.gender || undefined,
      profile: c.profile || undefined,
    }))
  );
}

export function parseDateDDMMYYYY(dateStr: string): Date | null {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month - 1, day);
}
