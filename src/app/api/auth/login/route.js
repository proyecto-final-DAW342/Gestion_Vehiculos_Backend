import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";

export async function POST(request) {
  try {
    const { dni, password } = await request.json();

    if (!dni || !password) {
      throw {
        code: 400,
        customMessage: "Missing DNI or password",
      };
    }

    const user = await prisma.user.findUnique({ where: { dni } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const { fullName, isActive, roles, email } = user;

    // FIRMAMOS TOKEN
    const token = jwt.sign({ dni }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    return NextResponse.json(
      { dni, email, fullName, isActive, roles, token },
      { status: 201, statusText: "Login successful" },
    );
  } catch (error) {
    return errorHandling(error);
  }
}
