```markdown
# 🧠 Intelligenter

Intelligenter is a Node.js + TypeScript backend that analyzes domains using **VirusTotal** and **WHOIS** APIs, storing results in a **PostgreSQL** database via **Prisma ORM**.  
It provides two main API endpoints for analysis and retrieval.

---

## 📁 Project Structure
```

intelligenter/
├── prisma/
│ └── schema.prisma # Prisma schema (database models)
├── src/
│ ├── index.ts # Express app entry point
│ ├── routes.ts # API routes
│ ├── scheduler.ts # Cron-based automatic rescanning
│ ├── queue.ts # (optional) background queue logic
│ ├── services/
│ │ ├── analyzer.ts # Main analysis logic
│ │ ├── virusTotal.ts # VirusTotal integration
│ │ ├── whois.ts # WHOIS integration
│ │ └── db.ts # Prisma client
│ ├── util/
│ │ └── validate.ts # Domain validation
│ └── types.ts # Shared types
├── .env # Environment variables
├── package.json
├── tsconfig.json
├── docker-compose.yml
└── README.md

````

---

## 🧩 Data Flow

1. User sends `/post` or `/get` request with a domain.
2. The API validates the domain.
3. If domain data is missing or outdated:
   - `analyzer.ts` runs `getVirusTotal()` and `getWhois()`.
   - Results are stored in the database.
4. The `/get` endpoint returns either:
   - `"OnAnalysis"` if still processing.
   - Or full results (VT + WHOIS) once ready.
5. A daily cron job rescans old domains automatically.

---

## 🗄️ Prisma Schema

```prisma
model Domain {
  id            String   @id @default(cuid())
  name          String   @unique
  status        String
  lastScannedAt DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  vtDetections  Int?
  vtEngines     Int?
  whoisOwner    String?
  whoisCreated  DateTime?
  whoisExpire   DateTime?
}
````

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/intelligenter.git
cd intelligenter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require"
VIRUSTOTAL_API_KEY="your_vt_key"
WHOIS_API_KEY="your_whois_key"
PORT=3000
```

### 4. Initialize Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run development server

With hot reload:

```bash
npm run dev
```

Without hot reload:

```bash
npm start
```

### 6. Build for production

```bash
npm run build
npm run start
```

---

## 🧪 Test API

### Analyze a domain

```bash
curl -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -d '{"domain":"google.com"}'
```

### Retrieve results

```bash
curl "http://localhost:3000/get?domain=google.com"
```

---

## 🐳 Docker (optional)

Build and run containers:

```bash
docker-compose up --build
```

---

## 🕒 Scheduler

`node-cron` runs every day at 03:00 to re-analyze old or unscanned domains.

---

## ✅ Summary

- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **External APIs:** VirusTotal, WHOIS (API Ninjas)
- **Automation:** Cron-based daily refresh
- **Deployment:** Docker or Node.js standalone

```

```
