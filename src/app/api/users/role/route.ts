import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, newRole } = await req.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that newRole is a valid UserRole
    if (!Object.values(UserRole).includes(newRole as UserRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: newRole as UserRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
