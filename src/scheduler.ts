import cron from "node-cron";
import { prisma } from "./db";
import { analyzeDomain } from "./services/analyzer";

export function initScheduler() {
  cron.schedule("0 3 * * *", async () => {
    const monthAgo = new Date(Date.now() - 30*24*60*60*1000);
    const outdated = await prisma.domain.findMany({
      where: { OR: [{ lastScannedAt: null }, { lastScannedAt: { lt: monthAgo } }] }
    });
    for (const d of outdated) analyzeDomain(d.name);
  });
}
