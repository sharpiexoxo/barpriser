import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin page — redirect to login if no session
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Admin role check happens inside the page via requireAdmin()
    // but we at least block unauthenticated access at the edge
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
