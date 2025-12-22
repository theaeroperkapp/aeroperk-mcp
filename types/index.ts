// Matches actual AeroPerk MongoDB models

export interface Address {
  formattedAddress: string;
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
  lat: number;
  lng: number;
}

export interface DeliveryRequest {
  _id: string;
  title: string;
  pickupAddress: Address;
  dropoffAddress: Address;
  reward: number;
  shortDescription?: string;
  deadline?: string;
  status: 'OPEN' | 'PENDING_PAYMENT' | 'PAID' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
  senderId: string | User;
  driverId?: string | User;
  sourceRouteId?: string;
  requestSource?: 'public' | 'driver_route';
  images?: string[];
  platformFee?: number;
  stripeFee?: number;
  driverEarnings?: number;
  payoutStatus?: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface DriverRouteLocation {
  city: string;
  state?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  fullAddress?: string;
}

export interface AvailableCapacity {
  weight?: number;  // in kg
  volume?: number;  // in cubic meters
  pieces?: number;  // number of items
}

export interface PriceRange {
  min?: number;
  max?: number;
  currency?: string;
  isNegotiable?: boolean;
}

export interface DriverRoute {
  _id: string;
  driverId: string | PopulatedDriver;
  origin: DriverRouteLocation;
  destination: DriverRouteLocation;
  departureDate: string;
  arrivalDate?: string;
  flexibility?: 'exact' | 'within_1_day' | 'within_3_days' | 'within_week' | 'flexible';
  availableCapacity?: AvailableCapacity;
  priceRange?: PriceRange;
  vehicleType?: 'car' | 'van' | 'truck' | 'suv' | 'motorcycle' | 'bicycle' | 'air' | 'train' | 'bus' | 'other';
  notes?: string;
  restrictions?: {
    noLiquids?: boolean;
    noFragile?: boolean;
    noPerishable?: boolean;
    maxItemSize?: string;
  };
  isActive: boolean;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  showProfile?: boolean;
  viewCount?: number;
  contactCount?: number;
  routeName?: string;  // Virtual field
  daysUntilDeparture?: number;  // Virtual field
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedDriver {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
  rating?: number;
  totalDeliveries?: number;
  stripeVerificationStatus?: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'sender' | 'driver' | 'admin' | 'super_admin' | 'viewer';
  phone?: string;
  city?: string;
  state?: string;
  profilePicture?: string;
  stripeAccountId?: string;
  stripeCustomerId?: string;
  stripeVerificationStatus?: string;
  isActive?: boolean;
  access_token?: string; // Added by MCP server
}

export interface MCPContext {
  auth: {
    getUser: () => Promise<User | null>;
  };
}

export interface MCPToolResult {
  content: string;
  error?: string;
  widget?: {
    type: string;
    props: Record<string, any>;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
    type?: string;
  };
}
