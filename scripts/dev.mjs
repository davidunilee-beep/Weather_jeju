import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import handler from '../api/weather.js';
import { loadWeatherKey } from './weather-key.mjs';
const configuredKey = process.env.WEATHER_API_KEY;
await loadWeatherKey({ key: configuredKey });
const files = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8']
};
createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://127.0.0.1:5173').pathname;
    if (path === '/api/weather') {
      // Re-read the local file for every request so key rotation needs no restart.
      process.env.WEATHER_API_KEY = await loadWeatherKey({ key: configuredKey });
      const response = {
        statusCode: 200,
        setHeader(name, value) { res.setHeader(name, value); },
        status(code) { this.statusCode = code; return this; },
        json(body) {
          res.writeHead(this.statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(body));
          return this;
        }
      };
      await handler(req, response);
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
    const file = files[path];
    if (!file) { res.writeHead(404); res.end('Not found'); return; }
    const body = await readFile(new URL('../public/' + file[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': file[1] });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ error: { code: 1002, message: '로컬 인증키 파일을 확인해주세요.' } }));
  }
}).listen(5173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:5173'));
