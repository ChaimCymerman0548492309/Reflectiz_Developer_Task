```markdown
# 🧠 Intelligenter – Reflectiz Developer Task

A Node.js + TypeScript REST API for domain intelligence analysis.  
The system queries **VirusTotal** and **Whois**, stores results in a **PostgreSQL (Neon)** database, and refreshes results automatically with a **scheduler (cron job)**.

---

## 📁 Project Structure
```text
intelligenter/
├── src/
│   ├── index.ts           # Express server entry
│   ├── router.ts          # REST routes (GET / POST)
│   ├── services/
│   │   ├── analyzer.ts    # Main analysis logic
│   │   ├── virusTotal.ts  # VirusTotal integration
│   │   └── whois.ts       # Whois integration
│   ├── scheduler.ts       # Monthly re-analysis cron
│   ├── db.ts              # Prisma client
│   └── util/
│       └── validate.ts    # Domain validation
├── prisma/
│   ├── schema.prisma      # DB schema
│   └── migrations/        # Prisma migrations
├── docker-compose.yml     # Optional local DB setup
├── render.yaml            # Deployment config
├── package.json
├── tsconfig.json
├── README.md
└── dag.png                # System architecture diagram


---


## 🧩 System Architecture
<p align="center">
  <img src="./dag.png" width="600" alt="System Architecture Diagram">
</p>

---

## 🧱 Database Schema

### `Domain` Table
| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Domain name |
| status | String | READY / OnAnalysis / ERROR |
| lastScannedAt | DateTime | Last scan date |
| vtDetections | Int | Number of detections |
| vtEngines | Int | Number of engines scanned |
| whoisOwner | String | Domain owner |
| whoisCreated | DateTime | Creation date |
| whoisExpire | DateTime | Expiration date |

### `RequestLog` Table
| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| domain | String | Requested domain |
| method | String | HTTP Method (GET/POST) |
| status | String | Request result |
| createdAt | DateTime | Log time |

---

## ⚙️ Installation & Setup

```bash
# 1️⃣ Clone the repository
git clone https://github.com/<your-repo>/intelligenter.git
cd intelligenter

# 2️⃣ Install dependencies
npm install

# 3️⃣ Configure environment
cp  .env
# Edit .env with your own keys:
# DATABASE_URL="postgresql://..."
# VIRUSTOTAL_API_KEY="..."
# WHOIS_API_KEY="..."
# PORT=3000

# 4️⃣ Generate Prisma client
npx prisma generate

# 5️⃣ Run initial DB migration (creates tables)
npx prisma migrate dev --name init

# 6️⃣ Run server (dev mode)
npm run dev
````

---

## 🧪 Test Commands

```bash
# Normal domain
curl -X POST http://localhost:3000/post -H "Content-Type: application/json" -d '{"domain":"google.com"}'

# Existing result
curl "http://localhost:3000/get?domain=google.com"

# Fake domain (nonexistent)
curl -X POST http://localhost:3000/post -H "Content-Type: application/json" -d '{"domain":"noexistingsiteevil.biz"}'

# Known malicious domain
curl -X POST http://localhost:3000/post -H "Content-Type: application/json" -d '{"domain":"malware.wicar.org"}'

# Invalid domain
curl -X POST http://localhost:3000/post -H "Content-Type: application/json" -d '{"domain":"not@valid"}'

# Existing malicious result
curl "http://localhost:3000/get?domain=malware.wicar.org"
```

---

## 🔍 Expected Responses

### ✅ Clean Domain

```json
{
  "domain": "google.com",
  "VTData": { "detections": 0, "engines": 95 },
  "WhoisData": {
    "owner": "google llc",
    "created": "1997-09-15T07:00:00.000Z",
    "expire": "2028-09-14T04:00:00.000Z"
  },
  "lastUpdated": "2025-10-22T16:01:55.630Z"
}
```

### ⚠️ Malicious Domain

```json
{
  "domain": "malware.wicar.org",
  "VTData": {
    "detections": 15,
    "engines": 95
  },
  "WhoisData": {
    "owner": null,
    "created": null,
    "expire": null
  },
  "lastUpdated": "2025-10-22T16:01:58.547Z"
}
```

### ❌ Invalid Domain

```json
{"error": "invalid domain"}
```

---

## 🕒 Scheduler

A cron job runs daily at 03:00 to re-scan any domains not updated in 30 days:

```ts
cron.schedule("0 3 * * *", ...)
```

---

## 🧾 Logs

Every request (GET / POST) is stored in the `RequestLog` table:

| Domain     | Method | Status     | CreatedAt            |
| ---------- | ------ | ---------- | -------------------- |
| google.com | POST   | OnAnalysis | 2025-10-22T16:00:00Z |

---

## 🚀 Deployment (Render)

The app auto-builds with:

```yaml
# render.yaml
services:
  - type: web
    name: intelligenter
    env: node
    plan: free
    buildCommand: npm install && npm run build && npx prisma generate
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: VIRUSTOTAL_API_KEY
        sync: false
      - key: WHOIS_API_KEY
        sync: false
```

---

**Author:** Chaim Cymerman
**Language:** TypeScript
**Frameworks:** Express, Prisma, Node-Cron
**Database:** PostgreSQL (Neon)

```
```
