import { User, TimePunch as PrismaTimePunch } from "@prisma/client";

// Database model types
export type { User, PrismaTimePunch };

// Selected user fields type
export type SelectedUser = Pick<
  User,
  "id" | "email" | "name" | "role" | "createdAt"
>;

// Serialized types for client components
export interface SerializedUser {
  id: string;
  email: string;
  name: string;
  role: User["role"];
  createdAt: string;
}

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

// Helper functions to serialize data
export function serializeUser(user: SelectedUser): SerializedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeTimePunch(
  punch: PrismaTimePunch & {
    employee: {
      name: string;
      sso: string;
    };
  }
): SerializedTimePunch {
  const serialized: SerializedTimePunch = {
    ...punch,
    date: punch.date.toISOString(),
    timeIn: punch.timeIn?.toISOString() || null,
    timeOut: punch.timeOut?.toISOString() || null,
    mealIn: punch.mealIn?.toISOString() || null,
    mealOut: punch.mealOut?.toISOString() || null,
    signatureDate: punch.signatureDate?.toISOString() || null,
    createdAt: punch.createdAt.toISOString(),
    updatedAt: punch.updatedAt.toISOString(),
    employee: {
      name: punch.employee.name,
      sso: punch.employee.sso,
    },
  };
  return serialized;
}
