import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (
    !session?.user ||
    !["ADMIN", "PAYROLL_STAFF"].includes(session.user.role)
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const pendingRecords = await db.timePunch.findMany({
      where: {
        isDigitallySigned: false,
        supervisorId: null, // Changed from supervisor: null to supervisorId: null
      },
      include: {
        employee: {
          select: {
            name: true,
            sso: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pendingRecords);
  } catch (error) {
    console.error("Failed to fetch pending records:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
