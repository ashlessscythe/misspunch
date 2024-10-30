import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SignatureDisplay } from "@/components/signature-display";
import { SerializedTimePunch } from "@/types";

export default async function SignedRecordsPage() {
  const session = await getServerSession(authConfig);

  if (
    !session?.user ||
    !["ADMIN", "PAYROLL_STAFF"].includes(session.user.role)
  ) {
    redirect("/dashboard");
  }

  // Fetch all records for admin, only signed ones for payroll
  const timePunches = await db.timePunch.findMany({
    where:
      session.user.role === "PAYROLL_STAFF"
        ? {
            isDigitallySigned: true,
          }
        : undefined,
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

  // Manual serialization since we need to handle supervisor data differently
  const serializedPunches = timePunches.map((punch) => ({
    id: punch.id,
    employeeId: punch.employeeId,
    supervisorId: punch.supervisorId,
    date: punch.date.toISOString(),
    timeIn: punch.timeIn?.toISOString() || null,
    timeOut: punch.timeOut?.toISOString() || null,
    mealIn: punch.mealIn?.toISOString() || null,
    mealOut: punch.mealOut?.toISOString() || null,
    missPunchReason: punch.missPunchReason,
    otherReason: punch.otherReason,
    location: punch.location,
    amount: punch.amount,
    signature: punch.signature,
    signatureDate: punch.signatureDate?.toISOString() || null,
    isDigitallySigned: punch.isDigitallySigned,
    createdAt: punch.createdAt.toISOString(),
    updatedAt: punch.updatedAt.toISOString(),
    employee: {
      name: punch.employee.name,
      sso: punch.employee.sso,
    },
    supervisor: punch.supervisor
      ? {
          name: punch.supervisor.name,
          sso: punch.supervisor.sso,
        }
      : null,
  }));

  return (
    <main className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {session.user.role === "ADMIN" ? "All Records" : "Signed Records"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {session.user.role === "ADMIN"
              ? "View all time punch records and their status"
              : "View all signed time punch records"}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {serializedPunches.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No records found.
              </p>
            </CardContent>
          </Card>
        ) : (
          serializedPunches.map((punch) => (
            <Card key={punch.id} className="relative">
              <CardHeader>
                <CardTitle>Time Punch Record</CardTitle>
                {punch.isDigitallySigned && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm">
                    Signed
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <p>
                    <strong>Employee:</strong> {punch.employee.name}
                  </p>
                  <p>
                    <strong>SSO:</strong> {punch.employee.sso}
                  </p>
                  <p>
                    <strong>Supervisor:</strong>{" "}
                    {punch.supervisor?.name || "Not assigned"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(punch.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Location:</strong> {punch.location}
                  </p>
                  <p>
                    <strong>Time In:</strong>{" "}
                    {punch.timeIn
                      ? new Date(punch.timeIn).toLocaleTimeString()
                      : "Not recorded"}
                  </p>
                  <p>
                    <strong>Time Out:</strong>{" "}
                    {punch.timeOut
                      ? new Date(punch.timeOut).toLocaleTimeString()
                      : "Not recorded"}
                  </p>
                  {punch.mealIn && (
                    <p>
                      <strong>Meal In:</strong>{" "}
                      {new Date(punch.mealIn).toLocaleTimeString()}
                    </p>
                  )}
                  {punch.mealOut && (
                    <p>
                      <strong>Meal Out:</strong>{" "}
                      {new Date(punch.mealOut).toLocaleTimeString()}
                    </p>
                  )}
                  <p>
                    <strong>Reason:</strong>{" "}
                    {punch.missPunchReason?.replace(/_/g, " ").toLowerCase()}
                  </p>
                  {punch.otherReason && (
                    <p>
                      <strong>Other Reason:</strong> {punch.otherReason}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong>{" "}
                    {punch.isDigitallySigned ? "Signed" : "Pending Signature"}
                  </p>
                  {punch.signatureDate && (
                    <p>
                      <strong>Signed Date:</strong>{" "}
                      {new Date(punch.signatureDate).toLocaleString()}
                    </p>
                  )}
                  {punch.signature && (
                    <div className="mt-4">
                      <p className="font-medium mb-2">Signature:</p>
                      <SignatureDisplay
                        signatureData={punch.signature}
                        width={300}
                        height={150}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
