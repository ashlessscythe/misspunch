import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TimePunchCard } from "@/components/time-punch-card";
import { serializeTimePunch } from "@/types";

export default async function SupervisorDashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "SUPERVISOR") {
    redirect("/login");
  }

  // Fetch time punches assigned to this supervisor
  const pendingTimePunches = await db.timePunch.findMany({
    where: {
      supervisorId: session.user.id,
      isDigitallySigned: false, // Not yet signed
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

  // Serialize time punches using the helper function
  const serializedPunches = pendingTimePunches.map(serializeTimePunch);

  return (
    <main className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Supervisor Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Review time punch records and collect signatures.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {serializedPunches.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No pending time punch records to review.
              </p>
            </CardContent>
          </Card>
        ) : (
          serializedPunches.map((punch) => (
            <TimePunchCard key={punch.id} punch={punch} />
          ))
        )}
      </div>
    </main>
  );
}
