# 🐳 Docker Setup Guide

## ✅ What's Ready

Both microservices have been successfully built as Docker images:
- ✅ `donation-service:latest` (239MB)
- ✅ `campaign-service:latest` (239MB)

You can see them in Docker Desktop under **Images**.

## ⚠️ Current Situation

Your services are currently running **directly** (not in Docker):
- Donation Service on port 3001
- Campaign Service on port 3002
- RabbitMQ in Docker on port 5672

## 🚀 Option 1: Stop Direct Services & Use Docker (Recommended)

### Step 1: Stop the services running directly
```bash
# Find and stop the Node processes
pkill -f "donation-service"
pkill -f "campaign-service"
# Or stop them from the terminals where they're running (Ctrl+C)
```

### Step 2: Start with Docker Compose
```bash
# Donation Service
cd microservices/donation-service
docker-compose up -d

# Campaign Service  
cd microservices/campaign-service
docker-compose up -d
```

### Step 3: Verify
```bash
docker ps
```

You should see:
- `donation-service` container
- `campaign-service` container

## 🚀 Option 2: Use Different Ports in Docker

If you want to keep services running directly AND in Docker:

### Update docker-compose.yml ports:
```yaml
# donation-service/docker-compose.yml
ports:
  - "3003:3001"  # Use 3003 instead of 3001

# campaign-service/docker-compose.yml  
ports:
  - "3004:3002"  # Use 3004 instead of 3002
```

## 📋 Quick Commands

### View running containers:
```bash
docker ps
```

### View all images:
```bash
docker images
```

### View logs:
```bash
# Donation Service
cd microservices/donation-service
docker-compose logs -f donation-service

# Campaign Service
cd microservices/campaign-service
docker-compose logs -f campaign-service
```

### Stop containers:
```bash
cd microservices/donation-service
docker-compose down

cd microservices/campaign-service
docker-compose down
```

### Rebuild after code changes:
```bash
cd microservices/donation-service
docker-compose up -d --build

cd microservices/campaign-service
docker-compose up -d --build
```

## 🎯 Access Services

Once running in Docker:
- **Donation Service**: http://localhost:3001
- **Campaign Service**: http://localhost:3002
- **Health Checks**: 
  - http://localhost:3001/health
  - http://localhost:3002/health
- **API Docs**:
  - http://localhost:3001/api-docs
  - http://localhost:3002/api-docs

## 🔧 Troubleshooting

### Port already in use:
- Stop services running directly first
- Or change ports in docker-compose.yml

### Container won't start:
```bash
# Check logs
docker-compose logs donation-service

# Check if .env file exists
ls -la microservices/donation-service/.env
```

### Rebuild from scratch:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

