import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { AddUserDialog } from "@/components/add-user-dialog";
import { UserTable } from "@/components/user-table";
import { serializeUser, type SelectedUser } from "@/types";

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

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <AddUserDialog />
      </div>
      <UserTable initialUsers={serializedUsers} />
    </div>
  );
}
