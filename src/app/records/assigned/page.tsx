import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function AssignedRecordsPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  if (!["ADMIN", "PAYROLL_STAFF"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const assignedRecords = await db.timePunch.findMany({
    where: {
      isDigitallySigned: false,
      NOT: {
        supervisor: null, // Has been assigned to a supervisor
      },
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
          sso: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Assigned Records</h1>
      <div className="grid gap-4">
        {assignedRecords.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No assigned records found.
              </p>
            </CardContent>
          </Card>
        ) : (
          assignedRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <CardTitle>Time Punch Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <p>
                    <strong>Employee:</strong> {record.employee.name}
                  </p>
                  <p>
                    <strong>SSO:</strong> {record.employee.sso}
                  </p>
                  <p>
                    <strong>Supervisor:</strong> {record?.supervisor?.name}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong> Awaiting Signature
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
