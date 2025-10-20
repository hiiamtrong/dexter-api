# Docker Deployment Guide

This guide covers how to build and run the VyFinance Swap API using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Your Blockfrost API credentials (or Kupo instance)

## Quick Start

### 1. Setup Environment Variables

Make sure you have a `.env` file in the project root with your credentials:

```bash
# Blockfrost Configuration
BLOCKFROST_PROJECT_ID=your_project_id_here
BLOCKFROST_URL=https://cardano-mainnet.blockfrost.io/api/v0

# Optional: Kupo Configuration (if you prefer Kupo over Blockfrost)
# KUPO_URL=http://localhost:1442
```

### 2. Build and Run with Docker Compose

```bash
# Build and start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
curl http://localhost:3000/health
```

### 3. Access the API

Once running, the API will be available at:

- **API Base**: http://localhost:3000/api/swap
- **Health Check**: http://localhost:3000/health
- **Swagger Docs**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## Docker Commands

### Using Docker Compose (Recommended)

```bash
# Build the image
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f vyfinance-api

# Restart service
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

### Using Docker Directly

```bash
# Build the image
docker build -t vyfinance-swap-api .

# Run the container
docker run -d \
  --name vyfinance-api \
  -p 3000:3000 \
  --env-file .env \
  vyfinance-swap-api

# View logs
docker logs -f vyfinance-api

# Stop and remove
docker stop vyfinance-api
docker rm vyfinance-api
```

## Configuration

### Environment Variables

The following environment variables can be configured:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | API port | `3000` |
| `BLOCKFROST_PROJECT_ID` | Blockfrost project ID | Required |
| `BLOCKFROST_URL` | Blockfrost API URL | `https://cardano-mainnet.blockfrost.io/api/v0` |
| `KUPO_URL` | Kupo instance URL (optional) | - |

### Using Kupo Instead of Blockfrost

To use Kupo as your data provider:

1. Uncomment the Kupo service in `docker-compose.yml`
2. Set `KUPO_URL` in your `.env` file
3. Comment out Blockfrost variables

```yaml
# In docker-compose.yml, uncomment:
services:
  kupo:
    image: cardanosolutions/kupo:latest
    # ... rest of config
```

```bash
# In .env file:
KUPO_URL=http://kupo:1442
# BLOCKFROST_PROJECT_ID=...  (comment out)
```

## Health Checks

The container includes built-in health checks:

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T10:00:00.000Z",
  "uptime": 123.456
}
```

## Production Deployment

### Optimizations

The Dockerfile uses multi-stage builds to:
- ✅ Reduce final image size
- ✅ Only include production dependencies
- ✅ Improve security by minimizing attack surface
- ✅ Use Alpine Linux for smaller footprint

### Security Considerations

1. **Never commit `.env` file** - Use environment-specific secrets
2. **Use Docker secrets** for sensitive data in production
3. **Run as non-root user** (consider adding USER directive)
4. **Keep base image updated** - Regularly update `node:18-alpine`
5. **Scan images for vulnerabilities** - Use `docker scan`

### Example Production Deployment

```bash
# Build for production
docker build -t myregistry.com/vyfinance-api:v1.0.0 .

# Push to registry
docker push myregistry.com/vyfinance-api:v1.0.0

# Deploy on server
docker pull myregistry.com/vyfinance-api:v1.0.0
docker run -d \
  --name vyfinance-api \
  --restart unless-stopped \
  -p 3000:3000 \
  -e BLOCKFROST_PROJECT_ID=${BLOCKFROST_PROJECT_ID} \
  -e BLOCKFROST_URL=${BLOCKFROST_URL} \
  myregistry.com/vyfinance-api:v1.0.0
```

## Monitoring

### View Logs

```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f vyfinance-api
```

### Container Stats

```bash
# Real-time stats
docker stats vyfinance-api

# One-time stats
docker stats --no-stream
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs vyfinance-api

# Check if port 3000 is already in use
lsof -ti:3000

# Inspect container
docker inspect vyfinance-api
```

### Environment Variables Not Loading

```bash
# Verify .env file exists
ls -la .env

# Check environment in container
docker-compose exec vyfinance-api env | grep BLOCKFROST
```

### Module Resolution Errors

The Dockerfile includes `--experimental-specifier-resolution=node` flag. If you still encounter module errors:

```bash
# Rebuild without cache
docker-compose build --no-cache

# Verify node_modules in image
docker-compose exec vyfinance-api ls -la node_modules/@indigo-labs/dexter
```

## Cleaning Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker rmi vyfinance-swap-api

# Full cleanup (careful!)
docker system prune -a
```

## Next Steps

- Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for endpoint details
- Check [DATA_PROVIDERS.md](DATA_PROVIDERS.md) for Blockfrost vs Kupo comparison
- See [SETUP.md](SETUP.md) for local development setup

## Support

For issues with:
- **Docker setup**: Check Docker logs and this guide
- **API functionality**: See API_DOCUMENTATION.md
- **Dexter SDK**: Visit https://github.com/IndigoProtocol/dexter
