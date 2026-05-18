import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// One-time migration: add missing columns to Event table
export async function GET() {
  try {
    const results: string[] = [];

    // Check current columns
    const cols = (await db.$queryRawUnsafe<Array<{ name: string }>>(
      `PRAGMA table_info("Event")`
    )) as Array<{ name: string }>;
    const colNames = new Set(cols.map((c) => c.name));
    results.push(`Current Event columns: ${[...colNames].join(", ")}`);

    // Add registrationMode if missing
    if (!colNames.has("registrationMode")) {
      await db.$executeRawUnsafe(
        `ALTER TABLE "Event" ADD COLUMN "registrationMode" TEXT NOT NULL DEFAULT 'individual'`
      );
      results.push("Added registrationMode column");
    }

    // Add maxGroupSize if missing
    if (!colNames.has("maxGroupSize")) {
      await db.$executeRawUnsafe(
        `ALTER TABLE "Event" ADD COLUMN "maxGroupSize" INTEGER NOT NULL DEFAULT 10`
      );
      results.push("Added maxGroupSize column");
    }

    // Verify
    const cols2 = (await db.$queryRawUnsafe<Array<{ name: string }>>(
      `PRAGMA table_info("Event")`
    )) as Array<{ name: string }>;
    results.push(`Updated Event columns: ${cols2.map((c) => c.name).join(", ")}`);

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[Setup] Error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
