import { NextRequest, NextResponse } from 'next/server';
import { mcpServer } from '@/lib/mcp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    console.log('MCP Request:', {
      method: body.method,
      id: body.id,
      hasAuth: !!authHeader,
      params: body.params ? Object.keys(body.params) : [],
    });

    const response = await mcpServer.handleRequest(body, authHeader);

    // Return JSON-RPC 2.0 format if request included jsonrpc field
    const jsonRpcResponse = body.jsonrpc ? {
      jsonrpc: '2.0',
      id: body.id || null,
      ...response,
    } : response;

    return NextResponse.json(jsonRpcResponse, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('MCP endpoint error:', error);
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error or invalid request format',
        },
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  const tools = mcpServer.getToolsList();

  return NextResponse.json({
    name: 'AeroPerk MCP Server',
    version: '1.0.0',
    description: 'Peer-to-peer package delivery via traveling drivers',
    status: 'active',
    documentation: 'https://aeroperk.com/docs',
    tools: tools,
    endpoints: {
      mcp: '/api/mcp',
      privacyPolicy: '/privacy-policy',
    },
    backend: {
      url: process.env.AEROPERK_API_URL || 'https://api.aeroperk.com/api',
      status: 'connected',
    },
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
