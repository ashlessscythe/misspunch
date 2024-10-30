"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeSelector } from "./theme-selector";
import { SignOutButton } from "./sign-out-button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold sm:inline-block">MissPunch</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2">
          <nav className="flex items-center space-x-4">
            {session?.user && (
              <>
                {(session.user.role === "ADMIN" ||
                  session.user.role === "PAYROLL_STAFF") && (
                  <>
                    <Link
                      href="/dashboard/payroll"
                      className="text-sm font-medium"
                    >
                      Create Record
                    </Link>
                  </>
                )}
                {session.user.role === "ADMIN" && (
                  <>
                    <Link
                      href="/dashboard/admin"
                      className="text-sm font-medium"
                    >
                      User Management
                    </Link>
                    <Link
                      href="/records/assigned"
                      className="text-sm font-medium"
                    >
                      Assigned Records
                    </Link>
                    <Link
                      href="/records/signed"
                      className="text-sm font-medium"
                    >
                      Signed Records
                    </Link>
                  </>
                )}
                {session.user.role === "PAYROLL_STAFF" && (
                  <>
                    <Link
                      href="/records/assigned"
                      className="text-sm font-medium"
                    >
                      Assigned Records
                    </Link>
                    <Link
                      href="/records/signed"
                      className="text-sm font-medium"
                    >
                      Signed Records
                    </Link>
                  </>
                )}
                {session.user.role === "SUPERVISOR" && (
                  <>
                    <Link
                      href="/dashboard/supervisor"
                      className="text-sm font-medium"
                    >
                      Review Records
                    </Link>
                    <Link
                      href="/dashboard/supervisor/signed"
                      className="text-sm font-medium"
                    >
                      Signed Records
                    </Link>
                  </>
                )}
                {session.user.role === "ASSOCIATE" && (
                  <Link
                    href="/dashboard/associate"
                    className="text-sm font-medium"
                  >
                    My Records
                  </Link>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center space-x-4">
            {session?.user && (
              <div className="text-sm text-muted-foreground">
                <span className="mr-2">
                  Signed in as{" "}
                  <span className="font-medium">{session.user.name}</span>
                </span>
                <span className="px-2 py-1 bg-secondary rounded text-xs">
                  {session.user.role.toLowerCase().replace(/_/g, " ")}
                </span>
              </div>
            )}
            <ThemeSelector />
            {session?.user && <SignOutButton />}
          </div>
        </div>
      </div>
    </header>
  );
}
