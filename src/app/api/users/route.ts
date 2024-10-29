import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== "PAYROLL_STAFF") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const users = await db.user.findMany({
      where: {
        role: {
          in: ["ASSOCIATE", "SUPERVISOR"],
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
        sso: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
