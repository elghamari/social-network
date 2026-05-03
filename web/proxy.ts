<<<<<<< HEAD
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;
  const path = request.nextUrl.pathname;

  const isProtectedRoute =
    path === "/" || path.startsWith("/profile") || path.startsWith("/groups");

  if (isProtectedRoute && !sessionId) {
    return NextResponse.redirect(new URL("/login", request.url));
=======
// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const sessionId = request.cookies.get('sessionId')?.value;
  const path = request.nextUrl.pathname;

  const isProtectedRoute = path === '/' || path.startsWith('/profile') || path.startsWith('/posts') || path.startsWith('/groups') || path.startsWith('/network') || path.startsWith('/chat') || path.startsWith('/notifications');
  const isAuthRoute = path === '/login' || path === '/register';

  if (isProtectedRoute) {
    if (!sessionId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const res = await fetch('http://localhost:8080/auth/check', {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      });

      if (!res.ok) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('sessionId'); 
        return response;
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isAuthRoute && sessionId) {
    return NextResponse.redirect(new URL('/', request.url));
>>>>>>> origin/feed
  }

  return NextResponse.next();
}

export const config = {
<<<<<<< HEAD
  matcher: ["/", "/profile/:path*", "/groups/:path*", "/login", "/register"],
};
=======
  matcher: [
    '/',
    '/profile/:path*',
    '/login',
    '/register',
    '/posts/:path*',
    '/groups/:path*',
    '/network/:path*',
    '/chat/:path*',
    '/notifications/:path*',
  ],
};
>>>>>>> origin/feed
