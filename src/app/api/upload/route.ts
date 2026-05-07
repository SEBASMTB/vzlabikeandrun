import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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

    // Process with sharp
    let processedBuffer: Buffer;
    const ext = path.extname(file.name) || ".jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const publicDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(publicDir, { recursive: true });

    if (type === "banner") {
      // Banner: 1400x600
      processedBuffer = await sharp(buffer)
        .resize(1400, 600, { fit: "cover", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    } else {
      // Card image: 600x600
      processedBuffer = await sharp(buffer)
        .resize(600, 600, { fit: "cover", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    const finalFileName = `${fileName}.jpg`;
    const filePath = path.join(publicDir, finalFileName);
    await writeFile(filePath, processedBuffer);

    const publicUrl = `/uploads/${finalFileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}
