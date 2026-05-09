import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const events = await db.event.findMany({
      orderBy: { date: "asc" },
      include: {
        _count: { select: { registrations: true } },
      },
    });
    return NextResponse.json(events);
  } catch (err) {
    console.error("[API /events] Error:", err);
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const {
      title, slug, description, date, location, distance, category,
      sportType, imageUrl, bannerImage, price, priceBs,
      maxParticipants, featured, status,
      organizer, prizes, rules, kitInfo, sponsors, categories,
      ageCalcMode, hasShirt,
    } = body;

    if (!title || !slug || !date || !location || !distance || !category) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const event = await db.event.create({
      data: {
        title,
        slug,
        description: description || "",
        date: new Date(date),
        location,
        distance,
        category: category || "running",
        sportType: sportType || category || "running",
        imageUrl: imageUrl || "",
        bannerImage: bannerImage || "",
        price: price || 0,
        priceBs: priceBs || 0,
        maxParticipants: maxParticipants || 500,
        featured: featured || false,
        status: status || "upcoming",
        organizer: organizer || "",
        prizes: prizes || "",
        rules: rules || "",
        kitInfo: kitInfo || "",
        sponsors: sponsors || "",
        categories: categories || "",
        ageCalcMode: ageCalcMode || "calendar_year",
        hasShirt: hasShirt !== false,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("Error creating event:", err);
    return NextResponse.json(
      { error: "Error al crear evento", detail: String(err) },
      { status: 500 }
    );
  }
}
