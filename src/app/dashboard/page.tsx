import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "PENDING") {
    redirect("/account-pending");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Admin Links */}
        {session.user.role === "ADMIN" && (
          <>
            <Link
              href="/records/pending"
              className="block p-4 rounded-lg border hover:border-blue-500 transition-colors"
            >
              <h2 className="text-lg font-semibold mb-2">Pending Records</h2>
              <p className="text-sm text-muted-foreground">
                View and manage pending time punch records
              </p>
            </Link>

            <Link
              href="/records/assigned"
              className="block p-4 rounded-lg border hover:border-blue-500 transition-colors"
            >
              <h2 className="text-lg font-semibold mb-2">Assigned Records</h2>
              <p className="text-sm text-muted-foreground">
                View and manage assigned time punch records
              </p>
            </Link>

            <Link
              href="/records/signed"
              className="block p-4 rounded-lg border hover:border-blue-500 transition-colors"
            >
              <h2 className="text-lg font-semibold mb-2">Signed Records</h2>
              <p className="text-sm text-muted-foreground">
                View completed and signed records
              </p>
            </Link>
          </>
        )}

        {/* Payroll Staff Links */}
        {session.user.role === "PAYROLL_STAFF" && (
          <>
            <Link
              href="/records/signed"
              className="block p-4 rounded-lg border hover:border-blue-500 transition-colors"
            >
              <h2 className="text-lg font-semibold mb-2">Signed Records</h2>
              <p className="text-sm text-muted-foreground">
                View completed and signed records
              </p>
            </Link>

            <Link
              href="/records/assigned"
              className="block p-4 rounded-lg border hover:border-blue-500 transition-colors"
            >
              <h2 className="text-lg font-semibold mb-2">Assigned Records</h2>
              <p className="text-sm text-muted-foreground">
                View and manage assigned time punch records
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
