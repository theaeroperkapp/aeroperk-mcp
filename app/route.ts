import { NextRequest, NextResponse } from 'next/server';
import { aeroperkClient } from '@/lib/aeroperkClient';

// Handle root URL - process MCP requests directly
const SERVER_INFO = { name: 'aeroperk-mcp', version: '1.0.0' };

const TOOLS = [
  {
    name: 'create_delivery_request',
    description: 'Create a new package delivery request with pickup location, dropoff location, and reward amount.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Brief title for the delivery' },
        pickupAddress: { type: 'string', description: 'Pickup location' },
        dropoffAddress: { type: 'string', description: 'Dropoff location' },
        reward: { type: 'number', description: 'Amount in USD (1-10000)', minimum: 1, maximum: 10000 },
      },
      required: ['title', 'pickupAddress', 'dropoffAddress', 'reward'],
    },
  },
  {
    name: 'search_driver_routes',
    description: 'Search for drivers on a route.',
    inputSchema: {
      type: 'object',
      properties: {
        originCity: { type: 'string' },
        destinationCity: { type: 'string' },
      },
      required: [],
    },
  },
  {
    name: 'assign_driver',
    description: 'Assign yourself to a delivery request.',
    inputSchema: {
      type: 'object',
      properties: { requestId: { type: 'string' } },
      required: ['requestId'],
    },
  },
];

function jsonRpc(id: any, result: any) {
  return NextResponse.json({ jsonrpc: '2.0', id, result });
}

export async function GET(request: NextRequest) {
  const accept = request.headers.get('accept') || '';
  if (!accept.includes('application/json') && !accept.includes('*/*')) {
    return NextResponse.redirect(new URL('/home', request.url), 302);
  }
  return NextResponse.json({ name: SERVER_INFO.name, version: SERVER_INFO.version, status: 'active' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params, id } = body;
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '');

    console.log('Root MCP Request:', { method, id });

    if (method === 'initialize') {
      return jsonRpc(id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: SERVER_INFO });
    }
    if (method === 'notifications/initialized') {
      return jsonRpc(id, {});
    }
    if (method === 'tools/list') {
      return jsonRpc(id, { tools: TOOLS });
    }
    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};
      let result: any = { error: `Unknown tool: ${name}` };

      if (authToken) aeroperkClient.setAuthToken(authToken);

      if (name === 'search_driver_routes') {
        try {
          const data = await aeroperkClient.searchDriverRoutes({ ...args, limit: 10 });
          const routes = data.driverRoutes || data || [];
          result = { count: routes.length, routes: routes.slice(0, 5) };
        } catch (e: any) {
          result = { error: e.message };
        }
      } else if (name === 'create_delivery_request' || name === 'assign_driver') {
        result = { error: 'Authentication required. Log in at https://aeroperk.com' };
      }

      return jsonRpc(id, { content: [{ type: 'text', text: JSON.stringify(result) }] });
    }

    return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
  } catch (e: any) {
    return NextResponse.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400 });
  }
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
