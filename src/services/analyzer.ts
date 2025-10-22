import { prisma } from "../db";
import { getVirusTotal } from "./virusTotal";
import { getWhois } from "./whois";

export async function analyzeDomain(domain: string) {
  console.log("Starting analysis for", domain);
  await prisma.domain.upsert({
    where: { name: domain },
    create: { name: domain, status: "ANALYZING" },
    update: { status: "ANALYZING" }
  });

  try {
    const [vt, who] = await Promise.all([
      getVirusTotal(domain).catch(err => {
        console.error("VirusTotal error:", err.message);
        return { detections: 0, engines: 0, enginesList: "" };
      }),
      getWhois(domain).catch(err => {
        console.error("Whois error:", err.message);
        return { owner: null, created: null, expire: null };
      }),
    ]);

    console.log("VirusTotal result:", vt);
    console.log("Whois result:", who);

    await prisma.domain.update({
      where: { name: domain },
      data: {
        status: "READY",
        lastScannedAt: new Date(),
        vtDetections: vt.detections,
        vtEngines: vt.engines,
        whoisOwner: who.owner,
        whoisCreated: who.created,
        whoisExpire: who.expire
      }
    });
  } catch (err) {
    console.error("Analyzer failed:", err);
    await prisma.domain.update({
      where: { name: domain },
      data: { status: "ERROR" }
    });
  }
}
