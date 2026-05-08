import { NextRequest, NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const teacherId = formData.get("teacherId") as string | null;

    if (!file || !teacherId) {
      return NextResponse.json({ error: "Missing file or teacherId" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceType = file.type.startsWith("image/") ? "image" : "raw";
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");

    const cloudinary = getCloudinary();
    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `contents/${teacherId}`,
          public_id: `${Date.now()}_${safeName}`,
          type: "upload",
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Upload failed"));
          } else {
            resolve(uploadResult as unknown as Record<string, unknown>);
          }
        },
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      version: result.version,
      resourceType: result.resource_type,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
