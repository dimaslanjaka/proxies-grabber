import axios from 'axios';
import HttpsProxyAgent from 'https-proxy-agent';

export default async function axiosTest(url = 'https://proxydb.net/anon', prx: string[]) {
  const options = [
    {
      proxy: {
        host: prx[0],
        port: parseInt(prx[1]),
        protocol: 'http',
      },
    },
    {
      proxy: {
        host: prx[0],
        port: parseInt(prx[1]),
        protocol: 'https',
      },
    },
    {
      proxy: false,
      httpsAgent: HttpsProxyAgent('http://' + prx[0] + ':' + prx[1]),
    },
  ];
  for (let i = 0; i < options.length; i++) {
    const opt = options[i];

    try {
      const response = await axios.get(
        url,
        Object.assign(<any>opt, {
          timeout: 60 * 1000,
        }),
      );
      if (response.status === 200) {
        const result = Object.assign(
          {
            withOpt: opt.proxy,
          },
          response,
        );
        return result;
      }
    } catch (e) {
      if (e instanceof Error)
        console.log([...prx, typeof opt.proxy == 'object' ? opt.proxy.protocol : 'httpsAgent'], e.message);
    }
  }
}
