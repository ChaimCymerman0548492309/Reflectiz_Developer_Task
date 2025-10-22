import axios from "axios";

export async function getVirusTotal(domain: string) {
  const key = process.env.VIRUSTOTAL_API_KEY;
  if (!key) throw new Error("Missing VirusTotal key");

  const url = `https://www.virustotal.com/api/v3/domains/${domain}`;
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
}
