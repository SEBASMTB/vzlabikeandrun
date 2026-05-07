import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      idNumber,
      gender,
      dateOfBirth,
      shirtSize,
      category,
      team,
      emergencyContact,
      emergencyPhone,
      paymentMethod,
      paymentRef,
      waiverAccepted,
    } = body;

    if (!firstName || !lastName || !email || !phone || !idNumber || !gender || !dateOfBirth || !category) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Selecciona un método de pago" },
        { status: 400 }
      );
    }

    if (!waiverAccepted) {
      return NextResponse.json(
        { error: "Debes aceptar la liberación de responsabilidad" },
        { status: 400 }
      );
    }

    // Check event exists by slug
    const event = await db.event.findUnique({ where: { slug } });
    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Check registration count
    const regCount = await db.registration.count({ where: { eventId: event.id } });
    if (regCount >= event.maxParticipants) {
      return NextResponse.json(
        { error: "El evento ha alcanzado el máximo de participantes" },
        { status: 400 }
      );
    }

    // Check duplicate email
    const existingReg = await db.registration.findFirst({
      where: { eventId: event.id, email },
    });
    if (existingReg) {
      return NextResponse.json(
        { error: "Ya existe una inscripción con este email para este evento" },
        { status: 400 }
      );
    }

    // Generate bib number
    const bibNumber = regCount + 1;

    const registration = await db.registration.create({
      data: {
        eventId: event.id,
        firstName,
        lastName,
        email,
        phone,
        gender,
        dateOfBirth,
        category,
        team: team || "",
        emergencyContact: emergencyContact || "",
        emergencyPhone: emergencyPhone || "",
        paymentMethod: paymentMethod || "",
        paymentRef: paymentRef || "",
        waiverAccepted: waiverAccepted || false,
        status: "pending",
        bibNumber,
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar inscripción" },
      { status: 500 }
    );
  }
}
