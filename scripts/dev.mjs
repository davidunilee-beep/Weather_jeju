import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import '../scripts/build.mjs';
const { default: worker } = await import('../dist/server/index.js');
let key = process.env.WEATHER_API_KEY;
if (!key) {
  const text = await readFile(process.env.WEATHER_API_KEY_FILE || 'C:/Users/admin/Desktop/날씨 api 인증키.txt', 'utf8');
  key = text.match(/[a-fA-F0-9]{25,40}/)?.[0];
}
if (!key) throw new Error('WEATHER_API_KEY 또는 WEATHER_API_KEY_FILE을 설정해주세요.');
createServer(async (req, res) => {
  try {
    const response = await worker.fetch(new Request(new URL(req.url, 'http://127.0.0.1:5173'), { method: req.method }), { WEATHER_API_KEY: key });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end('Internal server error'); }
}).listen(5173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:5173'));
