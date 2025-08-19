export type returnObj = {
  /**
   * IP:PORT
   */
  proxy: string;
  /**
   * Country Code
   */
  code: string;
  /**
   * Anonymity
   * * A: Anonymous
   * * H: High Anonymous / Elite Proxy
   * * N: Transparent
   */
  anonymity: string | 'A' | 'N' | 'H';
  /**
   * Can access SSL/HTTPS?
   */
  ssl: boolean;
  /**
   * Can access google?
   */
  google: boolean;
  /**
   * Has cloudflare alert?
   */
  alert: boolean;
  /**
   * Proxy Type
   */
  type: string | 'http' | 'socks4' | 'socks5';
  /**
   * Test Result
   */
  test: string | 'PASSED' | 'FAILED';
};

/**
 * Parse data from spys
 * @param data
 * @returns
 */
function parse(data: string) {
  const result: Partial<returnObj>[] = data
    .split('\n')
    .map((s) => (typeof s == 'string' ? s.trim() : s))
    .filter((str) => {
      if (typeof str !== 'string' || !str.match(/^\d/)) {
        return false;
      }
      return true;
    })
    .map((str) => {
      //IP address:Port CountryCode-Anonymity(Noa/Anm/Hia)-SSL_support(S)-Google_passed(+)
      const buildObject: Partial<returnObj> = {
        proxy: undefined,
        code: undefined,
        anonymity: undefined,
        ssl: undefined,
        google: undefined,
        alert: undefined,
        type: 'http',
        test: undefined
      };
      // [ '79.104.25.218:8080', 'RU-H-S', '-' ]
      const parse = str.split(/\s/);
      buildObject.proxy = parse[0];
      // Defensive: check parse[1] exists
      if (typeof parse[1] === 'string') {
        if (parse[1].includes('!')) {
          buildObject.alert = true;
          parse[1] = parse[1].replace('!', '');
        } else {
          buildObject.alert = false;
        }
        const ctr = parse[1].split('-');
        buildObject.code = ctr[0];
        buildObject.anonymity = ctr[1];
        // if contains `S` is SSL
        if (typeof ctr[2] == 'string') buildObject.ssl = true;
      } else {
        buildObject.alert = false;
        buildObject.code = undefined;
        buildObject.anonymity = undefined;
        buildObject.ssl = false;
      }
      // Defensive: check parse[2] exists
      if (typeof parse[2] === 'string') {
        buildObject.google = parse[2] == '+';
      } else {
        buildObject.google = false;
      }
      return buildObject;
    });
  return result;
}

export default parse;
export const parser = parse;
