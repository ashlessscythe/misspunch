import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { TimePunchForm } from "@/components/time-punch-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function PayrollDashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "PAYROLL_STAFF") {
    redirect("/login");
  }

  return (
    <main className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payroll Staff Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create and manage compensable time records.
          </p>
        </CardContent>
      </Card>

      <TimePunchForm />
    </main>
  );
}
