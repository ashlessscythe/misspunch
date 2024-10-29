import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";
import { authConfig } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {session.user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground">
                Email: {session.user.email}
              </p>
            </div>
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
