import { v2 as cloudinary } from "cloudinary";
import { config } from "./env.js";

const configured = Boolean(
  config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret
);

if (configured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export const isCloudinaryConfigured = () => configured;

/** Upload a multer buffer. Falls back to a local stub URL when not configured. */
export async function uploadBuffer(buffer, { folder = "nearmart", filename = `upload-${Date.now()}` } = {}) {
  if (!configured) {
    return { url: `/uploads/${folder}/${filename}`, publicId: null, stub: true };
  }
  const b64 = buffer.toString("base64");
  const res = await cloudinary.uploader.upload(
    `data:application/octet-stream;base64,${b64}`,
    { folder, public_id: filename, resource_type: "auto" }
  );
  return { url: res.secure_url, publicId: res.public_id, stub: false };
}
