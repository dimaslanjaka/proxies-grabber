import express from 'express';
import axiosTest from './axios';

const app = express();

app.get('/', async (_, res) => {
  const px = ['188.166.222.236:3128', '110.235.250.155:8080'].map((s) => s.split(':'));
  for (let indx = 0; indx < px.length; indx++) {
    const prx = px[indx];
    const testAxios = await axiosTest('https://httpbin.org/get', prx);
    if (testAxios) return res.send(testAxios.data);
  }
  if (!res.headersSent) res.end('proxies not resolved');
});
app.listen(4000, () => {
  console.log('proxy tunnel on http://localhost:4000');
});
