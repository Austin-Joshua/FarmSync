// Load environment variables FIRST, before any other imports
require('dotenv').config();

// Start the TypeScript server
require('tsx').default(require.resolve('./src/server.ts'));
