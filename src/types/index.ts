import { User, TimePunch as PrismaTimePunch } from "@prisma/client";

// Database model types
export type { User, PrismaTimePunch };

// Serialized types for client components
export interface SerializedTimePunch {
  id: string;
  employeeId: string;
  supervisorId: string | null;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  mealIn: string | null;
  mealOut: string | null;
  missPunchReason: string | null;
  otherReason: string | null;
  location: string;
  amount: string | null;
  signature: string | null;
  signatureDate: string | null;
  isDigitallySigned: boolean;
  createdAt: string;
  updatedAt: string;
  employee: {
    name: string;
    sso: string;
  };
}

// Helper function to serialize a time punch
export function serializeTimePunch(
  punch: PrismaTimePunch & {
    employee: {
      name: string;
      sso: string;
    };
  }
): SerializedTimePunch {
  return {
    ...punch,
    date: punch.date.toISOString(),
    timeIn: punch.timeIn?.toISOString() || null,
    timeOut: punch.timeOut?.toISOString() || null,
    mealIn: punch.mealIn?.toISOString() || null,
    mealOut: punch.mealOut?.toISOString() || null,
    signatureDate: punch.signatureDate?.toISOString() || null,
    createdAt: punch.createdAt.toISOString(),
    updatedAt: punch.updatedAt.toISOString(),
  };
}
