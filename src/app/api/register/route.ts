import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const { email, password, name, sso, role } = await req.json();

    // If role is provided, ensure only admins can set it
    if (role && (!session || session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json(
        { error: "Unauthorized to set user role" },
        { status: 401 }
      );
    }

    if (!email || !password || !name || !sso) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with specified role if admin, otherwise default to PENDING
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        sso,
        role: role || UserRole.PENDING,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
