import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protect dashboard routes based on role
    if (path.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Handle role-specific routes
      if (
        path.startsWith("/dashboard/payroll") &&
        token.role !== "PAYROLL_STAFF"
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (
        path.startsWith("/dashboard/supervisor") &&
        token.role !== "SUPERVISOR"
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (
        path.startsWith("/dashboard/associate") &&
        token.role !== "ASSOCIATE"
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
