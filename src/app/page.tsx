import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  // Always redirect to dashboard, let middleware handle PENDING state
  redirect("/dashboard");
}
