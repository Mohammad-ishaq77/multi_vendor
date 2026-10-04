import fs from "fs/promises";
import path from "path";
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

/** Where development stub uploads are written so the returned URL actually resolves. */
export const LOCAL_UPLOAD_DIR = path.resolve("uploads");

const safeSegment = (value, fallback) =>
  String(value || "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || fallback;

async function writeLocalStub(buffer, { folder, filename }) {
  const dir = path.join(LOCAL_UPLOAD_DIR, safeSegment(folder, "nearmart"));
  await fs.mkdir(dir, { recursive: true });
  const name = safeSegment(filename, `upload-${Date.now()}`);
  await fs.writeFile(path.join(dir, name), buffer);
  return `/uploads/${path.relative(LOCAL_UPLOAD_DIR, dir).split(path.sep).join("/")}/${name}`;
}

/** Upload a multer buffer. Falls back to a locally served file when not configured. */
export async function uploadBuffer(buffer, { folder = "nearmart", filename = `upload-${Date.now()}` } = {}) {
  if (!configured) {
    const url = await writeLocalStub(buffer, { folder, filename });
    return { url, publicId: null, stub: true };
  }
  const b64 = buffer.toString("base64");
  const res = await cloudinary.uploader.upload(
    `data:application/octet-stream;base64,${b64}`,
    { folder, public_id: filename, resource_type: "auto" }
  );
  return { url: res.secure_url, publicId: res.public_id, stub: false };
}
