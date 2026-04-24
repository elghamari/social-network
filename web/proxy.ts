import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;
  const path = request.nextUrl.pathname;

  const isProtectedRoute =
    path === "/" || path.startsWith("/profile") || path.startsWith("/groups");

  if (isProtectedRoute && !sessionId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/profile/:path*", "/groups/:path*", "/login", "/register"],
};
