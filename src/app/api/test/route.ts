import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Test database connection
    const user = await db.user.findFirst({
      where: {
        email: "test@example.com",
      },
    });

    if (user) {
      return NextResponse.json({
        message: "Database connection successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    }

    return NextResponse.json({
      message: "No test user found",
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { error: "Database connection failed", details: error },
      { status: 500 }
    );
  }
}
