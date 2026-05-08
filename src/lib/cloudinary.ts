import { v2 as cloudinary } from "cloudinary";

function assertConfig() {
  const missing: string[] = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!process.env.CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
  if (!process.env.CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
  
  if (missing.length) {
    throw new Error(
      `Missing Cloudinary env vars: ${missing.join(", ")}. Add them to your .env.local file.`,
    );
  }
}

let _configured = false;

export function getCloudinary() {
  if (_configured) return cloudinary;
  
  assertConfig();
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  
  _configured = true;
  return cloudinary;
}

export function getCloudName(): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set");
  }
  return cloudName;
}