import axios from 'axios';
import net from 'net';

const Socket = net.Socket;

// nodejs - error self signed certificate in certificate chain
// https://stackoverflow.com/a/73110972/6404439
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;

/**
 * Fetches the device public IP address of the client by trying multiple services.
 *
 * @returns A promise that resolves to the public IP address as a string.
 * @throws Throws an error if none of the services return a valid IP address.
 */
export async function getPublicIP(): Promise<string> {
  const urls = ['https://api.ipify.org?format=json', 'https://ifconfig.me/all.json', 'https://ipinfo.io/json'];

  for (const url of urls) {
    try {
      const response = await axios.get(url);
      let ip: string | undefined;

      // Determine which field contains the IP address based on the URL
      switch (url) {
        case 'https://api.ipify.org?format=json':
          ip = response.data.ip;
          break;
        case 'https://ifconfig.me/all.json':
          ip = response.data.ip_addr;
          break;
        case 'https://ipinfo.io/json':
          ip = response.data.ip;
          break;
        default:
          continue; // Skip unknown URLs
      }

      // Validate IP address format
      if (!ip) {
        throw new Error(`No IP address found in response from ${url}`);
      }
      if (isValidIp(ip)) {
        return ip;
      }
    } catch (error) {
      console.error(`Error fetching IP address from ${url}:`, error);
      // Continue to the next URL if there is an error
    }
  }

  throw new Error('Unable to fetch a valid public IP address from any of the services.');
}

/**
 * Validates if the given IP address is in a valid format.
 * @param ip The IP address to validate.
 * @returns True if the IP address is valid, otherwise false.
 */
export function isValidIp(ip: string) {
  const ipPattern =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipPattern.test(ip);
}

/**
 * Validates if the given port number is a valid integer within the valid range.
 *
 * @param port The port number to validate, can be a number or a string.
 * @returns Returns true if the port is valid, otherwise false.
 */
export function isValidPort(port: string | number) {
  const parsedPort = Number(port); // Parse the input as a number

  // Check if the parsed value is NaN or out of range
  return !isNaN(parsedPort) && parsedPort >= 0 && parsedPort <= 65535;
}

/**
 * Validates a proxy string.
 *
 * @param proxy The proxy string to validate.
 * @param validateCredential Whether to validate credentials if present.
 * @returns True if the proxy is valid, False otherwise.
 */
export function isValidProxy(proxy: string, validateCredential = false): boolean {
  if (!proxy) {
    return false;
  }

  // Handle credentials if present
  const hasCredential = proxy.includes('@');
  if (hasCredential) {
    try {
      const [proxyPart, credential] = proxy.trim().split('@', 2);
      proxy = proxyPart;

      const [username, password] = credential.trim().split(':');
      if (validateCredential && (!username || !password)) {
        return false;
      }
    } catch (_err) {
      return false; // Invalid credentials format
    }
  }

  // Extract IP address and port
  const parts = proxy.trim().split(':', 2);
  if (parts.length !== 2) {
    return false;
  }

  const [ip, port] = parts;

  // Validate IP address (using provided function)
  if (!isValidIp(ip) || !isValidPort(port)) return false;

  // Validate port number
  const portInt = parseInt(port, 10);
  if (isNaN(portInt) || portInt < 1 || portInt > 65535) {
    return false;
  }

  // Check if the proxy string length is appropriate (if applicable)
  const proxyLength = proxy.length;
  if (proxyLength < 7 || proxyLength > 21) {
    // Adjust based on valid range
    return false;
  }

  return true;
}

export class CheckerResult {
  result = false;
  https = false;
  /**
   * Error message if any.
   */
  error: string | null = null;
  /**
   *
   * @param result Indicates if the check was successful.
   * @param https Indicates if the proxy supports HTTPS.
   * @param error Error message if any.
   */
  constructor(result: boolean, https: boolean, error: string | null = null) {
    this.result = result;
    this.https = https;
    this.error = error;
  }
}

/**
 * Checks if a given IP address and port are open.
 *
 * @param proxy The IP:PORT combination to check (e.g., '192.168.1.1:80').
 * @param timeout The timeout in milliseconds before failing the connection.
 * @returns A promise that resolves to true if the port is open, otherwise false.
 */
export function isPortOpen(proxy: string, timeout = 60 * 1000) {
  const [ip, portStr] = proxy.split(':');
  const port = Number(portStr);
  if (!isValidPort(port)) return false;

  return new Promise((resolve) => {
    const socket = new Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      // console.log(proxy, "port open");
      socket.destroy();
      resolve(true); // Port is open
    });

    socket.on('timeout', () => {
      // console.log(proxy, "open port checker failed [timeout]");
      socket.destroy();
      resolve(false); // Timeout reached
    });

    socket.on('error', () => {
      // console.log(proxy, "port closed");
      resolve(false); // Error occurred (port is closed)
    });

    socket.connect(port, ip);
  });
}

export default { CheckerResult, getPublicIP, isValidIp, isValidProxy, isPortOpen };
