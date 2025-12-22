import { aeroperkClient } from '../aeroperkClient';
import { MCPContext, MCPToolResult } from '@/types';

export const createRequestTool = {
  name: 'create_delivery_request',
  description: 'Create a new package delivery request with pickup location, dropoff location, and reward amount. The request will be visible to drivers traveling on matching routes.',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Brief title for the delivery (1-100 chars). Example: "Laptop delivery to São Paulo"',
        minLength: 1,
        maxLength: 100,
      },
      pickupAddress: {
        type: 'string',
        description: 'Pickup location - can be full address or "City, Country". Example: "Seattle, WA, USA" or "123 Main St, Seattle, WA 98101"',
      },
      dropoffAddress: {
        type: 'string',
        description: 'Dropoff location - can be full address or "City, Country". Example: "São Paulo, Brazil"',
      },
      reward: {
        type: 'number',
        description: 'Amount in USD willing to pay the driver (minimum $1, maximum $10,000)',
        minimum: 1,
        maximum: 10000,
      },
      shortDescription: {
        type: 'string',
        description: 'Description of the item being delivered (optional, max 500 chars). Example: "MacBook Pro 16 inch, well packaged"',
        maxLength: 500,
      },
      deadline: {
        type: 'string',
        format: 'date-time',
        description: 'Delivery deadline in ISO 8601 format (optional). Example: "2025-12-28T00:00:00.000Z"',
      },
    },
    required: ['title', 'pickupAddress', 'dropoffAddress', 'reward'],
  },

  async execute(input: any, context: MCPContext): Promise<MCPToolResult> {
    try {
      // Check authentication
      const user = await context.auth.getUser();
      if (!user) {
        return {
          error: 'Authentication required',
          content: `**Authentication Required**

To create delivery requests, please provide your AeroPerk authentication token.

If you don't have an account yet, sign up at https://aeroperk.com`,
        };
      }

      // Set auth token for API calls
      aeroperkClient.setAuthToken(user.access_token!);

      // Create the request
      const request = await aeroperkClient.createRequest({
        title: input.title,
        pickupAddress: input.pickupAddress,
        dropoffAddress: input.dropoffAddress,
        reward: input.reward,
        shortDescription: input.shortDescription,
        deadline: input.deadline,
      });

      // Format response
      const pickup = request.pickupAddress;
      const dropoff = request.dropoffAddress;

      return {
        content: `**Delivery Request Created Successfully!**

**Request ID:** \`${request._id}\`
**Title:** ${request.title}
**Route:** ${pickup.city || pickup.formattedAddress}, ${pickup.country} → ${dropoff.city || dropoff.formattedAddress}, ${dropoff.country}
**Reward:** $${request.reward} USD
**Status:** ${request.status}
${request.shortDescription ? `**Item:** ${request.shortDescription}` : ''}
${input.deadline ? `**Deadline:** ${new Date(input.deadline).toLocaleDateString()}` : ''}

**Next Steps:**
1. Use \`search_driver_routes\` to find drivers traveling on this route
2. Drivers can view your request and offer to deliver
3. You'll be notified when a driver is interested

**View in app:** https://aeroperk.com/requests/${request._id}`,
        widget: {
          type: 'request_created',
          props: {
            request,
            viewUrl: `https://aeroperk.com/requests/${request._id}`,
          },
        },
      };
    } catch (error: any) {
      console.error('Create request error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message;

      // Handle specific error cases
      if (error.response?.status === 401) {
        return {
          error: 'Authentication expired',
          content: 'Your session has expired. Please log in again at https://aeroperk.com',
        };
      }

      if (error.response?.status === 400) {
        return {
          error: 'Invalid request data',
          content: `**Invalid Request**\n\n${errorMsg}\n\nPlease check your inputs and try again.`,
        };
      }

      return {
        error: `Failed to create delivery request: ${errorMsg}`,
        content: `**Error Creating Request**\n\nThere was an error creating your delivery request: ${errorMsg}\n\nPlease try again or contact support at support@aeroperk.com`,
      };
    }
  },
};
