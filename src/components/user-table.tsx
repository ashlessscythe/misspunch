"use client";

import { useState } from "react";
import { UserRoleSelect } from "./user-role-select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { SerializedUser } from "@/types";

type SortField = "name" | "email" | "role";
type SortDirection = "asc" | "desc";

interface UserTableProps {
  initialUsers: SerializedUser[];
}

export function UserTable({ initialUsers }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedAndFilteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;

      if (aValue < bValue) return -1 * modifier;
      if (aValue > bValue) return 1 * modifier;
      return 0;
    });

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <Button
      variant="ghost"
      className="h-8 px-2"
      onClick={() => handleSort(field)}
    >
      {label}
      <CaretSortIcon className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <SortButton field="name" label="Name" />
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <SortButton field="email" label="Email" />
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <SortButton field="role" label="Role" />
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {sortedAndFilteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">{user.name}</td>
                  <td className="p-4 align-middle">{user.email}</td>
                  <td className="p-4 align-middle">{user.role}</td>
                  <td className="p-4 align-middle">
                    <UserRoleSelect userId={user.id} currentRole={user.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
