import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/actions";
import { errorHandling } from "@/manejoStatus";

const FOLDER = "vehiculos";

export async function GET(request) {
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  const result = await cloudinary.api.resources_by_asset_folder(FOLDER, {
    max_results: limit,
  });

  return NextResponse.json(result.resources, { status: 200 });
}

export async function POST(request) {
  try {
    await verifyUser(request.headers.get("Authorization"));

    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer.length) {
      throw { code: 400, message: "Image is required" };
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            asset_folder: FOLDER,
            format: "webp",
            /*aspect_ratio: "1",
            crop: "fill",
            width: 852,*/
            gravity: "center",
            invalidate: true,
            use_filename: true,
            unique_filename: true,
          },
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          },
        )
        .end(buffer);
    });

    const query = await prisma.images.create({
      data: {
        url: result.url,
        nombre: result.display_name,
      },
    });

    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
