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

# Server runs on http://localhost:5003 and client on http://localhost:3000
```

Add the github repository on which you want to do searches in your sourcegraph instance.

Provide the access token of sourcegraph, repository to search in and sourcegraph instance endpoint in '.env' file (as below) and keep it in root directory of the project
```
ACCESS_TOKEN=<Your sourcegraph access token>
REPOSITORY=<Repository to search in, example: spring-projects/spring-framework>
SOURCEGRAPH_ENDPOINT=<Url where sourcegraph instance is running, example: http://127.0.0.1:7080>
```

# Sourcegraph Setup:

Create your own sourcegraph instance.([Details](https://about.sourcegraph.com/get-started))

Add github repository in this instance.([Details](https://docs.sourcegraph.com/admin/external_service/github))

Create your own access token for the sourcegraph instance([Details](https://docs.sourcegraph.com/cli/how-tos/creating_an_access_token))