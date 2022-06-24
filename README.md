# TraceTreeUI

## Quick Start

```bash
# Install dependencies for server
npm install

# Install dependencies for client
npm run client-install

# Run the client & server with concurrently
npm run dev

# Run the Express server only
npm run server

# Run the React client only
npm run client

# Server runs on http://localhost:5000 and client on http://localhost:3000
```

Sourcegraph instance must be running at port 7080.

Currently we have hardcoded it to search in [spring-projects/spring-framework](https://github.com/spring-projects/spring-framework) codebase.

Add this github repository in your sourcegraph instance.

Provide the access token of sourcegraph in '.env' file (as below) and keep it in root directory of the project
```
ACCESS_TOKEN=<Your sourcegraph access token>
```
