import { aeroperkClient } from '../aeroperkClient';
import { MCPContext, MCPToolResult, DriverRoute, PopulatedDriver } from '@/types';

export const searchDriverRoutesTool = {
  name: 'search_driver_routes',
  description: 'Search for drivers traveling on a specific route who can deliver packages. Returns available drivers with their travel dates, capacity, and pricing.',
  inputSchema: {
    type: 'object',
    properties: {
      originCity: {
        type: 'string',
        description: 'Origin city name (e.g., "Seattle", "New York", "London")',
      },
      destinationCity: {
        type: 'string',
        description: 'Destination city name (e.g., "São Paulo", "Tokyo", "Paris")',
      },
      originCountry: {
        type: 'string',
        description: 'Origin country (optional, e.g., "United States", "Brazil")',
      },
      destinationCountry: {
        type: 'string',
        description: 'Destination country (optional)',
      },
      dateFrom: {
        type: 'string',
        format: 'date',
        description: 'Start of travel date range (ISO date, e.g., "2025-12-20")',
      },
      dateTo: {
        type: 'string',
        format: 'date',
        description: 'End of travel date range (ISO date, e.g., "2025-12-31")',
      },
      vehicleType: {
        type: 'string',
        enum: ['car', 'van', 'truck', 'suv', 'motorcycle', 'air', 'train', 'bus'],
        description: 'Filter by vehicle/transport type (optional)',
      },
      maxPrice: {
        type: 'number',
        description: 'Maximum price you\'re willing to pay (optional)',
        minimum: 0,
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (1-50, default 10)',
        minimum: 1,
        maximum: 50,
      },
    },
    required: [], // All parameters are optional for browsing
  },

  async execute(input: any, context: MCPContext): Promise<MCPToolResult> {
    try {
      // Check authentication
      const user = await context.auth.getUser();
      if (!user) {
        return {
          error: 'Authentication required',
          content: `**Authentication Required**

To search for drivers, please provide your AeroPerk authentication token.

Sign up or log in at https://aeroperk.com`,
        };
      }

      // Set auth token for API calls
      aeroperkClient.setAuthToken(user.access_token!);

      // Search for routes
      const result = await aeroperkClient.searchDriverRoutes({
        originCity: input.originCity,
        destinationCity: input.destinationCity,
        originCountry: input.originCountry,
        destinationCountry: input.destinationCountry,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        vehicleType: input.vehicleType,
        maxPrice: input.maxPrice,
        page: 1,
        limit: input.limit || 10,
      });

      const routes: DriverRoute[] = result.routes || result || [];

      // No results found
      if (!routes || routes.length === 0) {
        let searchInfo = '';
        if (input.originCity || input.destinationCity) {
          searchInfo = `from ${input.originCity || 'any city'} to ${input.destinationCity || 'any city'}`;
        }

        return {
          content: `**No Driver Routes Found**${searchInfo ? ` ${searchInfo}` : ''}

**Suggestions:**
1. Try broader search criteria (remove city or date filters)
2. Create a delivery request anyway - drivers will see it when they post matching routes
3. Check back later as new routes are added daily

**Create a request:** Use \`create_delivery_request\` to post your delivery need`,
          widget: {
            type: 'empty_state',
            props: {
              searchCriteria: input,
            },
          },
        };
      }

      // Format route descriptions
      const routeDescriptions = routes.slice(0, 10).map((route: DriverRoute, index: number) => {
        const driver = route.driverId as PopulatedDriver;
        const driverName = driver?.firstName
          ? `${driver.firstName} ${driver.lastName?.charAt(0) || ''}.`
          : 'Driver';

        const departureDate = new Date(route.departureDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        const capacity = route.availableCapacity;
        const capacityInfo = capacity?.weight ? `${capacity.weight}kg` :
                            capacity?.pieces ? `${capacity.pieces} items` : '';

        const priceInfo = route.priceRange?.max
          ? `$${route.priceRange.min || 0}-$${route.priceRange.max}`
          : '';

        const vehicleIcon = getVehicleIcon(route.vehicleType);

        return `${index + 1}. **${driverName}** ${vehicleIcon}
   ${route.origin.city} → ${route.destination.city}
   📅 ${departureDate}${capacityInfo ? ` | 📦 ${capacityInfo}` : ''}${priceInfo ? ` | 💰 ${priceInfo}` : ''}
   ID: \`${route._id}\``;
      }).join('\n\n');

      const pagination = result.pagination;
      const totalInfo = pagination?.total
        ? `Showing ${routes.length} of ${pagination.total} routes`
        : `Found ${routes.length} route${routes.length > 1 ? 's' : ''}`;

      return {
        content: `**Driver Routes Found**

${totalInfo}${input.originCity || input.destinationCity ? ` for ${input.originCity || 'any'} → ${input.destinationCity || 'any'}` : ''}

${routeDescriptions}

---
**Next Steps:**
- Create a delivery request with \`create_delivery_request\`
- Contact a driver through the AeroPerk app
- Use the route ID to reference a specific driver`,
        widget: {
          type: 'driver_routes_list',
          props: {
            routes: routes,
            pagination: pagination,
          },
        },
      };
    } catch (error: any) {
      console.error('Search driver routes error:', error);
      const errorMsg = error.response?.data?.message || error.message;

      if (error.response?.status === 401) {
        return {
          error: 'Authentication expired',
          content: 'Your session has expired. Please log in again at https://aeroperk.com',
        };
      }

      return {
        error: `Failed to search driver routes: ${errorMsg}`,
        content: `**Error Searching Routes**\n\nThere was an error searching for drivers: ${errorMsg}\n\nPlease try again.`,
      };
    }
  },
};

function getVehicleIcon(vehicleType?: string): string {
  const icons: Record<string, string> = {
    car: '🚗',
    van: '🚐',
    truck: '🚛',
    suv: '🚙',
    motorcycle: '🏍️',
    bicycle: '🚲',
    air: '✈️',
    train: '🚂',
    bus: '🚌',
    other: '🚗',
  };
  return icons[vehicleType || 'other'] || '🚗';
}
