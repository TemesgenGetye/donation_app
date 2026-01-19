# 🎁 Donation Platform - Distributed Systems Project

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54.0.0-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)

**A modern donation platform built with React Native and microservices architecture**

[Features](#-features) • [Architecture](#-architecture) • [Setup](#-setup) • [API Documentation](#-api-documentation) • [Development](#-development)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Guide](#-setup-guide)
- [Microservices](#-microservices)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 Overview

This is a comprehensive donation platform that connects donors with recipients through campaigns and direct donations. The platform is built using a **microservices architecture** for the Distributed Systems course (SWENG5111), demonstrating modern distributed system patterns including:

- **Service-oriented architecture** with independent microservices
- **Event-driven communication** using RabbitMQ Pub/Sub
- **RESTful APIs** for synchronous communication
- **Containerization** with Docker
- **Scalable and maintainable** codebase

### Key Capabilities

- 🎁 **Donation Management**: Donors can create and manage donation listings
- 💰 **Campaign Management**: Recipients can create fundraising campaigns
- 👥 **User Management**: Role-based access (Donor, Recipient, Admin)
- 💬 **Messaging System**: Real-time communication between users
- 📊 **Admin Dashboard**: Comprehensive admin panel for platform management
- ✅ **Verification System**: Profile verification for recipients

---

## ✨ Features

### For Donors

- ✅ Create donation listings with images
- ✅ Browse and search donations
- ✅ Contribute to campaigns
- ✅ Message recipients
- ✅ Rate completed donations
- ✅ Report inappropriate content

### For Recipients

- ✅ Create fundraising campaigns
- ✅ Request donations
- ✅ Manage campaign contributions
- ✅ Profile verification system
- ✅ Message donors
- ✅ Track campaign progress

### For Admins

- ✅ Approve/reject donations and campaigns
- ✅ Manage user verifications
- ✅ Review reports
- ✅ User management
- ✅ Platform analytics

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native Mobile App                   │
│                  (Expo + TypeScript + React)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ REST API Calls
                        │
        ┌───────────────┴───────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────┐              ┌───────────────┐
│ Donation      │              │ Campaign      │
│ Service       │              │ Service       │
│ (Port 3001)   │              │ (Port 3002)   │
└───────┬───────┘              └───────┬───────┘
        │                              │
        │                              │
        └──────────────┬───────────────┘
                       │
                       │ RabbitMQ Pub/Sub
                       │
                       ▼
              ┌─────────────────┐
              │   RabbitMQ       │
              │   Message Broker │
              └─────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐          ┌───────────────┐
│   Supabase    │          │   Supabase     │
│   PostgreSQL  │          │   Storage     │
│   Database    │          │   (Images)    │
└───────────────┘          └───────────────┘
```

### Microservices Overview

| Service               | Port | Responsibility                          | Status     |
| --------------------- | ---- | --------------------------------------- | ---------- |
| **Donation Service**  | 3001 | Manages donation CRUD operations        | ✅ Active  |
| **Campaign Service**  | 3002 | Manages campaign CRUD and contributions | ✅ Active  |
| **Request Service**   | TBD  | Manages donation requests               | 🚧 Planned |
| **Messaging Service** | TBD  | Handles user messaging                  | 🚧 Planned |

### Communication Patterns

1. **Synchronous (REST)**: Client ↔ Microservices

   - Direct HTTP requests for CRUD operations
   - Immediate response required

2. **Asynchronous (Pub/Sub)**: Microservices ↔ RabbitMQ
   - Event publishing (e.g., `donation.created`, `campaign.contributed`)
   - Decoupled service communication
   - Event-driven architecture

---

## 🛠️ Tech Stack

### Frontend

- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (54.0.0) - Development platform and tooling
- **TypeScript** (5.8.3) - Type-safe JavaScript
- **Expo Router** - File-based routing
- **Lucide React Native** - Icon library
- **React Native Safe Area Context** - Safe area handling

### Backend Services

- **Node.js** (20+) - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend code
- **Winston** - Structured logging
- **Jest** - Testing framework

### Infrastructure

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Storage (images)
  - Row Level Security (RLS)
- **RabbitMQ** - Message broker for Pub/Sub
- **Docker** - Containerization

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

---

## 📁 Project Structure

```
Donation/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx            # Home/Donations screen
│   │   ├── campaigns.tsx        # Campaigns screen
│   │   ├── create.tsx           # Create donation/campaign
│   │   ├── requests.tsx         # Requests screen
│   │   ├── profile.tsx          # User profile
│   │   ├── admin.tsx            # Admin dashboard
│   │   └── _layout.tsx          # Tab navigation
│   ├── campaing-details.tsx      # Campaign details screen
│   └── donation-details.tsx     # Donation details screen
│
├── components/                   # Reusable components
│   ├── ReportModal.tsx
│   ├── ReviewModal.tsx
│   └── MoneySendingModal.tsx
│
├── contexts/                     # React contexts
│   └── AuthContext.tsx          # Authentication context
│
├── lib/                          # Utility libraries
│   ├── api.ts                   # Microservices API client
│   └── supabase.ts              # Supabase client
│
├── microservices/                # Microservices directory
│   ├── donation-service/        # Donation microservice
│   │   ├── src/
│   │   │   ├── config/          # Configuration
│   │   │   ├── controllers/     # Request handlers
│   │   │   ├── services/        # Business logic
│   │   │   ├── routes/          # API routes
│   │   │   ├── models/          # Data models
│   │   │   ├── middleware/     # Express middleware
│   │   │   └── utils/           # Utilities
│   │   ├── tests/               # Test files
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── campaign-service/         # Campaign microservice
│   │   └── [similar structure]
│   │
│   ├── request-service/          # Request microservice (planned)
│   └── messaging-service/        # Messaging microservice (planned)
│
├── supabase/                     # Supabase migrations
│   └── migrations/
│
├── types/                        # TypeScript type definitions
│   └── database.ts              # Supabase database types
│
├── .env                          # Environment variables
├── package.json                  # Root package.json
└── README.md                     # This file
```

---

## 🚀 Setup Guide

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Supabase account** (free tier works)
- **RabbitMQ** (via Docker or local installation)
- **Git**

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Doantion
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install microservice dependencies
cd microservices/donation-service && npm install && cd ../..
cd microservices/campaign-service && npm install && cd ../..
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Microservices API URLs
# For Physical Device: Use your computer's IP address
# For iOS Simulator: Use localhost
# For Android Emulator: Use 10.0.2.2
EXPO_PUBLIC_DONATION_SERVICE_URL=http://localhost:3001
EXPO_PUBLIC_CAMPAIGN_SERVICE_URL=http://localhost:3002
```

### Step 4: Configure Microservices

#### Donation Service

```bash
cd microservices/donation-service
cp env.template .env
```

Edit `.env`:

```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=your_jwt_secret
```

#### Campaign Service

```bash
cd microservices/campaign-service
cp env.template .env
```

Edit `.env`:

```env
PORT=3002
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=your_jwt_secret
```

### Step 5: Start RabbitMQ (Docker)

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Access RabbitMQ Management UI: http://localhost:15672 (guest/guest)

### Step 6: Start Microservices

#### Terminal 1 - Donation Service

```bash
cd microservices/donation-service
npm run dev
```

#### Terminal 2 - Campaign Service

```bash
cd microservices/campaign-service
npm run dev
```

### Step 7: Start the Mobile App

```bash
# From root directory
npm start
# or
npx expo start
```

### Step 8: Run on Device/Emulator

- **iOS Simulator**: Press `i` in the Expo CLI
- **Android Emulator**: Press `a` in the Expo CLI
- **Physical Device**: Scan QR code with Expo Go app

---

## 🔌 Microservices

### Donation Service

**Port**: 3001  
**Base URL**: `http://localhost:3001`

#### Endpoints

| Method   | Endpoint             | Description                   |
| -------- | -------------------- | ----------------------------- |
| `GET`    | `/api/donations`     | List donations (with filters) |
| `GET`    | `/api/donations/:id` | Get donation by ID            |
| `POST`   | `/api/donations`     | Create new donation           |
| `PUT`    | `/api/donations/:id` | Update donation               |
| `DELETE` | `/api/donations/:id` | Delete donation               |
| `GET`    | `/health`            | Health check                  |

#### Events Published

- `donation.created` - When a donation is created
- `donation.status.changed` - When donation status changes
- `donation.claimed` - When a donation is claimed
- `donation.deleted` - When a donation is deleted

#### Example Request

```bash
# Create donation
curl -X POST http://localhost:3001/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donor_id": "user-uuid",
    "title": "Books for Education",
    "description": "Educational books",
    "category": "Books",
    "location": "Addis Ababa",
    "status": "pending"
  }'
```

### Campaign Service

**Port**: 3002  
**Base URL**: `http://localhost:3002`

#### Endpoints

| Method   | Endpoint                        | Description                   |
| -------- | ------------------------------- | ----------------------------- |
| `GET`    | `/api/campaigns`                | List campaigns (with filters) |
| `GET`    | `/api/campaigns/:id`            | Get campaign by ID            |
| `POST`   | `/api/campaigns`                | Create new campaign           |
| `PUT`    | `/api/campaigns/:id`            | Update campaign               |
| `POST`   | `/api/campaigns/:id/contribute` | Contribute to campaign        |
| `DELETE` | `/api/campaigns/:id`            | Delete campaign               |
| `GET`    | `/health`                       | Health check                  |

#### Events Published

- `campaign.created` - When a campaign is created
- `campaign.status.changed` - When campaign status changes
- `campaign.contributed` - When someone contributes
- `campaign.completed` - When goal is reached
- `campaign.deleted` - When a campaign is deleted

#### Example Request

   ```bash
# Create campaign
curl -X POST http://localhost:3002/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "user-uuid",
    "title": "Medical Fund",
    "description": "Help with medical expenses",
    "category": "Medical",
    "location": "Addis Ababa",
    "goal_amount": 5000,
    "status": "pending"
  }'

# Contribute to campaign
curl -X POST http://localhost:3002/api/campaigns/campaign-uuid/contribute \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100
  }'
```

---

## 📚 API Documentation

### 🌟 Unified API Documentation Server

A dedicated server provides unified Swagger/OpenAPI documentation for the entire system:

**Setup:**
```bash
cd api-docs-server
   npm install
npm start
```

**Access:**
- **Unified Docs**: http://localhost:3000/api-docs
- **Home**: http://localhost:3000/

This server combines both microservices into one comprehensive API documentation with:
- All endpoints from Donation and Campaign services
- Interactive "Try it out" functionality
- Complete request/response schemas
- Service-specific server selection

### Individual Service Documentation

Each microservice also has its own Swagger UI:

- **Donation Service**: http://localhost:3001/api-docs
- **Campaign Service**: http://localhost:3002/api-docs

See [SWAGGER_SETUP.md](./SWAGGER_SETUP.md) for detailed setup instructions.

### API Client (`lib/api.ts`)

The app uses a centralized API client to communicate with microservices:

```typescript
import { donationAPI, campaignAPI } from "@/lib/api";

// Donation operations
const donations = await donationAPI.getDonations({ status: "active" });
const donation = await donationAPI.getDonationById(id);
await donationAPI.createDonation(donationData);
await donationAPI.updateDonation(id, updates);
await donationAPI.deleteDonation(id);

// Campaign operations
const campaigns = await campaignAPI.getCampaigns({ status: "active" });
const campaign = await campaignAPI.getCampaignById(id);
await campaignAPI.createCampaign(campaignData);
await campaignAPI.updateCampaign(id, updates);
await campaignAPI.contributeToCampaign(id, amount);
await campaignAPI.deleteCampaign(id);
```

### Error Handling

All API calls include error handling and will throw errors that can be caught:

```typescript
try {
  await donationAPI.createDonation(data);
} catch (error) {
  console.error("Failed to create donation:", error);
  Alert.alert("Error", error.message);
}
```

---

## 💻 Development

### Running in Development Mode

1. **Start all services**:

   ```bash
   # Terminal 1: Donation Service
   cd microservices/donation-service && npm run dev

   # Terminal 2: Campaign Service
   cd microservices/campaign-service && npm run dev

   # Terminal 3: React Native App
   npm start
   ```

2. **Hot Reload**: All services support hot reload on file changes

### Code Structure

- **Services**: Business logic in `src/services/`
- **Controllers**: Request handlers in `src/controllers/`
- **Routes**: API routes in `src/routes/`
- **Models**: TypeScript interfaces in `src/models/`
- **Middleware**: Express middleware in `src/middleware/`

### Logging

All microservices use Winston for structured logging:

```typescript
import { logger } from "./utils/logger";

logger.info("Donation created", { donationId: id });
logger.error("Error creating donation", { error });
```

Logs are written to:

- `combined.log` - All logs
- `error.log` - Error logs only

---

## 🧪 Testing

### Unit Tests

```bash
# Donation Service
cd microservices/donation-service
npm test

# Campaign Service
cd microservices/campaign-service
npm test
```

### Integration Tests

```bash
# Donation Service
cd microservices/donation-service
npm run test:integration

# Campaign Service
cd microservices/campaign-service
npm run test:integration
```

### Manual Testing

#### Test Donation Service

```bash
# Health check
curl http://localhost:3001/health

# Create donation
curl -X POST http://localhost:3001/api/donations \
  -H "Content-Type: application/json" \
  -d '{"donor_id":"test-id","title":"Test","description":"Test","category":"Other","location":"Test"}'
```

#### Test Campaign Service

```bash
# Health check
curl http://localhost:3002/health

# Create campaign
curl -X POST http://localhost:3002/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{"recipient_id":"test-id","title":"Test","description":"Test","category":"Other","location":"Test"}'
```

---

## 🚢 Deployment

### Microservices Deployment

Each microservice can be containerized with Docker:

```bash
# Build image
docker build -t donation-service ./microservices/donation-service
docker build -t campaign-service ./microservices/campaign-service

# Run container
docker run -p 3001:3001 --env-file .env donation-service
docker run -p 3002:3002 --env-file .env campaign-service
```

### Environment Variables for Production

Update `.env` files with production values:

- Use production Supabase URL and keys
- Use production RabbitMQ URL
- Set secure JWT secrets
- Configure CORS for production domains

### Mobile App Deployment

1. **Build for production**:

   ```bash
   expo build:android
   expo build:ios
   ```

2. **Update API URLs** in `.env` for production microservices

3. **Publish to app stores** via Expo EAS

---

## 🤝 Contributing

This is a course project for SWENG5111 (Distributed Systems). Contributions should follow:

1. **Code Style**: Follow TypeScript/ESLint rules
2. **Commits**: Use clear, descriptive commit messages
3. **Testing**: Add tests for new features
4. **Documentation**: Update README for significant changes

### Development Workflow

1. Create a feature branch
2. Make changes
3. Write/update tests
4. Submit pull request
5. Code review
6. Merge to main

---

## 📝 License

This project is created for educational purposes as part of the Distributed Systems course (SWENG5111) at Addis Ababa Science and Technology University.

---

## 👥 Team

**Course**: SWENG5111 - Distributed Systems  
**Instructor**: Felix Edesa, MSc  
**Institution**: Addis Ababa Science and Technology University

---

## 📞 Support

For issues or questions:

1. Check existing issues in the repository
2. Review microservice-specific READMEs in `microservices/`
3. Check Supabase dashboard for database issues
4. Verify RabbitMQ is running for event publishing

---

## 🎓 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Microservices Patterns](https://microservices.io/patterns/)

---

<div align="center">

**Built with ❤️ for Distributed Systems Coursee**

⭐ Star this repo if you find it helpful!

</div>
# Ds-Donation
# Ds-Donation
