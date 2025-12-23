import { createMcpHandler } from '@vercel/mcp-adapter';
import { z } from 'zod';
import { aeroperkClient } from '@/lib/aeroperkClient';

// Create the MCP handler with Streamable HTTP transport
const handler = createMcpHandler(
  async (server) => {
    // Tool 1: Create Delivery Request
    server.tool(
      'create_delivery_request',
      'Create a new package delivery request with pickup location, dropoff location, and reward amount. The request will be visible to drivers traveling on matching routes.',
      {
        title: z.string().min(1).max(100).describe('Brief title for the delivery (1-100 chars). Example: "Laptop delivery to Sao Paulo"'),
        pickupAddress: z.string().describe('Pickup location - can be full address or "City, Country". Example: "Seattle, WA, USA"'),
        dropoffAddress: z.string().describe('Dropoff location - can be full address or "City, Country". Example: "Sao Paulo, Brazil"'),
        reward: z.number().min(1).max(10000).describe('Amount in USD willing to pay the driver (minimum $1, maximum $10,000)'),
        shortDescription: z.string().max(500).optional().describe('Description of the item being delivered (optional, max 500 chars)'),
        deadline: z.string().optional().describe('Delivery deadline in ISO 8601 format (optional). Example: "2025-12-28T00:00:00.000Z"'),
      },
      async ({ title, pickupAddress, dropoffAddress, reward, shortDescription, deadline }, extra) => {
        try {
          // Check for auth token
          const authToken = extra.authInfo?.token;
          if (!authToken) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    error: 'Authentication required',
                    message: 'Please log in to AeroPerk to create delivery requests. You can sign up at https://aeroperk.com',
                  }),
                },
              ],
            };
          }

          aeroperkClient.setAuthToken(authToken);
          const request = await aeroperkClient.createRequest({
            title,
            pickupAddress,
            dropoffAddress,
            reward,
            shortDescription,
            deadline,
          });

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  success: true,
                  message: `Delivery request "${title}" created successfully!`,
                  request: {
                    id: request._id,
                    title: request.title,
                    status: request.status,
                    reward: request.reward,
                    pickup: request.pickupAddress,
                    dropoff: request.dropoffAddress,
                  },
                }),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  error: 'Failed to create request',
                  message: error.response?.data?.message || error.message,
                }),
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Tool 2: Search Driver Routes
    server.tool(
      'search_driver_routes',
      'Search for drivers traveling on a specific route who can deliver packages. Returns available drivers with their travel dates, capacity, and pricing.',
      {
        originCity: z.string().optional().describe('Origin city name (e.g., "Seattle", "New York", "London")'),
        destinationCity: z.string().optional().describe('Destination city name (e.g., "Sao Paulo", "Tokyo", "Paris")'),
        originCountry: z.string().optional().describe('Origin country (optional)'),
        destinationCountry: z.string().optional().describe('Destination country (optional)'),
        dateFrom: z.string().optional().describe('Start of travel date range (ISO date, e.g., "2025-12-20")'),
        dateTo: z.string().optional().describe('End of travel date range (ISO date, e.g., "2025-12-31")'),
        vehicleType: z.enum(['car', 'van', 'truck', 'suv', 'motorcycle', 'air', 'train', 'bus']).optional().describe('Filter by vehicle/transport type'),
        maxPrice: z.number().min(0).optional().describe('Maximum price willing to pay'),
        limit: z.number().min(1).max(50).optional().describe('Maximum number of results (1-50, default 10)'),
      },
      async (params) => {
        try {
          const result = await aeroperkClient.searchDriverRoutes({
            ...params,
            limit: params.limit || 10,
          });

          const routes = result.driverRoutes || result;

          if (!routes || routes.length === 0) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    success: true,
                    message: 'No drivers found for this route. Try different cities or dates.',
                    results: [],
                    total: 0,
                  }),
                },
              ],
            };
          }

          const formattedRoutes = routes.map((route: any) => ({
            id: route._id,
            origin: `${route.origin?.city || 'Unknown'}, ${route.origin?.country || ''}`,
            destination: `${route.destination?.city || 'Unknown'}, ${route.destination?.country || ''}`,
            departureDate: route.departureDate,
            arrivalDate: route.arrivalDate,
            vehicleType: route.vehicleType,
            pricePerKg: route.pricePerKg,
            availableCapacity: route.availableCapacity,
            driver: route.user ? {
              name: `${route.user.firstName || ''} ${route.user.lastName || ''}`.trim() || 'Anonymous',
              rating: route.user.rating,
            } : null,
          }));

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  success: true,
                  message: `Found ${formattedRoutes.length} driver(s) on this route`,
                  results: formattedRoutes,
                  total: result.pagination?.total || formattedRoutes.length,
                }),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  error: 'Failed to search routes',
                  message: error.response?.data?.message || error.message,
                }),
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Tool 3: Assign Driver
    server.tool(
      'assign_driver',
      'As a driver, assign yourself to a delivery request. This tool is for DRIVERS to claim delivery jobs. Senders should use create_delivery_request instead.',
      {
        requestId: z.string().describe('The ID of the delivery request to assign yourself to (24-character MongoDB ObjectId)'),
        note: z.string().max(1000).optional().describe('Optional message to the sender (max 1000 chars)'),
      },
      async ({ requestId, note }, extra) => {
        try {
          const authToken = extra.authInfo?.token;
          if (!authToken) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    error: 'Authentication required',
                    message: 'Please log in to AeroPerk to assign yourself as a driver. You can sign up at https://aeroperk.com',
                  }),
                },
              ],
            };
          }

          aeroperkClient.setAuthToken(authToken);
          const result = await aeroperkClient.assignDriver(requestId, note);

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  success: true,
                  message: 'You have been assigned to this delivery request!',
                  assignment: {
                    requestId,
                    status: result.status || 'assigned',
                  },
                }),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  error: 'Failed to assign driver',
                  message: error.response?.data?.message || error.message,
                }),
              },
            ],
            isError: true,
          };
        }
      }
    );
  },
  {
    serverInfo: {
      name: 'aeroperk-mcp',
      version: '1.0.0',
    },
    capabilities: {
      tools: {},
    },
  },
  {
    basePath: '/',
    verboseLogs: true,
  }
);

export const GET = handler;
export const POST = handler;
