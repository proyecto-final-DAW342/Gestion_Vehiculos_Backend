import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { verifyUser } from "@/userVerification";
import { errorHandling } from "@/manejoStatus";



export async function GET(request) {
    const offset = +request.nextUrl.searchParams.get("offset") || 0;
    const limit = +request.nextUrl.searchParams.get("limit") || 10;

    try {
        const viajes = await prisma.viaje.findMany({
            take: limit,
            skip: offset,
            include: {
                trayectos: true,
            },
        });

        return NextResponse.json(viajes, { status: 200 });
    } catch (error) {
        return errorHandling(error);
    }
}

export async function POST(request) {

    try {
        await verifyUser(request.headers.get("Authorization"));
        const { id } = await request.json();

        if (id === undefined) {
            return NextResponse.json(
                { error: "Missing data" },
                { status: 400 }
            );
        }

        const viaje = await prisma.viaje.create({
            data: { id },
            include: { trayectos: true },
        });

        return NextResponse.json(viaje, { status: 201 });
    } catch (error) {
        return errorHandling(error);
    }
}
