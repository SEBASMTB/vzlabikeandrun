import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbSeeded: boolean | undefined
  dbInitialized: boolean | undefined
}

const SEED_EVENTS = [
  {
    id: "evt-la-culata-001",
    title: "LA CULATA",
    slug: "la-culata-2025",
    description: "Evento MTB en las montañas de La Culata. Un desafío para ciclistas de montaña con recorridos técnicos y paisajes espectaculares en plena serranía venezolana.",
    date: "2025-07-20T06:00:00.000Z",
    location: "La Culata, Mérida, Venezuela",
    distance: "40K MTB",
    category: "MTB",
    sportType: "mtb",
    imageUrl: "",
    bannerImage: "",
    price: 55,
    priceBs: 0,
    status: "upcoming",
    maxParticipants: 300,
    featured: true,
    organizer: "",
    prizes: "",
    rules: "",
    kitInfo: "",
    sponsors: "",
    categories: "",
    ageCalcMode: "event_day",
    categoryInterval: "10",
    hasShirt: true,
  },
  {
    id: "evt-campana-admirable-001",
    title: "CAMPAÑA ADMIRABLE",
    slug: "campana-admirable-2025",
    description: "Carrera conmemorativa de la Campaña Admirable. Une la historia y el deporte en este recorrido que celebra el legado de Bolívar. Una experiencia única para corredores y familias.",
    date: "2025-06-15T06:00:00.000Z",
    location: "Venezuela",
    distance: "10K",
    category: "Carrera",
    sportType: "running",
    imageUrl: "",
    bannerImage: "",
    price: 30,
    priceBs: 0,
    status: "upcoming",
    maxParticipants: 1500,
    featured: true,
    organizer: "",
    prizes: "",
    rules: "",
    kitInfo: "",
    sponsors: "",
    categories: "",
    ageCalcMode: "calendar_year",
    categoryInterval: "10",
    hasShirt: true,
  },
  {
    id: "cmouqk7300000peaj68nvak7u",
    title: "WOMENS RUN",
    slug: "womens-run-2024",
    description: "La carrera más grande de mujeres en Venezuela. Únete a miles de corredoras en esta emocionante prueba de 5K. Un evento diseñado para celebrar la fuerza, determinación y espíritu deportivo de la mujer venezolana.",
    date: "2026-06-06T00:16:23.770Z",
    location: "Caracas, Venezuela",
    distance: "5K",
    category: "Carrera",
    sportType: "running",
    imageUrl: "/event-womens-run.jpg",
    bannerImage: "",
    price: 35,
    priceBs: 0,
    status: "upcoming",
    maxParticipants: 2000,
    featured: true,
    organizer: "",
    prizes: "",
    rules: "",
    kitInfo: "",
    sponsors: "",
    categories: "",
    ageCalcMode: "calendar_year",
    categoryInterval: "10",
    hasShirt: true,
  },
  {
    id: "cmouqk7320001peaj38mchqx3",
    title: "21K LA AUTOPISTA",
    slug: "21k-la-autopista",
    description: "La media maratón más emblemática del país. Recorre la autopista en una experiencia única con cierre total de vías. Miles de corredores disfrutan de este evento que combina deportividad y espectacularidad.",
    date: "2026-08-23T00:16:23.770Z",
    location: "Autopista Regional del Centro, Venezuela",
    distance: "21K",
    category: "Carrera",
    sportType: "running",
    imageUrl: "/event-21k-autopista.jpg",
    bannerImage: "",
    price: 65,
    priceBs: 0,
    status: "upcoming",
    maxParticipants: 5000,
    featured: true,
    organizer: "",
    prizes: "",
    rules: "",
    kitInfo: "",
    sponsors: "",
    categories: "",
    ageCalcMode: "calendar_year",
    categoryInterval: "10",
    hasShirt: true,
  },
  {
    id: "cmouqk7330002peajacov64kx",
    title: "FARMALUNA 10K",
    slug: "farmaluna-10k-2024",
    description: "Corre bajo la luz de la luna en esta mágica carrera nocturna. La Farmaluna 10K te ofrece una experiencia diferente con iluminación especial, música en vivo y un ambiente incomparable.",
    date: "2026-05-22T00:16:23.770Z",
    location: "Caracas, Venezuela",
    distance: "10K",
    category: "Carrera",
    sportType: "running",
    imageUrl: "/event-farmaluna.jpg",
    bannerImage: "",
    price: 45,
    priceBs: 0,
    status: "upcoming",
    maxParticipants: 3000,
    featured: false,
    organizer: "",
    prizes: "",
    rules: "",
    kitInfo: "",
    sponsors: "",
    categories: "",
    ageCalcMode: "calendar_year",
    categoryInterval: "10",
    hasShirt: true,
  },
  {
    id: "cmouqk7340003peajm6kd9t8x",
    title: "LA RUTA DIGITAL",
    slug: "la-ruta-digital-2024",
    description: "El primer evento virtual integrado con tecnología de punta. Corre desde cualquier lugar, registra tu recorrido y compite con atletas de todo el país. Resultados en tiempo real a través de nuestra plataforma VBRWorks.",
    date: "2026-06-07T00:16:23.770Z",
    location: "Virtual - Desde cualquier lugar",
    distance: "10K Virtual",
    category: "Virtual",
    sportType: "running",
    imageUrl: "/event-ruta-digital.jpg",
    bannerImage: "",
    price: 25,
    priceBs: 0,
    status: "upcoming",
    maxParticipants: 10000,
    featured: false,
    organizer: "",
    prizes: "",
    rules: "",
    kitInfo: "",
    sponsors: "",
    categories: "",
    ageCalcMode: "calendar_year",
    categoryInterval: "10",
    hasShirt: true,
  },
  {
    id: "cmouqk7350004peajb9ekzxqd",
    title: "MARATÓN DE CARACAS",
    slug: "maraton-caracas-2024",
    description: "El maratón más importante de Venezuela. 42 kilómetros de pura emoción recorriendo las calles más emblemáticas de la capital. Un desafío para los corredores más exigentes.",
    date: "2026-07-06T00:16:23.770Z",
    location: "Caracas, Venezuela",
    distance: "42K",
    category: "Carrera",
    sportType: "running",
    imageUrl: "/event-maraton-caracas.jpg",
    bannerImage: "",
    price: 85,
    priceBs: 0,
    status: "upcoming",
    maxParticipants: 4000,
    featured: false,
    organizer: "",
    prizes: "",
    rules: "",
    kitInfo: "",
    sponsors: "",
    categories: "",
    ageCalcMode: "calendar_year",
    categoryInterval: "10",
    hasShirt: true,
  },
  {
    id: "cmouqk7360005peajp7h5ns41",
    title: "TRIATLÓN VZLA",
    slug: "triatlon-vzla-2024",
    description: "El triatlón más completo de Venezuela. Distancia olímpica: 1.5km de natación, 40km de ciclismo y 10km de carrera. Un evento para atletas que buscan superar sus límites en tres disciplinas.",
    date: "2026-08-05T00:16:23.770Z",
    location: "Valencia, Venezuela",
    distance: "Distancia Olímpica",
    category: "Triatlón",
    sportType: "running",
    imageUrl: "/event-triatlon.jpg",
    bannerImage: "",
    price: 120,
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
    ageCalcMode: "calendar_year",
    categoryInterval: "10",
    hasShirt: true,
  },
];

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "distance" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'running',
    "sportType" TEXT NOT NULL DEFAULT 'running',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "bannerImage" TEXT NOT NULL DEFAULT '',
    "price" REAL NOT NULL DEFAULT 0,
    "priceBs" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "maxParticipants" INTEGER NOT NULL DEFAULT 500,
    "featured" BOOLEAN NOT NULL DEFAULT 0,
    "organizer" TEXT NOT NULL DEFAULT '',
    "prizes" TEXT NOT NULL DEFAULT '',
    "rules" TEXT NOT NULL DEFAULT '',
    "kitInfo" TEXT NOT NULL DEFAULT '',
    "sponsors" TEXT NOT NULL DEFAULT '',
    "categories" TEXT NOT NULL DEFAULT '',
    "ageCalcMode" TEXT NOT NULL DEFAULT 'calendar_year',
    "categoryInterval" TEXT NOT NULL DEFAULT '10',
    "hasShirt" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");

CREATE TABLE IF NOT EXISTS "Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL DEFAULT '',
    "gender" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "shirtSize" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "team" TEXT NOT NULL DEFAULT '',
    "emergencyContact" TEXT NOT NULL DEFAULT '',
    "emergencyPhone" TEXT NOT NULL DEFAULT '',
    "paymentMethod" TEXT NOT NULL DEFAULT '',
    "paymentRef" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "waiverAccepted" BOOLEAN NOT NULL DEFAULT 0,
    "bibNumber" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mtbProfile" TEXT NOT NULL DEFAULT '',
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" REAL NOT NULL DEFAULT 0,
    "priceBs" REAL NOT NULL DEFAULT 0,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "images" TEXT NOT NULL DEFAULT '[]',
    "sizes" TEXT NOT NULL DEFAULT '[]',
    "color" TEXT NOT NULL DEFAULT '',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ProductOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL DEFAULT '',
    "size" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" REAL NOT NULL DEFAULT 0,
    "totalPriceBs" REAL NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL DEFAULT '',
    "paymentRef" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
`;

let initPromise: Promise<void> | null = null;

async function initAndSeed(prisma: PrismaClient) {
  if (globalForPrisma.dbInitialized) return;
  
  // If init is already in progress, wait for it
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Create tables if they don't exist
      console.log("[DB] Verificando/creando tablas...");
      const statements = CREATE_TABLES_SQL.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const sql of statements) {
        await prisma.$executeRawUnsafe(sql);
      }
      console.log("[DB] Tablas verificadas.");

      // Seed events if empty
      const count = await prisma.event.count();
      if (count === 0) {
        console.log("[DB] Base de datos vacía, sembrando eventos iniciales...");
        for (const event of SEED_EVENTS) {
          await prisma.event.create({
            data: {
              ...event,
              createdAt: new Date("2026-05-07T00:16:23.772Z"),
              updatedAt: new Date("2026-05-07T00:16:23.772Z"),
            },
          });
        }
        console.log(`[DB] ${SEED_EVENTS.length} eventos sembrados exitosamente.`);
      }

      globalForPrisma.dbInitialized = true;
      globalForPrisma.dbSeeded = true;
    } catch (err) {
      console.error("[DB] Error al inicializar base de datos:", err);
      globalForPrisma.dbInitialized = false;
      initPromise = null; // Allow retry on error
    }
  })();

  return initPromise;
}

function createPrismaClient() {
  // Priority: 1) Turso (libsql://), 2) DATABASE_URL, 3) /tmp fallback in prod
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''
  const tursoToken = process.env.TURSO_AUTH_TOKEN || ''
  const dbUrl = process.env.DATABASE_URL || ''

  // 1. Turso remote database (PREFERRED in production)
  if (tursoUrl.startsWith('libsql://')) {
    console.log("[DB] Usando Turso (base de datos remota)")
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoToken || undefined,
    })
    return new PrismaClient({ adapter })
  }

  // 2. DATABASE_URL (local dev or file-based)
  if (dbUrl.startsWith('file:')) {
    console.log(`[DB] Usando SQLite local: ${dbUrl}`)
    const adapter = new PrismaLibSQL({ url: dbUrl })
    return new PrismaClient({ adapter })
  }

  if (dbUrl.startsWith('libsql://')) {
    console.log("[DB] Usando DATABASE_URL (libsql)")
    const adapter = new PrismaLibSQL({
      url: dbUrl,
      authToken: tursoToken || undefined,
    })
    return new PrismaClient({ adapter })
  }

  // 3. Last resort: /tmp in production
  if (process.env.NODE_ENV === 'production') {
    console.log("[DB] WARNING: Usando /tmp (datos temporales, se pierden al reiniciar)")
    const adapter = new PrismaLibSQL({ url: 'file:/tmp/vzlabike.db' })
    return new PrismaClient({ adapter })
  }

  // Fallback: direct PrismaClient (local dev)
  console.log("[DB] Usando PrismaClient directo")
  return new PrismaClient()
}

const _prismaClient =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _prismaClient

// Proxy that ensures DB is initialized before every query in production
export const db = new Proxy(_prismaClient, {
  get(target, prop) {
    if (prop === 'then' || prop === 'toJSON' || typeof prop === 'symbol') {
      return Reflect.get(target, prop);
    }
    const value = (target as any)[prop];
    if (typeof value !== 'function') return value;
    // In production, ensure DB is initialized before any Prisma operation
    if (process.env.NODE_ENV === 'production') {
      return function(this: any, ...args: any[]) {
        const self = this === db ? target : this;
        if (!globalForPrisma.dbInitialized) {
          return initAndSeed(target).then(() => value.apply(self, args));
        }
        return value.apply(self, args);
      };
    }
    return value.bind(target);
  }
});

// Auto-init in production (Vercel) - create tables and seed if needed
if (process.env.NODE_ENV === 'production') {
  initAndSeed(_prismaClient).catch(console.error);
}
