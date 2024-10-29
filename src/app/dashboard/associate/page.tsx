import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function AssociateDashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "ASSOCIATE") {
    redirect("/login");
  }

  // Fetch time punches for this associate
  const timePunches = await db.timePunch.findMany({
    where: {
      employeeId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Associate Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            View and sign your time punch records.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {timePunches.map((punch) => (
          <Card key={punch.id}>
            <CardHeader>
              <CardTitle>Time Punch Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <p>
                  <strong>Date:</strong> {punch.date.toLocaleDateString()}
                </p>
                <p>
                  <strong>Location:</strong> {punch.location}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {punch.supervisorId ? "Approved" : "Pending Review"}
                </p>
                {!punch.isDigitallySigned && !punch.supervisorId && (
                  <div className="mt-4">
                    <a
                      href={`/time-punch/${punch.id}/sign`}
                      className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
                    >
                      Sign Record
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
