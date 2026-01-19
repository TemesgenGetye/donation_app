# 📚 Swagger UI Setup Guide

Your Swagger documentation is now integrated directly into your microservices! You can view and test your APIs without needing external tools.

## 🚀 Accessing Swagger UI

### 🌟 Unified API Documentation (Recommended)

**URL**: http://localhost:3000/api-docs

A single documentation server that combines both microservices into one unified view!

**Setup:**
```bash
cd api-docs-server
npm install
npm start
```

Then open: http://localhost:3000/api-docs

**Features:**
- All endpoints from both services in one place
- Clear service separation (Donation Service vs Campaign Service)
- Server selection for each endpoint
- Complete system overview

### Individual Service Documentation

#### Donation Service

**URL**: http://localhost:3001/api-docs

Once the Donation Service is running, open this URL in your browser to see:

- All donation endpoints
- Request/response schemas
- Try it out functionality
- Interactive API testing

#### Campaign Service

**URL**: http://localhost:3002/api-docs

Once the Campaign Service is running, open this URL in your browser to see:

- All campaign endpoints
- Contribution endpoints
- Request/response schemas
- Try it out functionality

## 📋 Steps to View

### Option 1: Unified Documentation (Recommended)

1. **Start the unified docs server**:
   ```bash
   cd api-docs-server
   npm install
   npm start
   ```

2. **Open in browser**: http://localhost:3000/api-docs

### Option 2: Individual Service Docs

1. **Start the services**:

   ```bash
   # Terminal 1 - Donation Service
   cd microservices/donation-service
   npm run dev

   # Terminal 2 - Campaign Service
   cd microservices/campaign-service
   npm run dev
   ```

2. **Open in browser**:

   - Donation Service: http://localhost:3001/api-docs
   - Campaign Service: http://localhost:3002/api-docs

3. **You should see**:
   - Your API documentation (not the Petstore example!)
   - All endpoints listed
   - "Try it out" buttons to test APIs
   - Request/response examples

## ✨ Features

- **Interactive Testing**: Click "Try it out" on any endpoint to test it
- **Schema Validation**: See exact request/response formats
- **Examples**: Pre-filled example requests
- **Error Responses**: See all possible error codes and messages

## 🔧 Troubleshooting

### Still seeing Petstore example?

1. **Check service is running**:

   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   ```

2. **Check Swagger file exists**:

   ```bash
   ls microservices/donation-service/swagger.yaml
   ls microservices/campaign-service/swagger.yaml
   ```

3. **Restart the service**:
   - Stop the service (Ctrl+C)
   - Start again with `npm run dev`

### Swagger UI not loading?

- Check the console logs for errors
- Verify the `swagger.yaml` file is in the service root directory
- Make sure `swagger-ui-express` and `yamljs` are installed:
  ```bash
  cd microservices/donation-service
  npm list swagger-ui-express yamljs
  ```

## 📝 Updating Documentation

To update the Swagger documentation:

1. Edit the `swagger.yaml` file in the service directory
2. Restart the service
3. Refresh the browser at `/api-docs`

The changes will be reflected immediately!

## 🎯 Quick Test

1. Start Donation Service: `cd microservices/donation-service && npm run dev`
2. Open: http://localhost:3001/api-docs
3. Expand "Donations" section
4. Click "GET /api/donations"
5. Click "Try it out"
6. Click "Execute"
7. See the response!

---

**Note**: The Swagger UI is only available when the services are running. Make sure both services are started before accessing the documentation.
