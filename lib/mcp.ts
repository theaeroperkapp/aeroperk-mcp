import { createRequestTool, searchDriverRoutesTool, assignDriverTool } from './tools';
import { getUserFromToken, extractTokenFromHeader } from './auth';
import { MCPContext } from '@/types';

export interface MCPRequest {
  method: string;
  params?: any;
}

export interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export class MCPServer {
  private tools: Map<string, any>;

  constructor() {
    this.tools = new Map();
    this.registerTools();
  }

  private registerTools() {
    this.tools.set('create_delivery_request', createRequestTool);
    this.tools.set('search_driver_routes', searchDriverRoutesTool);
    this.tools.set('assign_driver', assignDriverTool);
  }

  async handleRequest(request: MCPRequest, authHeader: string | null): Promise<MCPResponse> {
    const { method, params } = request;

    // Extract and validate JWT token
    const token = extractTokenFromHeader(authHeader);
    const user = await getUserFromToken(token);

    // Create context for tools
    const context: MCPContext = {
      auth: {
        getUser: async () => user,
      },
    };

    switch (method) {
      case 'initialize':
        return this.handleInitialize();

      case 'tools/list':
        return this.listTools();

      case 'tools/call':
        if (!params?.name) {
          return {
            error: {
              code: -32602,
              message: 'Missing tool name in params',
            },
          };
        }
        return this.callTool(params.name, params.arguments || {}, context);

      case 'ping':
        return { result: { status: 'ok', timestamp: new Date().toISOString() } };

      default:
        return {
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
        };
    }
  }

  private handleInitialize(): MCPResponse {
    return {
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'aeroperk-mcp',
          version: '1.0.0',
        },
      },
    };
  }

  private listTools(): MCPResponse {
    const toolsList = Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));

    return {
      result: {
        tools: toolsList,
      },
    };
  }

  private async callTool(
    toolName: string,
    args: any,
    context: MCPContext
  ): Promise<MCPResponse> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      return {
        error: {
          code: -32602,
          message: `Tool not found: ${toolName}. Available tools: ${Array.from(this.tools.keys()).join(', ')}`,
        },
      };
    }

    try {
      console.log(`Executing tool: ${toolName}`, { args: JSON.stringify(args).slice(0, 200) });
      const result = await tool.execute(args, context);
      console.log(`Tool ${toolName} completed successfully`);

      return {
        result: {
          content: [
            {
              type: 'text',
              text: result.content,
            },
          ],
          ...(result.widget && { widget: result.widget }),
          ...(result.error && { isError: true }),
        },
      };
    } catch (error: any) {
      console.error(`Tool ${toolName} execution failed:`, error);
      return {
        error: {
          code: -32603,
          message: `Tool execution failed: ${error.message}`,
        },
      };
    }
  }

  getToolsList() {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
    }));
  }
}

// Export singleton instance
export const mcpServer = new MCPServer();
