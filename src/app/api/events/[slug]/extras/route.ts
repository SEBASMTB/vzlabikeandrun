import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    const extras = await db.eventExtra.findMany({
      where: { eventId: event.id },
      orderBy: { sortOrder: "asc" },
    });

    // Parse sizes JSON for each extra
    const parsedExtras = extras.map((extra) => ({
      ...extra,
      sizes: JSON.parse(extra.sizes || "[]"),
    }));

    return NextResponse.json(parsedExtras);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener extras del evento" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, price, hasSizes, sizes, included, sortOrder } = body;

    if (!name) {
      return NextResponse.json(
        { error: "El nombre del extra es requerido" },
        { status: 400 }
      );
    }

    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    const extra = await db.eventExtra.create({
      data: {
        eventId: event.id,
        name,
        price: price ?? 0,
        hasSizes: hasSizes ?? false,
        sizes: sizes ? JSON.stringify(sizes) : "[]",
        included: included ?? false,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(
      {
        ...extra,
        sizes: JSON.parse(extra.sizes || "[]"),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error al crear extra" },
      { status: 500 }
    );
  }
}
