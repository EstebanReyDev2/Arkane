import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('firebase-token')?.value;
  const { pathname } = request.nextUrl;

  // Routes starting with /admin/* → require admin role
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/cuenta/login', request.url));
    }

    // In a real app, we'd verify the token and check for the admin role here.
    // Since we're in Edge Runtime, we can't easily use firebase-admin.
    // We'd typically use a custom claim or a separate API route to verify.
    // For this sprint, we'll assume the presence of the token is enough for the middleware,
    // and the server-side queries will handle actual authorization.
    
    // To implement the "not admin" redirect with toast, we'd need to know the user's role.
    // This usually requires a server-side check.
    // For now, we'll allow through if token exists, and handle role check in layout/page.
  }

  // Routes /cuenta/* (except /cuenta/login) → require authentication
  if (pathname.startsWith('/cuenta') && pathname !== '/cuenta/login') {
    if (!token) {
      const redirectUrl = new URL('/cuenta/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/cuenta/:path*'],
};
