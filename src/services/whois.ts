import axios from "axios";

export async function getWhois(domain: string) {
  const key = process.env.WHOIS_API_KEY;
  if (!key) throw new Error("Missing WHOIS key");

  try {
    const res = await axios.get(`https://api.api-ninjas.com/v1/whois?domain=${domain}`, {
      headers: { "X-Api-Key": key },
      timeout: 10000,
    });

    const d = res.data || {};
    const created = Array.isArray(d.creation_date) ? d.creation_date[0] * 1000 : d.creation_date * 1000;
    const expire = Array.isArray(d.expiration_date) ? d.expiration_date[0] * 1000 : d.expiration_date * 1000;

    return {
      owner: d.org || d.registrar || null,
      created: created ? new Date(created) : null,
      expire: expire ? new Date(expire) : null,
    };
  } catch (err: any) {
    console.error("WHOIS fetch failed:", err.response?.status || err.message);
    return { owner: null, created: null, expire: null };
  }
}
