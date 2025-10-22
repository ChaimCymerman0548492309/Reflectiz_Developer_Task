import { Router } from "express";
import { prisma } from "./db";
import { analyzeDomain } from "./services/analyzer";
import { isValidDomain } from "./util/validate";

export const router = Router();

// === GET /get ===
router.get("/get", async (req, res) => {
  const domain = String(req.query.domain || "").toLowerCase();
  if (!isValidDomain(domain)) {
    await prisma.requestLog.create({
      data: { domain, method: "GET", status: "INVALID" },
    });
    return res.status(400).json({ error: "invalid domain" });
  }

  const d = await prisma.domain.findUnique({ where: { name: domain } });

  if (!d || d.status !== "READY") {
    analyzeDomain(domain); // async fire-and-forget
    await prisma.requestLog.create({
      data: { domain, method: "GET", status: "OnAnalysis" },
    });
    return res.json({ domain, status: "OnAnalysis" });
  }

  await prisma.requestLog.create({
    data: { domain, method: "GET", status: "READY" },
  });

  res.json({
    domain,
    VTData: {
      detections: d.vtDetections,
      engines: d.vtEngines,
    },
    WhoisData: {
      owner: d.whoisOwner,
      created: d.whoisCreated,
      expire: d.whoisExpire,
    },
    lastUpdated: d.lastScannedAt,
  });
});

// === POST /post ===
router.post("/post", async (req, res) => {
  const domain = String(req.body?.domain || "").toLowerCase();
  if (!isValidDomain(domain)) {
    await prisma.requestLog.create({
      data: { domain, method: "POST", status: "INVALID" },
    });
    return res.status(400).json({ error: "invalid domain" });
  }

  analyzeDomain(domain);

  await prisma.requestLog.create({
    data: { domain, method: "POST", status: "OnAnalysis" },
  });

  res.json({ domain, status: "OnAnalysis" });
});
