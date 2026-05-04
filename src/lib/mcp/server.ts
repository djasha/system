import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerOriginalsTools } from './tools/originals';
// References, skills, directions, cross are added in later phases.

export function createMcpServer() {
  const server = new McpServer({
    name: 'djasha-system',
    version: '2.0.0',
  });

  registerOriginalsTools(server);

  return server;
}
