import { NextRequest, NextResponse } from 'next/server';

// Legacy endpoint - redirect to new MCP endpoint
export async function POST(request: NextRequest) {
  // Forward to new /mcp endpoint
  const url = new URL('/mcp', request.url);
  return NextResponse.redirect(url, { status: 307 });
}

export async function GET() {
  return NextResponse.json({
    name: 'AeroPerk MCP Server',
    version: '1.0.0',
    description: 'Peer-to-peer package delivery via traveling drivers',
    status: 'active',
    documentation: 'https://aeroperk.com/docs',
    endpoints: {
      mcp: '/mcp',
      mcpLegacy: '/api/mcp',
      privacyPolicy: '/privacy-policy',
    },
    tools: [
      { name: 'create_delivery_request', description: 'Create a new package delivery request' },
      { name: 'search_driver_routes', description: 'Search for drivers on a route' },
      { name: 'assign_driver', description: 'Assign yourself as a driver to a request' },
    ],
    backend: {
      url: process.env.AEROPERK_API_URL || 'https://api.aeroperk.com/api',
      status: 'connected',
    },
    note: 'ChatGPT users: Use /mcp endpoint (Streamable HTTP)',
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
