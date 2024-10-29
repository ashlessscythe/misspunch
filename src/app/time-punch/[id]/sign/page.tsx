import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SignatureForm } from "./signature-form"; // Fixed import path

export default async function SignTimePunchPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "SUPERVISOR") {
    redirect("/login");
  }

  const timePunch = await db.timePunch.findUnique({
    where: {
      id: params.id,
      supervisorId: session.user.id,
    },
    include: {
      employee: {
        select: {
          name: true,
          sso: true,
        },
      },
    },
  });

  if (!timePunch) {
    redirect("/dashboard/supervisor");
  }

  return (
    <main className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sign Time Punch Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <p>
                <strong>Employee:</strong> {timePunch.employee.name}
              </p>
              <p>
                <strong>SSO:</strong> {timePunch.employee.sso}
              </p>
              <p>
                <strong>Date:</strong> {timePunch.date.toLocaleDateString()}
              </p>
              <p>
                <strong>Location:</strong> {timePunch.location}
              </p>
              <p>
                <strong>Time In:</strong>{" "}
                {timePunch.timeIn?.toLocaleTimeString() || "Not recorded"}
              </p>
              <p>
                <strong>Time Out:</strong>{" "}
                {timePunch.timeOut?.toLocaleTimeString() || "Not recorded"}
              </p>
              {timePunch.mealIn && (
                <p>
                  <strong>Meal In:</strong>{" "}
                  {timePunch.mealIn.toLocaleTimeString()}
                </p>
              )}
              {timePunch.mealOut && (
                <p>
                  <strong>Meal Out:</strong>{" "}
                  {timePunch.mealOut.toLocaleTimeString()}
                </p>
              )}
              <p>
                <strong>Reason:</strong>{" "}
                {timePunch.missPunchReason?.replace(/_/g, " ").toLowerCase()}
              </p>
              {timePunch.otherReason && (
                <p>
                  <strong>Other Reason:</strong> {timePunch.otherReason}
                </p>
              )}
            </div>

            <SignatureForm timePunchId={timePunch.id} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
