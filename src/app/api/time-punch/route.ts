import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";

export const POST = async (request: Request) => {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== "PAYROLL_STAFF") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();

    // Convert string times to Date objects if they exist
    const timeIn = data.timeIn ? new Date(`${data.date}T${data.timeIn}`) : null;
    const timeOut = data.timeOut
      ? new Date(`${data.date}T${data.timeOut}`)
      : null;
    const mealIn = data.mealIn ? new Date(`${data.date}T${data.mealIn}`) : null;
    const mealOut = data.mealOut
      ? new Date(`${data.date}T${data.mealOut}`)
      : null;

    const timePunch = await db.timePunch.create({
      data: {
        employeeId: data.employeeId,
        supervisorId: data.supervisorId,
        date: new Date(data.date),
        timeIn,
        timeOut,
        mealIn,
        mealOut,
        missPunchReason: data.reason || null,
        otherReason: data.otherReason,
        location: data.location,
        amount: data.amount,
      },
    });

    return NextResponse.json(timePunch);
  } catch (error) {
    console.error("Error creating time punch:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
