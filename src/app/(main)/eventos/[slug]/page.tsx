import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { getCategoriesForSport } from "@/lib/categories";
import { EventDetailPage } from "./EventDetailPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;

  let event;
  try {
    event = await db.event.findUnique({
      where: { slug },
      include: {
        _count: { select: { registrations: true } },
      },
    });
  } catch {
    notFound();
  }

  if (!event) {
    notFound();
  }

  // Get sport-specific categories
  const categories = getCategoriesForSport(event.sportType || "running");

  return (
    <EventDetailPage
      event={{
        ...event,
        registrationCount: event._count.registrations,
      }}
      categories={categories}
    />
  );
}
