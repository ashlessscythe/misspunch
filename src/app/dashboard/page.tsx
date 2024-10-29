import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect based on user role
  switch (session.user.role) {
    case "PAYROLL_STAFF":
      redirect("/dashboard/payroll");
    case "SUPERVISOR":
      redirect("/dashboard/supervisor");
    case "ASSOCIATE":
      redirect("/dashboard/associate");
    default:
      redirect("/login");
  }
}
