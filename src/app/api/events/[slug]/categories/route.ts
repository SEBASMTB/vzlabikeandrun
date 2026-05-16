import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getCategoriesForSport, parseEventCategories, CategoryOption } from "@/lib/categories";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await db.event.findUnique({
      where: { slug },
      select: {
        sportType: true,
        ageCalcMode: true,
        categoryInterval: true,
        date: true,
        title: true,
        categories: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    let categories: CategoryOption[] = [];

    // Parse categories from the event's categories JSON field
    if (event.categories && event.categories.trim()) {
      categories = parseEventCategories(event.categories, event.sportType || "running");
    }

    // Fallback: generate categories based on sport type and interval
    if (categories.length === 0) {
      const interval = (event.categoryInterval === "5" ? "5" : "10") as "5" | "10";
      categories = getCategoriesForSport(event.sportType || "running", interval);
    }

    return NextResponse.json({
      categories,
      ageCalcMode: event.ageCalcMode || "calendar_year",
      sportType: event.sportType,
      eventDate: event.date,
    });
  } catch (err) {
    console.error("[categories] Error:", err);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
