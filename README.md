# Intelligenter – Reflectiz Developer Task

A Node.js + TypeScript REST API for domain intelligence analysis.  
The system queries **VirusTotal** and **Whois**, stores results in **PostgreSQL**, and refreshes results automatically with a **scheduler**.

## Project Structure
```
intelligenter/
├── src/
│   ├── index.ts           # Express server
│   ├── router.ts          # REST routes
│   ├── services/
│   │   ├── analyzer.ts    # Analysis logic
│   │   ├── virusTotal.ts  # VT integration
│   │   └── whois.ts       # Whois integration
│   ├── scheduler.ts       # Cron job
│   ├── db.ts              # Prisma client
│   └── util/
│       └── validate.ts    # Domain validation
├── prisma/
│   ├── schema.prisma      # DB schema
│   └── migrations/
├── docker-compose.yml
├── render.yaml
└── package.json
```

## System Architecture
![System Diagram](./dag.png)

## Database Schema

### Domain Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Domain name |
| status | String | READY/OnAnalysis/ERROR |
| lastScannedAt | DateTime | Last scan date |
| vtDetections | Int | Detection count |
| vtEngines | Int | Engines scanned |
| whoisOwner | String | Domain owner |
| whoisCreated | DateTime | Creation date |
| whoisExpire | DateTime | Expiration date |

### RequestLog Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| domain | String | Requested domain |
| method | String | HTTP Method |
| status | String | Request result |
| createdAt | DateTime | Log time |

## Installation & Setup

```bash
# Clone repository
git clone https://github.com/<your-repo>/intelligenter.git
cd intelligenter

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys:
# DATABASE_URL="postgresql://..."
# VIRUSTOTAL_API_KEY="..."
# WHOIS_API_KEY="..."

# Setup database
npx prisma generate
npx prisma migrate dev --name init

# Run server
npm run dev
```

## API Testing

```bash
# Analyze domain
curl -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -d '{"domain":"google.com"}'

# Get existing results
curl "http://localhost:3000/get?domain=google.com"

# Test malicious domain
curl -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -d '{"domain":"malware.wicar.org"}'

# Invalid domain
curl -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -d '{"domain":"not@valid"}'
```

## Expected Responses

### Clean Domain
```json
{
  "domain": "google.com",
  "VTData": {"detections": 0, "engines": 95},
  "WhoisData": {
    "owner": "google llc",
    "created": "1997-09-15T07:00:00.000Z",
    "expire": "2028-09-14T04:00:00.000Z"
  },
  "lastUpdated": "2025-10-22T16:01:55.630Z"
}
```

### Malicious Domain
```json
{
  "domain": "malware.wicar.org",
  "VTData": {"detections": 15, "engines": 95},
  "WhoisData": {"owner": null, "created": null, "expire": null},
  "lastUpdated": "2025-10-22T16:01:58.547Z"
}
```

### Invalid Domain
```json
{"error": "invalid domain"}
```

## Features

- **Automatic Scheduling**: Daily cron job at 03:00 to re-scan domains older than 30 days
- **Request Logging**: All GET/POST requests stored in database
- **Caching**: Results stored in PostgreSQL to avoid API rate limits
- **Validation**: Domain format validation before processing

## Deployment

The app is configured for Render deployment with:
- Automatic builds on git push
- PostgreSQL database integration
- Environment variable configuration

**Tech Stack**: TypeScript, Express, Prisma, PostgreSQL, Node-Cron

**Author**: Chaim Cymerman