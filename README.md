# AeroPerk MCP Server for ChatGPT

**Project:** ChatGPT Integration for AeroPerk
**Status:** In Development
**Last Updated:** December 20, 2025

---

## Overview

This is a **Next.js MCP (Model Context Protocol) server** that enables ChatGPT to interact with the AeroPerk delivery platform. Users can create delivery requests, search for drivers, and manage bookings directly through ChatGPT.

### Architecture

```
ChatGPT → MCP Server (Vercel) → AeroPerk Backend (EC2)
                ↓                        ↓
         This project          api.aeroperk.com
```

---

## Build Phases Checklist

### Phase 1: Project Setup
- [x] Create project directory structure
- [x] Initialize package.json with dependencies
- [x] Configure TypeScript (tsconfig.json)
- [x] Configure Next.js (next.config.js)
- [x] Configure Tailwind CSS
- [x] Set up environment variables
- [x] Create .gitignore

### Phase 2: Core Libraries
- [x] Create TypeScript types (`types/index.ts`)
- [x] Create AeroPerk API client (`lib/aeroperkClient.ts`)
- [x] Create auth utilities (`lib/auth.ts`)

### Phase 3: MCP Tools
- [x] Tool 1: `create_delivery_request` (`lib/tools/createRequest.ts`)
- [x] Tool 2: `search_driver_routes` (`lib/tools/searchDriverRoutes.ts`)
- [x] Tool 3: `assign_driver` (`lib/tools/assignDriver.ts`)

### Phase 4: MCP Server
- [x] Create MCP server class (`lib/mcp.ts`)
- [x] Create API route (`app/api/mcp/route.ts`)
- [x] Create home page (`app/page.tsx`)
- [x] Create layout (`app/layout.tsx`)
- [x] Create global styles (`app/globals.css`)

### Phase 5: Compliance
- [x] Create privacy policy page (`app/privacy-policy/page.tsx`)

### Phase 6: Backend Integration
- [x] Update EC2 CORS to allow Vercel domain
- [ ] Test API connectivity

### Phase 7: Deployment
- [x] Install dependencies locally (`npm install`)
- [x] Test locally with `npm run dev`
- [x] Deploy to Vercel
- [x] Set environment variables in Vercel
- [x] Test production endpoint

### Phase 8: ChatGPT Integration
- [x] Enable ChatGPT Developer Mode
- [x] Create ChatGPT App
- [x] Configure MCP Server URL
- [ ] Test with sample prompts

---

## Live URLs

| Resource | URL |
|----------|-----|
| **MCP Server** | https://aeroperk-mcp.vercel.app/api/mcp |
| **Home Page** | https://aeroperk-mcp.vercel.app |
| **Privacy Policy** | https://aeroperk-mcp.vercel.app/privacy-policy |
| **GitHub Repo** | https://github.com/theaeroperkapp/aeroperk-mcp |
| **Vercel Dashboard** | https://vercel.com/aeroperk/aeroperk-mcp |

---

## MCP Tools

| Tool | Description | Endpoint Called |
|------|-------------|-----------------|
| `create_delivery_request` | Create a new delivery request | POST /v1/requests |
| `search_driver_routes` | Search for drivers on a route | GET /v1/driver-routes |
| `assign_driver` | Driver assigns themselves to request | POST /v1/requests/:id/assign |

---

## Environment Variables

```env
AEROPERK_API_URL=https://api.aeroperk.com/api
NEXTAUTH_SECRET=your_secret_here
NODE_ENV=development
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test MCP endpoint
curl http://localhost:3000/api/mcp
```

---

## Deployment

```bash
# Deploy to Vercel
vercel

# Set env vars
vercel env add AEROPERK_API_URL
vercel env add NEXTAUTH_SECRET

# Deploy production
vercel --prod
```

---

## Test Commands

```bash
# List available tools
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list"}'

# Create delivery request (requires auth token)
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "create_delivery_request",
      "arguments": {
        "title": "Laptop to São Paulo",
        "pickupAddress": "Seattle, WA",
        "dropoffAddress": "São Paulo, Brazil",
        "reward": 150
      }
    }
  }'
```

---

## Files Structure

```
aeroperk-mcp/
├── app/
│   ├── api/mcp/route.ts      # MCP API endpoint
│   ├── privacy-policy/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── tools/
│   │   ├── createRequest.ts
│   │   ├── searchDriverRoutes.ts
│   │   └── assignDriver.ts
│   ├── aeroperkClient.ts     # API client for EC2 backend
│   ├── auth.ts               # Auth utilities
│   └── mcp.ts                # MCP server class
├── types/
│   └── index.ts              # TypeScript interfaces
├── .env.local                # Environment variables
├── package.json
├── tsconfig.json
└── README.md                 # This file
```

---

## Notes

- This MCP server is a **separate project** from the main AeroPerk app
- It calls the existing EC2 backend via HTTP
- Authentication uses JWT tokens (same as the web app)
- OAuth can be added later for seamless ChatGPT login
