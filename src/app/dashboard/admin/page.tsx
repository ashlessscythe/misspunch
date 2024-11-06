import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { AddUserDialog } from "@/components/add-user-dialog";
import { UserTable } from "@/components/user-table";
import { serializeUser, type SelectedUser } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function AdminPage() {
  const session = await getServerSession(authConfig);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  const users = (await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })) as SelectedUser[];

  const serializedUsers = users.map(serializeUser);

  // Get counts for dashboard
  const pendingSignatures = await db.timePunch.count({
    where: {
      isDigitallySigned: false,
    },
  });

  const signedRecords = await db.timePunch.count({
    where: {
      isDigitallySigned: true,
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-6">
        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Pending Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-2">{pendingSignatures}</p>
              <Link
                href="/dashboard/supervisor"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                View & Collect Signatures →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signed Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-2">{signedRecords}</p>
              <Link
                href="/dashboard/supervisor/signed"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                View Signed Records →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Punch Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard/payroll"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Create Time Punch →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <AddUserDialog />
          </CardHeader>
          <CardContent>
            <UserTable initialUsers={serializedUsers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
