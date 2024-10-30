import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";

export default async function AccountPendingPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "PENDING") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-center">
          Account Pending Approval
        </h1>
        <div className="space-y-4 text-center">
          <p>Your account is currently pending administrator approval.</p>
          <p>
            Please wait for an administrator to review and approve your account.
          </p>
          <p className="text-sm text-muted-foreground">
            If you need immediate assistance, please contact your supervisor or
            system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
