// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const sessionId = request.cookies.get('sessionId')?.value;
  const path = request.nextUrl.pathname;

  const isProtectedRoute = path === '/' || path.startsWith('/profile');
  const isAuthRoute = path === '/login' || path === '/register';
if (isProtectedRoute) {
    if (!sessionId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // بدلنا localhost بـ 127.0.0.1 وتأكد من /api إيلا كانت عندك فـ Go
      const res = await fetch('http://localhost:8080/auth/check', {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      });

      // هادي غتطبع لينا فـ terminal ديال VS Code شنو رجع Go
      console.log("Go Server Status:", res.status); 

      if (!res.ok) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('sessionId'); 
        return response;
      }
    } catch (err) {
      // هادي غتطبع لينا إيلا كان السيرفور طافي ولا الرابط غالط
      console.log("Fetch Error in Proxy:", err); 
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  if (isAuthRoute && sessionId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/login',
    '/register'
  ],
};