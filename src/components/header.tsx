"use client";

import { useSession, SessionProvider } from "next-auth/react";
import Link from "next/link";
import { ThemeSelector } from "./theme-selector";
import { SignOutButton } from "./sign-out-button";

function HeaderContent() {
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
                {session.user.role === "PAYROLL_STAFF" && (
                  <Link
                    href="/dashboard/payroll"
                    className="text-sm font-medium"
                  >
                    Create Record
                  </Link>
                )}
                {session.user.role === "SUPERVISOR" && (
                  <Link
                    href="/dashboard/supervisor"
                    className="text-sm font-medium"
                  >
                    Review Records
                  </Link>
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
            <ThemeSelector />
            {session?.user && <SignOutButton />}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Header() {
  return (
    <SessionProvider>
      <HeaderContent />
    </SessionProvider>
  );
}
