import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for Cloudinary uploads.`);
  }
  return value;
}

export function getCloudinary() {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: requiredEnv("CLOUDINARY_CLOUD_NAME"),
      api_key: requiredEnv("CLOUDINARY_API_KEY"),
      api_secret: requiredEnv("CLOUDINARY_API_SECRET"),
      secure: true,
    });
    isConfigured = true;
  }

  return cloudinary;
}

export const COMMUNITY_UPLOAD_FOLDER = "strata/community";
