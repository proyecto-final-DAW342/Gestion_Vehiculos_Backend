"use server";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

cloudinary.config(process.env.CLOUDINARY_URL || "");

export async function uploadFile(prevState, file) {
  const fileBuffer = await file.arrayBuffer();

  console.log(file);

  let mime = file.type;
  let encoding = "base64";
  let base64Data = Buffer.from(fileBuffer).toString("base64");
  let fileUri = "data:" + mime + ";" + encoding + "," + base64Data;

  console.log(fileUri);

  const uploadToCloudinary = () => {
    return new Promise((resolve, reject) => {
      // a partir de Junio 2024 cloudinary usa dynamic folders
      // en este caso es recomendable usar propiedad asset_folder
      let result = cloudinary.uploader
        .upload(fileUri, {
          asset_folder: "galeria",
          // public_id: path.parse(file.name).name,
          use_filename: true,
          unique_filename: true,
          invalidate: true,
          format: "avif", // webp, png
        })
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  };

  try {
    const result = await uploadToCloudinary();
    // let imageUrl = result.secure_url;

    return { success: `Archivo ${file.name} subido` };
  } catch (error) {
    return { error: error.message };
  }
}

export async function verifyUser(authHeader) {
  //try {
  if (!authHeader) {
    throw { code: 401 };
  }

  const token = authHeader.split(" ")[1] || authHeader;

  const { dni } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({ where: { dni } });

  if (!user) {
    throw { code: 401 };
  }
  //} catch (error) {
  throw error;
  //}
}

export async function getBodyFromRequest(request) {
  const body = await request.json().catch(() => {
    throw {
      code: 400,
      message:
        "Error del json. El cuerpo de la petición es incorrecto. Asegurate de que existe y los campos son correctos",
    };
  });
  if (!body)
    throw {
      code: 400,
      message: "Error. El cuerpo es null",
    };
}
