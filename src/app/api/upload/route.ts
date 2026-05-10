import { NextRequest, NextResponse } from "next/server";

/**
 * Upload API — Converts image to base64 data URL.
 * No external storage needed — the image is embedded inline as a data URL.
 * This keeps things simple for Vercel free plan (no S3/Blob needed).
 *
 * Max file size: 2MB
 * Accepted: image/jpeg, image/png, image/webp, image/gif
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "card" or "banner"

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF" },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande. Máximo 2MB" },
        { status: 400 }
      );
    }

    // Convert to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If the image is large, compress it by converting to JPEG with reduced quality
    // For simplicity, we'll use the raw base64 (Next.js Image component handles data URLs)
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      size: file.size,
      type: file.type,
      name: file.name,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}
