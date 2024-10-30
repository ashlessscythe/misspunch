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
    const assignedRecords = await db.timePunch.findMany({
      where: {
        isDigitallySigned: false,
        NOT: {
          supervisor: null, // Has been assigned to a supervisor
        },
      },
      include: {
        employee: {
          select: {
            name: true,
            sso: true,
          },
        },
        supervisor: {
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

    return NextResponse.json(assignedRecords);
  } catch (error) {
    console.error("Failed to fetch assigned records:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
