import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; extraId: string }> }
) {
  try {
    const { extraId } = await params;
    const body = await request.json();
    const { name, price, hasSizes, sizes, included, sortOrder } = body;

    const existing = await db.eventExtra.findUnique({
      where: { id: extraId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Extra no encontrado" },
        { status: 404 }
      );
    }

    const extra = await db.eventExtra.update({
      where: { id: extraId },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price }),
        ...(hasSizes !== undefined && { hasSizes }),
        ...(sizes !== undefined && { sizes: JSON.stringify(sizes) }),
        ...(included !== undefined && { included }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({
      ...extra,
      sizes: JSON.parse(extra.sizes || "[]"),
    });
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar extra" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; extraId: string }> }
) {
  try {
    const { extraId } = await params;

    const existing = await db.eventExtra.findUnique({
      where: { id: extraId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Extra no encontrado" },
        { status: 404 }
      );
    }

    // Delete all RegistrationExtra records first, then the EventExtra
    await db.registrationExtra.deleteMany({
      where: { eventExtraId: extraId },
    });

    await db.eventExtra.delete({
      where: { id: extraId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar extra" },
      { status: 500 }
    );
  }
}
