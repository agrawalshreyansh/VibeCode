import { NextResponse } from 'next/server';

export function middleware(request) {
  const isAuthenticated = request.cookies.get('isAuthenticated');

  // Allow public routes
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/auth') {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.jpeg|bg1.jpeg|m1.jpeg|m2.jpeg|m3.jpeg).*)',
  ],
};

