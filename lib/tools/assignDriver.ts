import { aeroperkClient } from '../aeroperkClient';
import { MCPContext, MCPToolResult } from '@/types';
import { isValidObjectId } from '../auth';

export const assignDriverTool = {
  name: 'assign_driver',
  description: 'As a driver, assign yourself to a delivery request. This tool is for DRIVERS to claim delivery jobs. Senders should use create_delivery_request instead.',
  inputSchema: {
    type: 'object',
    properties: {
      requestId: {
        type: 'string',
        description: 'The ID of the delivery request to assign yourself to (24-character MongoDB ObjectId)',
      },
      note: {
        type: 'string',
        description: 'Optional message to the sender (max 1000 chars). Example: "I can pick this up on my way to the airport"',
        maxLength: 1000,
      },
    },
    required: ['requestId'],
  },

  async execute(input: any, context: MCPContext): Promise<MCPToolResult> {
    try {
      // Check authentication
      const user = await context.auth.getUser();
      if (!user) {
        return {
          error: 'Authentication required',
          content: `**Authentication Required**

To assign yourself to deliveries, please provide your AeroPerk authentication token.

Log in at https://aeroperk.com`,
        };
      }

      // Validate request ID format
      if (!isValidObjectId(input.requestId)) {
        return {
          error: 'Invalid request ID',
          content: `**Invalid Request ID**

The request ID "${input.requestId}" is not valid. Request IDs are 24-character codes.

Use \`search_driver_routes\` to find valid request IDs.`,
        };
      }

      // Check if user is a driver
      if (user.role !== 'driver' && user.role !== 'admin' && user.role !== 'super_admin') {
        return {
          error: 'Driver account required',
          content: `**Driver Account Required**

Only users with driver accounts can assign themselves to delivery requests.

Your current role: **${user.role}**

To become a driver:
1. Go to https://aeroperk.com/settings
2. Switch to a driver account
3. Complete Stripe verification to receive payments`,
        };
      }

      // Check Stripe verification for drivers
      if (user.stripeVerificationStatus &&
          !['verified', 'active'].includes(user.stripeVerificationStatus)) {
        return {
          error: 'Stripe verification required',
          content: `**Stripe Verification Required**

Your Stripe account is not verified. You need to complete verification to accept deliveries.

Current status: **${user.stripeVerificationStatus}**

Complete verification at https://aeroperk.com/settings/payments`,
        };
      }

      // Set auth token for API calls
      aeroperkClient.setAuthToken(user.access_token!);

      // Assign driver to request
      const result = await aeroperkClient.assignDriver(input.requestId, input.note);

      return {
        content: `**Successfully Assigned to Delivery!**

**Request ID:** \`${input.requestId}\`
**Driver:** ${user.firstName} ${user.lastName}
**Status:** Pending sender confirmation
${input.note ? `**Your note:** "${input.note}"` : ''}

**What happens next:**
1. The sender has been notified of your interest
2. You'll receive a notification when they accept
3. Once accepted, you can coordinate pickup details via chat

**Track this delivery:** https://aeroperk.com/requests/${input.requestId}`,
        widget: {
          type: 'assignment_confirmation',
          props: {
            requestId: input.requestId,
            driverId: user._id,
            driverName: `${user.firstName} ${user.lastName}`,
            note: input.note,
            status: 'pending_confirmation',
          },
        },
      };
    } catch (error: any) {
      console.error('Assign driver error:', error);
      const errorMsg = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;

      // Handle specific error cases
      if (statusCode === 401) {
        return {
          error: 'Authentication expired',
          content: 'Your session has expired. Please log in again at https://aeroperk.com',
        };
      }

      if (statusCode === 404) {
        return {
          error: 'Request not found',
          content: `**Request Not Found**

The delivery request with ID \`${input.requestId}\` was not found.

It may have been:
- Deleted by the sender
- Already completed
- Invalid ID

Use \`search_driver_routes\` to find available requests.`,
        };
      }

      if (statusCode === 400 || statusCode === 409) {
        // Already assigned or validation error
        if (errorMsg.toLowerCase().includes('already') ||
            errorMsg.toLowerCase().includes('assigned') ||
            errorMsg.toLowerCase().includes('claimed')) {
          return {
            error: 'Request already assigned',
            content: `**Request Already Claimed**

This delivery request has already been assigned to another driver.

Use \`search_driver_routes\` to find other available requests.`,
          };
        }

        return {
          error: 'Cannot assign',
          content: `**Cannot Assign to Request**\n\n${errorMsg}\n\nPlease try a different request.`,
        };
      }

      if (statusCode === 403) {
        return {
          error: 'Not authorized',
          content: `**Not Authorized**\n\n${errorMsg}\n\nMake sure your driver account is properly set up.`,
        };
      }

      return {
        error: `Failed to assign: ${errorMsg}`,
        content: `**Error Assigning to Delivery**\n\nThere was an error: ${errorMsg}\n\nPlease try again or contact support@aeroperk.com`,
      };
    }
  },
};
