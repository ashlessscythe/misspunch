"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SerializedTimePunch } from "@/types";

interface TimePunchCardProps {
  punch: SerializedTimePunch;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return "Not recorded";
  const time = new Date(timeStr);
  return time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function TimePunchCard({ punch }: TimePunchCardProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card key={punch.id}>
      <CardHeader>
        <CardTitle>Time Punch Record</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <p>
            <strong>Employee:</strong> {punch.employee.name}
          </p>
          <p>
            <strong>SSO:</strong> {punch.employee.sso}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(punch.date)}
          </p>
          <p>
            <strong>Location:</strong> {punch.location}
          </p>
          <p>
            <strong>Time In:</strong>{" "}
            {punch.timeIn ? formatTime(punch.timeIn) : "Not recorded"}
          </p>
          <p>
            <strong>Time Out:</strong>{" "}
            {punch.timeOut ? formatTime(punch.timeOut) : "Not recorded"}
          </p>
          {punch.mealIn && (
            <p>
              <strong>Meal In:</strong> {formatTime(punch.mealIn)}
            </p>
          )}
          {punch.mealOut && (
            <p>
              <strong>Meal Out:</strong> {formatTime(punch.mealOut)}
            </p>
          )}
          <p>
            <strong>Reason:</strong>{" "}
            {punch.missPunchReason?.replace(/_/g, " ").toLowerCase()}
          </p>
          {punch.otherReason && (
            <p>
              <strong>Other Reason:</strong> {punch.otherReason}
            </p>
          )}
          <div className="flex justify-end space-x-4 mt-4">
            <a
              href={`/time-punch/${punch.id}/sign`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Collect Signature
            </a>
            <button
              onClick={handlePrint}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Print
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
