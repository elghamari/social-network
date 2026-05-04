// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const sessionId = request.cookies.get('sessionId')?.value;
  const path = request.nextUrl.pathname;

<<<<<<< HEAD
  const isProtectedRoute = path === '/' || path.startsWith('/profile') || path.startsWith('/posts') || path.startsWith('/groups') || path.startsWith('/network') || path.startsWith('/chat') || path.startsWith('/notifications');
=======
  const isProtectedRoute = path === '/' || path.startsWith('/profile') || path.startsWith('/chat') || path.startsWith('/groups');
>>>>>>> WebSocket
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
<<<<<<< HEAD
        response.cookies.delete('sessionId'); 
=======
        response.cookies.delete('sessionId');
>>>>>>> WebSocket
        return response;
      }
    } catch (err) {
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
    '/register',
    '/posts/:path*',
<<<<<<< HEAD
    '/groups/:path*',
    '/network/:path*',
    '/chat/:path*',
    '/notifications/:path*',
  ],
};
=======
    '/chat/:path*',
    '/chat',
    '/groups',
    '/groups/:path*'
  ],
};
>>>>>>> WebSocket
