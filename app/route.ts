import { NextRequest, NextResponse } from 'next/server';

// Handle root URL - rewrite MCP requests to /mcp
export async function GET(request: NextRequest) {
  const accept = request.headers.get('accept') || '';

  // If it's an MCP client (expecting SSE or JSON), rewrite to /mcp
  if (accept.includes('text/event-stream') || accept.includes('application/json')) {
    return NextResponse.rewrite(new URL('/mcp', request.url));
  }

  // Browser visitors - redirect to home page
  return NextResponse.redirect(new URL('/home', request.url), 302);
}

export async function POST(request: NextRequest) {
  // Rewrite POST requests to /mcp (internal forward, not redirect)
  return NextResponse.rewrite(new URL('/mcp', request.url));
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    },
  });
}
