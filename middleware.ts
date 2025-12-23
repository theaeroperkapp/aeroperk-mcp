import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For MCP endpoints, ensure proper Accept header
  if (pathname === '/mcp' || pathname === '/') {
    const accept = request.headers.get('accept') || '';

    // If Accept header doesn't contain both required types, add them
    if (!accept.includes('application/json') || !accept.includes('text/event-stream')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('accept', 'application/json, text/event-stream');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/mcp', '/sse'],
};
