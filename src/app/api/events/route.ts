import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: { date: "asc" },
    });
    return NextResponse.json(events);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, description, date, location, distance, category, imageUrl, price, maxParticipants, featured } = body;

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
        category,
        imageUrl: imageUrl || "",
        price: price || 0,
        maxParticipants: maxParticipants || 500,
        featured: featured || false,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear evento" },
      { status: 500 }
    );
  }
}
