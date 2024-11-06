import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TimePunchCard } from "@/components/time-punch-card";
import { SerializedTimePunch, serializeTimePunch } from "@/types";

export default async function SupervisorDashboardPage() {
  const session = await getServerSession(authConfig);

  if (
    !session?.user ||
    (session.user.role !== "SUPERVISOR" && session.user.role !== "ADMIN")
  ) {
    redirect("/login");
  }

  // Fetch time punches based on role
  const pendingTimePunches = await db.timePunch.findMany({
    where: {
      // For admin, show all unsigned records
      // For supervisor, only show their assigned records
      ...(session.user.role === "SUPERVISOR"
        ? { supervisorId: session.user.id }
        : {}),
      isDigitallySigned: false, // Not yet signed
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
      createdAt: "desc",
    },
  });

  // Serialize time punches using the helper function
  const serializedPunches = pendingTimePunches.map(serializeTimePunch);

  return (
    <main className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {session.user.role === "ADMIN"
              ? "Admin Supervisor Dashboard"
              : "Supervisor Dashboard"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {session.user.role === "ADMIN"
              ? "Review all time punch records and collect signatures."
              : "Review time punch records and collect signatures."}
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
          serializedPunches.map((punch: SerializedTimePunch) => (
            <TimePunchCard
              key={punch.id}
              punch={punch}
              showSupervisor={session.user.role === "ADMIN"}
            />
          ))
        )}
      </div>
    </main>
  );
}
