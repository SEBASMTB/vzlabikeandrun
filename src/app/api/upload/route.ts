import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "banner" or "card"

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo de 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process with sharp and return as base64 data URL (works on Vercel read-only FS)
    let processedBuffer: Buffer;

    if (type === "banner") {
      processedBuffer = await sharp(buffer)
        .resize(1400, 600, { fit: "cover", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } else {
      processedBuffer = await sharp(buffer)
        .resize(600, 600, { fit: "cover", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    const base64 = processedBuffer.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}
