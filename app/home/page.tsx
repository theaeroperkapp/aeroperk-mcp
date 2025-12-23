export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AeroPerk MCP Server
        </h1>
        <p className="text-xl text-gray-600">
          ChatGPT integration for peer-to-peer package delivery
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Status: <span className="text-green-600">Active</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">MCP Endpoint</h3>
            <code className="bg-gray-100 px-3 py-2 rounded block text-sm">
              POST /api/mcp
            </code>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Server Info</h3>
            <code className="bg-gray-100 px-3 py-2 rounded block text-sm">
              GET /api/mcp
            </code>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Available Tools
        </h2>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg">create_delivery_request</h3>
            <p className="text-gray-600">
              Create a new package delivery request with pickup/dropoff locations
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-lg">search_driver_routes</h3>
            <p className="text-gray-600">
              Search for drivers traveling on a specific route
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold text-lg">assign_driver</h3>
            <p className="text-gray-600">
              As a driver, assign yourself to a delivery request
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Quick Test
        </h2>

        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`# List available tools
curl -X POST ${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"method":"tools/list"}'`}
        </pre>
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>
          <a href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </a>
          {' | '}
          <a href="https://aeroperk.com" className="hover:underline">
            AeroPerk.com
          </a>
          {' | '}
          <a href="mailto:support@aeroperk.com" className="hover:underline">
            Support
          </a>
        </p>
        <p className="mt-2">© 2025 AeroPerk. All rights reserved.</p>
      </div>
    </main>
  );
}
