# API Documentation Server

A simple Express server that serves the unified Swagger/OpenAPI documentation for the entire Donation Platform system.

## Purpose

This server provides a single entry point to view all API documentation for both microservices (Donation Service and Campaign Service) in one place.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Access

- **Unified API Docs**: http://localhost:3000/api-docs
- **Home Page**: http://localhost:3000/
- **Health Check**: http://localhost:3000/health

## Individual Service Docs

- **Donation Service**: http://localhost:3001/api-docs
- **Campaign Service**: http://localhost:3002/api-docs

## Port

Default port is `3000`. You can change it by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

