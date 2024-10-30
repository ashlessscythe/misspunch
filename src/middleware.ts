import { withAuth } from "next-auth/middleware";

// Simple middleware that just ensures authentication
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/records/:path*",
    "/time-punch/:path*",
    "/account-pending",
  ],
};
