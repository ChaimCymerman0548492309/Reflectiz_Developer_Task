import axios from "axios";

export async function getVirusTotal(domain: string) {
  const key = process.env.VIRUSTOTAL_API_KEY;
  if (!key) throw new Error("Missing VirusTotal key");

  const url = `https://www.virustotal.com/api/v3/domains/${domain}`;

  // פונקציה פנימית ל־retry עם backoff
  async function fetchWithRetry(attempt = 1): Promise<any> {
    try {
      const res = await axios.get(url, { headers: { "x-apikey": key } });
      const attrs = res.data?.data?.attributes || {};
      const stats = attrs.last_analysis_stats || {};
      const results = attrs.last_analysis_results || {};

      const malicious = Object.entries(results)
        .filter(([, v]: any) => v.category === "malicious" || v.category === "suspicious")
        .map(([engine]) => engine);

      return {
        detections: (stats.malicious ?? 0) + (stats.suspicious ?? 0),
        engines: Object.keys(results).length,
        enginesList: malicious.join(", "),
      };
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 429 && attempt <= 3) {
        const delay = 2000 * attempt; // 2s, 4s, 6s...
        console.warn(`VirusTotal rate limit hit, retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        return fetchWithRetry(attempt + 1);
      }
      console.error("VirusTotal error:", status || err.message);
      return { detections: 0, engines: 0, enginesList: "ERROR_OR_RATE_LIMITED" };
    }
  }

  return fetchWithRetry();
}
