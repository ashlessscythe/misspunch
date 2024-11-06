import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SignatureDisplay } from "@/components/signature-display";
import { serializeTimePunch } from "@/types";

export default async function SignedRecordsPage() {
  const session = await getServerSession(authConfig);

  if (
    !session?.user ||
    (session.user.role !== "SUPERVISOR" && session.user.role !== "ADMIN")
  ) {
    redirect("/login");
  }

  // Fetch signed time punches based on role
  const signedTimePunches = await db.timePunch.findMany({
    where: {
      // For admin, show all signed records
      // For supervisor, only show their assigned records
      ...(session.user.role === "SUPERVISOR"
        ? { supervisorId: session.user.id }
        : {}),
      isDigitallySigned: true,
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
        },
      },
    },
    orderBy: {
      signatureDate: "desc",
    },
  });

  // Serialize time punches
  const serializedPunches = signedTimePunches.map(serializeTimePunch);

  return (
    <main className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {session.user.role === "ADMIN"
              ? "All Signed Records"
              : "Signed Records"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            View completed time punch records with signatures.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {serializedPunches.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No signed time punch records found.
              </p>
            </CardContent>
          </Card>
        ) : (
          serializedPunches.map((punch) => (
            <Card key={punch.id}>
              <CardContent className="py-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <p>
                      <strong>Employee:</strong> {punch.employee.name}
                    </p>
                    <p>
                      <strong>SSO:</strong> {punch.employee.sso}
                    </p>
                    {session.user.role === "ADMIN" && punch.supervisor && (
                      <p>
                        <strong>Supervisor:</strong> {punch.supervisor.name}
                      </p>
                    )}
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(punch.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Location:</strong> {punch.location}
                    </p>
                    <p>
                      <strong>Signed:</strong>{" "}
                      {punch.signatureDate
                        ? new Date(punch.signatureDate).toLocaleString()
                        : "Not signed"}
                    </p>
                  </div>

                  {punch.signature && (
                    <div className="flex flex-col space-y-2">
                      <p>
                        <strong>Signature:</strong>
                      </p>
                      <div className="flex justify-start">
                        <SignatureDisplay
                          signature={punch.signature}
                          width={300}
                          height={150}
                        />
                      </div>
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
