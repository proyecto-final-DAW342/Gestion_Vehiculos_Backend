import { errorHandling } from "@/manejoStatus";
import { obtenerCarburantes } from "@/services/gasolinerasAPI";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const carburantes = await obtenerCarburantes();

    return NextResponse.json(carburantes, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
