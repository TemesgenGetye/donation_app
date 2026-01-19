# 📚 API Documentation

This document provides comprehensive API documentation for all microservices in the Donation Platform.

## 📋 Table of Contents

- [Donation Service API](#donation-service-api)
- [Campaign Service API](#campaign-service-api)
- [Viewing Swagger Documentation](#viewing-swagger-documentation)
- [API Client Usage](#api-client-usage)

---

## 🎁 Donation Service API

**Base URL**: `http://localhost:3001`  
**API Base**: `http://localhost:3001/api`

### Endpoints

#### Health Check

```http
GET /health
```

Returns the health status of the service.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "service": "donation-service",
  "database": "connected",
  "messaging": "connected"
}
```

---

#### List Donations

```http
GET /api/donations
```

Retrieve a list of donations with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `available`, `claimed`, `completed`, `rejected`)
- `category` (optional): Filter by category (string)
- `donor_id` (optional): Filter by donor ID (UUID)

**Example Request:**
```bash
curl "http://localhost:3001/api/donations?status=available&category=Books"
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "donor_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Books for Education",
    "description": "Educational books for children",
    "category": "Books",
    "location": "Addis Ababa",
    "image_url": "https://example.com/image.jpg",
    "status": "available",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

---

#### Get Donation by ID

```http
GET /api/donations/{id}
```

Retrieve a specific donation by its UUID.

**Path Parameters:**
- `id` (required): Donation UUID

**Example Request:**
```bash
curl "http://localhost:3001/api/donations/550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "donor_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Books for Education",
  "description": "Educational books for children",
  "category": "Books",
  "location": "Addis Ababa",
  "image_url": "https://example.com/image.jpg",
  "status": "available",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

---

#### Create Donation

```http
POST /api/donations
```

Create a new donation listing.

**Request Body:**
```json
{
  "donor_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Books for Education",
  "description": "Educational books for children in need",
  "category": "Books",
  "location": "Addis Ababa, Ethiopia",
  "image_url": "https://example.com/image.jpg",
  "status": "pending"
}
```

**Required Fields:**
- `donor_id` (UUID)
- `title` (string)
- `description` (string)
- `category` (string)
- `location` (string)

**Optional Fields:**
- `image_url` (string, URI)
- `status` (`pending` or `available`, defaults to `pending`)

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donor_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Books for Education",
    "description": "Educational books for children",
    "category": "Books",
    "location": "Addis Ababa, Ethiopia"
  }'
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "donor_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Books for Education",
  "description": "Educational books for children",
  "category": "Books",
  "location": "Addis Ababa, Ethiopia",
  "image_url": null,
  "status": "pending",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

---

#### Update Donation

```http
PUT /api/donations/{id}
```

Update an existing donation. Only provided fields will be updated.

**Path Parameters:**
- `id` (required): Donation UUID

**Request Body:**
```json
{
  "title": "Updated Book Title",
  "status": "claimed"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3001/api/donations/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Book Title",
    "status": "claimed"
  }'
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "donor_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Updated Book Title",
  "description": "Educational books for children",
  "category": "Books",
  "location": "Addis Ababa, Ethiopia",
  "image_url": null,
  "status": "claimed",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

---

#### Delete Donation

```http
DELETE /api/donations/{id}
```

Delete a donation by ID.

**Path Parameters:**
- `id` (required): Donation UUID

**Example Request:**
```bash
curl -X DELETE http://localhost:3001/api/donations/550e8400-e29b-41d4-a716-446655440000
```

**Response:** `200 OK`
```json
{
  "message": "Donation deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 💰 Campaign Service API

**Base URL**: `http://localhost:3002`  
**API Base**: `http://localhost:3002/api`

### Endpoints

#### Health Check

```http
GET /health
```

Returns the health status of the service.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "service": "campaign-service",
  "database": "connected",
  "messaging": "connected"
}
```

---

#### List Campaigns

```http
GET /api/campaigns
```

Retrieve a list of campaigns with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `active`, `paused`, `completed`, `rejected`)
- `category` (optional): Filter by category (string)
- `recipient_id` (optional): Filter by recipient ID (UUID)

**Example Request:**
```bash
curl "http://localhost:3002/api/campaigns?status=active&category=Medical"
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "recipient_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Medical Fund",
    "description": "Help with medical expenses",
    "category": "Medical",
    "location": "Addis Ababa",
    "goal_amount": 5000,
    "collected_amount": 2500,
    "image_url": "https://example.com/image.jpg",
    "status": "active",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

---

#### Get Campaign by ID

```http
GET /api/campaigns/{id}
```

Retrieve a specific campaign by its UUID.

**Path Parameters:**
- `id` (required): Campaign UUID

**Example Request:**
```bash
curl "http://localhost:3002/api/campaigns/550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "recipient_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Medical Fund",
  "description": "Help with medical expenses",
  "category": "Medical",
  "location": "Addis Ababa",
  "goal_amount": 5000,
  "collected_amount": 2500,
  "image_url": "https://example.com/image.jpg",
  "status": "active",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

---

#### Create Campaign

```http
POST /api/campaigns
```

Create a new fundraising campaign.

**Request Body:**
```json
{
  "recipient_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Medical Fund",
  "description": "Help with medical expenses for surgery",
  "category": "Medical",
  "location": "Addis Ababa, Ethiopia",
  "goal_amount": 5000,
  "image_url": "https://example.com/image.jpg",
  "status": "pending"
}
```

**Required Fields:**
- `recipient_id` (UUID)
- `title` (string)
- `description` (string)
- `category` (string)
- `location` (string)

**Optional Fields:**
- `goal_amount` (number, float)
- `collected_amount` (number, float, defaults to 0)
- `image_url` (string, URI)
- `status` (`pending` or `active`, defaults to `pending`)

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Medical Fund",
    "description": "Help with medical expenses",
    "category": "Medical",
    "location": "Addis Ababa, Ethiopia",
    "goal_amount": 5000
  }'
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "recipient_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Medical Fund",
  "description": "Help with medical expenses",
  "category": "Medical",
  "location": "Addis Ababa, Ethiopia",
  "goal_amount": 5000,
  "collected_amount": 0,
  "image_url": null,
  "status": "pending",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

---

#### Update Campaign

```http
PUT /api/campaigns/{id}
```

Update an existing campaign. Only provided fields will be updated.

**Path Parameters:**
- `id` (required): Campaign UUID

**Request Body:**
```json
{
  "title": "Updated Campaign Title",
  "status": "active",
  "goal_amount": 6000
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3002/api/campaigns/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Campaign Title",
    "status": "active"
  }'
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "recipient_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Updated Campaign Title",
  "description": "Help with medical expenses",
  "category": "Medical",
  "location": "Addis Ababa, Ethiopia",
  "goal_amount": 6000,
  "collected_amount": 0,
  "image_url": null,
  "status": "active",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

---

#### Contribute to Campaign

```http
POST /api/campaigns/{id}/contribute
```

Add a monetary contribution to a campaign.

**Path Parameters:**
- `id` (required): Campaign UUID

**Request Body:**
```json
{
  "amount": 100.50
}
```

**Required Fields:**
- `amount` (number, float, must be > 0)

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/campaigns/550e8400-e29b-41d4-a716-446655440000/contribute \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50
  }'
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "recipient_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Medical Fund",
  "description": "Help with medical expenses",
  "category": "Medical",
  "location": "Addis Ababa, Ethiopia",
  "goal_amount": 5000,
  "collected_amount": 100.50,
  "image_url": null,
  "status": "active",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

---

#### Delete Campaign

```http
DELETE /api/campaigns/{id}
```

Delete a campaign by ID.

**Path Parameters:**
- `id` (required): Campaign UUID

**Example Request:**
```bash
curl -X DELETE http://localhost:3002/api/campaigns/550e8400-e29b-41d4-a716-446655440000
```

**Response:** `200 OK`
```json
{
  "message": "Campaign deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 📖 Viewing Swagger Documentation

### Option 1: Swagger Editor (Online)

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Copy the contents of `microservices/donation-service/swagger.yaml` or `microservices/campaign-service/swagger.yaml`
3. Paste into the editor
4. View interactive API documentation

### Option 2: Swagger UI (Local)

Install Swagger UI locally:

```bash
npm install -g swagger-ui-serve
swagger-ui-serve microservices/donation-service/swagger.yaml
```

Or use Docker:

```bash
docker run -p 8080:8080 -e SWAGGER_JSON=/swagger.yaml -v $(pwd)/microservices/donation-service:/swagger swaggerapi/swagger-ui
```

Then open: `http://localhost:8080`

### Option 3: Add Swagger UI to Services

To add Swagger UI directly to your services, install:

```bash
cd microservices/donation-service
npm install swagger-ui-express swagger-jsdoc
```

Then add Swagger middleware to your Express app.

---

## 🔧 API Client Usage

The React Native app uses a centralized API client (`lib/api.ts`):

```typescript
import { donationAPI, campaignAPI } from '@/lib/api';

// Donation operations
const donations = await donationAPI.getDonations({ status: 'active' });
const donation = await donationAPI.getDonationById(id);
await donationAPI.createDonation({
  donor_id: userId,
  title: "Books",
  description: "Educational books",
  category: "Books",
  location: "Addis Ababa"
});

// Campaign operations
const campaigns = await campaignAPI.getCampaigns({ status: 'active' });
const campaign = await campaignAPI.getCampaignById(id);
await campaignAPI.createCampaign({
  recipient_id: userId,
  title: "Medical Fund",
  description: "Help with expenses",
  category: "Medical",
  location: "Addis Ababa",
  goal_amount: 5000
});
await campaignAPI.contributeToCampaign(campaignId, 100);
```

---

## ⚠️ Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "donor_id",
      "message": "Invalid donor_id - must be a valid UUID"
    }
  ]
}
```

### 404 Not Found
```json
{
  "message": "Donation not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## 📝 Notes

- All UUIDs must be in the format: `550e8400-e29b-41d4-a716-446655440000`
- All timestamps are in ISO 8601 format (UTC)
- Image URLs should be publicly accessible
- Status values are case-sensitive
- Amounts are stored as floats (decimal numbers)

---

## 🔗 Related Documentation

- [Main README](../README.md)
- [Donation Service README](../microservices/donation-service/README.md)
- [Campaign Service README](../microservices/campaign-service/README.md)

---

<div align="center">

**API Documentation v1.0.0**

For questions or issues, please refer to the main README or open an issue.

</div>

