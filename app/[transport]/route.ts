import { NextRequest, NextResponse } from 'next/server';
import { aeroperkClient } from '@/lib/aeroperkClient';

// Simple MCP Server implementation for ChatGPT
const SERVER_INFO = {
  name: 'aeroperk-mcp',
  version: '1.0.0',
};

const TOOLS = [
  {
    name: 'create_delivery_request',
    description: 'Create a new package delivery request with pickup location, dropoff location, and reward amount.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Brief title for the delivery (1-100 chars)' },
        pickupAddress: { type: 'string', description: 'Pickup location - city or full address' },
        dropoffAddress: { type: 'string', description: 'Dropoff location - city or full address' },
        reward: { type: 'number', description: 'Amount in USD to pay the driver (1-10000)', minimum: 1, maximum: 10000 },
        shortDescription: { type: 'string', description: 'Description of the item (optional)' },
      },
      required: ['title', 'pickupAddress', 'dropoffAddress', 'reward'],
    },
  },
  {
    name: 'search_driver_routes',
    description: 'Search for drivers traveling on a specific route who can deliver packages.',
    inputSchema: {
      type: 'object',
      properties: {
        originCity: { type: 'string', description: 'Origin city name' },
        destinationCity: { type: 'string', description: 'Destination city name' },
        dateFrom: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        dateTo: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
      required: [],
    },
  },
  {
    name: 'assign_driver',
    description: 'As a driver, assign yourself to a delivery request.',
    inputSchema: {
      type: 'object',
      properties: {
        requestId: { type: 'string', description: 'The ID of the delivery request' },
        note: { type: 'string', description: 'Optional message to the sender' },
      },
      required: ['requestId'],
    },
  },
];

async function handleToolCall(name: string, args: any, authToken?: string) {
  try {
    if (authToken) {
      aeroperkClient.setAuthToken(authToken);
    }

    switch (name) {
      case 'create_delivery_request': {
        if (!authToken) {
          return { error: 'Authentication required. Please log in to AeroPerk at https://aeroperk.com' };
        }
        const request = await aeroperkClient.createRequest({
          title: args.title,
          pickupAddress: args.pickupAddress,
          dropoffAddress: args.dropoffAddress,
          reward: args.reward,
          shortDescription: args.shortDescription,
        });
        return {
          success: true,
          message: `Delivery request "${args.title}" created!`,
          requestId: request._id,
        };
      }

      case 'search_driver_routes': {
        const result = await aeroperkClient.searchDriverRoutes({
          originCity: args.originCity,
          destinationCity: args.destinationCity,
          dateFrom: args.dateFrom,
          dateTo: args.dateTo,
          limit: 10,
        });
        const routes = result.driverRoutes || result || [];
        return {
          success: true,
          count: routes.length,
          routes: routes.map((r: any) => ({
            id: r._id,
            origin: `${r.origin?.city}, ${r.origin?.country}`,
            destination: `${r.destination?.city}, ${r.destination?.country}`,
            departureDate: r.departureDate,
            pricePerKg: r.pricePerKg,
          })),
        };
      }

      case 'assign_driver': {
        if (!authToken) {
          return { error: 'Authentication required. Please log in to AeroPerk at https://aeroperk.com' };
        }
        await aeroperkClient.assignDriver(args.requestId, args.note);
        return { success: true, message: 'You have been assigned to this delivery!' };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message };
  }
}

function createJsonRpcResponse(id: any, result: any) {
  return { jsonrpc: '2.0', id, result };
}

function createJsonRpcError(id: any, code: number, message: string) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params, id } = body;
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    console.log('MCP Request:', { method, id, hasAuth: !!authToken });

    switch (method) {
      case 'initialize':
        return NextResponse.json(createJsonRpcResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        }));

      case 'notifications/initialized':
        return NextResponse.json(createJsonRpcResponse(id, {}));

      case 'tools/list':
        return NextResponse.json(createJsonRpcResponse(id, { tools: TOOLS }));

      case 'tools/call': {
        const { name, arguments: args } = params || {};
        const result = await handleToolCall(name, args || {}, authToken);
        return NextResponse.json(createJsonRpcResponse(id, {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }));
      }

      default:
        return NextResponse.json(createJsonRpcError(id, -32601, `Method not found: ${method}`));
    }
  } catch (error: any) {
    console.error('MCP Error:', error);
    return NextResponse.json(createJsonRpcError(null, -32700, 'Parse error'), { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  // Return server info for GET requests
  return NextResponse.json({
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
    status: 'active',
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
  });
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
