import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";

export const POST = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authConfig);

    if (
      !session?.user ||
      (session.user.role !== "SUPERVISOR" && session.user.role !== "ADMIN")
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();

    // For admin, don't check supervisorId
    const timePunch = await db.timePunch.update({
      where: {
        id: params.id,
        ...(session.user.role === "SUPERVISOR"
          ? { supervisorId: session.user.id }
          : {}),
      },
      data: {
        signature: data.signature,
        signatureDate: new Date(data.signatureDate),
        isDigitallySigned: true,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        timePunchId: params.id,
        action: "SIGNATURE",
        changes: {
          signature: "Digital signature added",
          signatureDate: data.signatureDate,
          signedBy: session.user.role, // Track whether admin or supervisor signed
        },
        performedBy: session.user.id,
      },
    });

    return NextResponse.json(timePunch);
  } catch (error) {
    console.error("Error saving signature:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
