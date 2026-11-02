const dns = require("node:dns").promises;
const net = require("node:net");

const ALLOWED_ROOTS = ["amazon.in", "amazon.com", "flipkart.com"];

function isAllowedHost(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return ALLOWED_ROOTS.some(root => host === root || host.endsWith(`.${root}`));
}

function isPrivateIPv4(ip) {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  return p[0] === 10 || p[0] === 127 || p[0] === 0 ||
    (p[0] === 169 && p[1] === 254) ||
    (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) ||
    (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
    p[0] >= 224;
}

function isPrivateIPv6(ip) {
  const value = ip.toLowerCase();
  return value === "::1" || value === "::" || value.startsWith("fc") ||
    value.startsWith("fd") || value.startsWith("fe80:") ||
    value.startsWith("::ffff:127.") || value.startsWith("::ffff:10.") ||
    value.startsWith("::ffff:192.168.");
}

async function validateProductUrl(input, { resolveDns = true } = {}) {
  if (typeof input !== "string" || input.length > 2048) {
    throw new Error("Product URL is required and must be under 2048 characters.");
  }

  let parsed;
  try { parsed = new URL(input.trim()); }
  catch { throw new Error("Please provide a valid product URL."); }

  if (parsed.protocol !== "https:") throw new Error("Only HTTPS product URLs are accepted.");
  if (parsed.username || parsed.password) throw new Error("URLs containing credentials are not allowed.");
  if (parsed.port && parsed.port !== "443") throw new Error("Non-standard URL ports are not allowed.");
  if (!isAllowedHost(parsed.hostname)) {
    throw new Error("Only Amazon.in, Amazon.com and Flipkart product URLs are supported.");
  }

  parsed.hash = "";
  if (resolveDns) {
    const records = await dns.lookup(parsed.hostname, { all: true, verbatim: true });
    if (!records.length || records.some(record =>
      (net.isIPv4(record.address) && isPrivateIPv4(record.address)) ||
      (net.isIPv6(record.address) && isPrivateIPv6(record.address))
    )) {
      throw new Error("The product URL resolves to a restricted network address.");
    }
  }
  return parsed.toString();
}

async function assertSafeNavigation(url) {
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error("Invalid navigation URL."); }
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Blocked non-web navigation.");
  if (parsed.username || parsed.password) throw new Error("Blocked URL credentials.");
  if (!isAllowedHost(parsed.hostname)) throw new Error("Blocked redirect to an unsupported host.");
  await validateProductUrl(parsed.toString());
}

module.exports = { validateProductUrl, assertSafeNavigation, isAllowedHost };
