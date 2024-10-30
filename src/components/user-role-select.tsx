"use client";

import { UserRole } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRoleSelectProps {
  userId: string;
  currentRole: UserRole;
}

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
  const handleValueChange = (newRole: string) => {
    fetch("/api/users/role", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        newRole: newRole,
      }),
    }).then(() => {
      // Refresh the page to show updated roles
      window.location.reload();
    });
  };

  return (
    <Select defaultValue={currentRole} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(UserRole).map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
