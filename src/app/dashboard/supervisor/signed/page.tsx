import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SignatureDisplay } from "@/components/signature-display";

export default async function SupervisorSignedRecordsPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "SUPERVISOR") {
    redirect("/dashboard");
  }

  // Fetch signed records where the current user was the supervisor
  const signedRecords = await db.timePunch.findMany({
    where: {
      supervisorId: session.user.id,
      isDigitallySigned: true,
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
      signatureDate: "desc",
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Signed Records</h1>
      <div className="grid gap-4">
        {signedRecords.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No signed records found.
              </p>
            </CardContent>
          </Card>
        ) : (
          signedRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <CardTitle>Time Punch Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <p>
                    <strong>Employee:</strong> {record.employee.name}
                  </p>
                  <p>
                    <strong>SSO:</strong> {record.employee.sso}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Location:</strong> {record.location}
                  </p>
                  {record.timeIn && (
                    <p>
                      <strong>Time In:</strong>{" "}
                      {new Date(record.timeIn).toLocaleTimeString()}
                    </p>
                  )}
                  {record.timeOut && (
                    <p>
                      <strong>Time Out:</strong>{" "}
                      {new Date(record.timeOut).toLocaleTimeString()}
                    </p>
                  )}
                  {record.mealIn && (
                    <p>
                      <strong>Meal In:</strong>{" "}
                      {new Date(record.mealIn).toLocaleTimeString()}
                    </p>
                  )}
                  {record.mealOut && (
                    <p>
                      <strong>Meal Out:</strong>{" "}
                      {new Date(record.mealOut).toLocaleTimeString()}
                    </p>
                  )}
                  {record.signature && (
                    <div className="mt-4">
                      <p className="font-medium mb-2">Signature:</p>
                      <SignatureDisplay
                        signatureData={record.signature}
                        width={200}
                        height={100}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Signed on:{" "}
                        {new Date(record.signatureDate!).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
