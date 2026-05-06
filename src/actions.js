"use server";
import { v2 as cloudinary } from "cloudinary";
import { verifyUser } from "./userVerification";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

cloudinary.config(process.env.CLOUDINARY_URL || "");

export async function uploadFile(file) {
  const fileBuffer = await file.arrayBuffer();

  //console.log(file);

  let mime = file.type;
  let encoding = "base64";
  let base64Data = Buffer.from(fileBuffer).toString("base64");
  let fileUri = "data:" + mime + ";" + encoding + "," + base64Data;

  //console.log(fileUri);

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

    return { nombre: result.public_id, url: result.url, fromCloudinary: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getBody(request, type) {
  const contentType = request.headers.get("content-type") || "";
  let body;

  try {
    if (contentType.includes("application/json"))
      body = await getBodyFromRequest(request);

    if (contentType.includes("multipart/form-data"))
      body = await getBodyFromFormData(request);

    body.checked = false;

    normalizeBody(body, type);

    return body;
  } catch (error) {
    throw error;
  }
}

export async function getUserVerifiedBody(request, type) {
  try {
    console.log(request.nextUrl.pathname);
    await verifyUser(request.headers.get("Authorization"));

    return getBodyWithoutUserVerification(request, type);
  } catch (error) {
    throw error;
  }
}

function normalizeBody(body, type) {
  if (
    type === "CONDUCTOR" &&
    body.image &&
    Array.isArray(body.image) &&
    body.image[0]
  ) {
    body.image.forEach((img, i) => {
      i && cloudinary.uploader.destroy(img.nombre);
    });

    body.image = body.image[0];
  }
}

async function getBodyFromRequest(request) {
  const body = await request.json().catch(() => {
    throw {
      code: 400,
      customMessage:
        "Error del json. El cuerpo de la petición es incorrecto. Asegurate de que existe y no tiene errores",
    };
  });
  if (!body)
    throw {
      code: 400,
      customMessage: "Error. El cuerpo es null",
    };

  return body;
}

async function getBodyFromFormData(request) {
  const fileLimit = 5;
  let body = {};
  const formData = await request.formData();
  for (let [key, value] of formData) {
    if (body[key] !== undefined)
      if (!Array.isArray(body[key])) body[key] = [body[key]];

    if (value instanceof File && value.size) {
      if (Array.isArray(body[key]) && body[key].length >= fileLimit) {
        throw {
          code: 400,
          customMessage: "El límite de imágenes es " + fileLimit,
        };
      }

      value = await uploadFile(value);
    }

    if (body[key] !== undefined) {
      body[key].push(value);
      continue;
    }

    body[key] = value;
  }

  return body;
}
