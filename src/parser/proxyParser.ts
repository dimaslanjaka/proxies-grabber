/**
 * Extracts proxies from a string, supporting multiple formats (IP:PORT, IP:PORT:USER:PASS, IP PORT, JSON, etc).
 * Returns a unique list of Proxy-like objects, prioritizing those with credentials.
 */
export function extractProxies(input?: string): Array<{ proxy: string; username?: string; password?: string }> {
  if (!input || !input.trim()) return [];

  const results: Array<{ proxy: string; username?: string; password?: string }> = [];

  // Regex patterns
  const pattern1 = /((?:(?:\d{1,3}\.){3}\d{1,3}):\d{2,5}(?:@\w+:\w+)?|(?:\w+:\w+@\d{1,3}(?:\.\d{1,3}){3}:\d{2,5}))/g;
  const pattern2 = /((?!0)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+((?!0)\d{2,5})/g;
  const pattern3 = /"ip":"((?!0)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})".*?"port":"((?!0)\d{2,5})/g;

  // Find matches
  const matches1 = Array.from(input.matchAll(pattern1)).map((m) => m[0]);
  const matches2 = Array.from(input.matchAll(pattern2)).map((m) => `${m[1]}:${m[2]}`);
  const matches3 = Array.from(input.matchAll(pattern3)).map((m) => `${m[1]}:${m[2]}`);

  const matches = [...matches1, ...matches2, ...matches3];

  for (const match of matches) {
    if (/^(\d{1,3}\.){3}\d{1,3}:\d{2,5}:[^:]+:[^:]+$/.test(match)) {
      // IP:PORT:USER:PASS
      const [ip, port, username, password] = match.split(':');
      results.push({ proxy: `${ip}:${port}`, username, password });
    } else if (match.includes('@')) {
      // user:pass@ip:port or ip:port@user:pass
      let proxy = match;
      let username, password;
      if (/^\w+:\w+@/.test(match)) {
        // user:pass@ip:port
        [username, password] = match.split('@')[0].split(':');
        proxy = match.split('@')[1];
      } else if (/@\w+:\w+$/.test(match)) {
        // ip:port@user:pass
        proxy = match.split('@')[0];
        [username, password] = match.split('@')[1].split(':');
      }
      results.push({ proxy, username, password });
    } else {
      results.push({ proxy: match });
    }
  }

  // Unique by proxy, prefer with credentials
  const unique: Record<string, { proxy: string; username?: string; password?: string }> = {};
  for (const p of results) {
    if (unique[p.proxy]) {
      if ((p.username || p.password) && !(unique[p.proxy].username || unique[p.proxy].password)) {
        unique[p.proxy] = p;
      }
    } else {
      unique[p.proxy] = p;
    }
  }
  return Object.values(unique);
}
