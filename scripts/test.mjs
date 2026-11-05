import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import handler from '../api/weather.js';

const originalFetch = globalThis.fetch;
const originalKey = process.env.WEATHER_API_KEY;
const key = 'test-key-never-public';
function response() {
  return { headers: {}, statusCode: 200,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}
async function invoke(method = 'GET') {
  const res = response();
  await handler({ method }, res);
  return res;
}
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }
try {
  delete process.env.WEATHER_API_KEY;
  const missing = await invoke();
  check('missing server key returns 503', () => {
    assert.equal(missing.statusCode, 503);
    assert.equal(missing.body.error.code, 1002);
  });
  process.env.WEATHER_API_KEY = key;
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    assert.equal(url.origin, 'https://api.weatherapi.com');
    assert.equal(url.pathname, '/v1/current.json');
    assert.equal(url.searchParams.get('key'), key);
    assert.equal(url.searchParams.get('lang'), 'ko');
    assert.equal(url.searchParams.get('q'), '33.4996,126.5312');
    return Response.json({ current: { temp_c: 16.5, humidity: 66, condition: { text: '가벼운 이슬비' }, last_updated: '2026-11-05 10:00', unused: key } });
  };
  const rejected = await invoke('POST');
  check('non-GET requests do not call provider', () => {
    assert.equal(rejected.statusCode, 405); assert.equal(calls, 0);
  });
  const success = await invoke();
  check('Jeju Korean response contains only requested fields', () => {
    assert.equal(success.statusCode, 200);
    assert.equal(success.body.current.temp_c, 16.5);
    assert.equal(success.body.current.condition.text, '가벼운 이슬비');
    assert.equal(success.headers['Cache-Control'], 'no-store');
    assert.ok(!JSON.stringify(success.body).includes(key));
  });
  globalThis.fetch = async () => Response.json({ error: { code: 2006, message: key } }, { status: 403 });
  const invalid = await invoke();
  check('provider error is sanitized', () => {
    assert.equal(invalid.statusCode, 502); assert.equal(invalid.body.error.code, 2006);
    assert.ok(!JSON.stringify(invalid.body).includes(key));
  });
  globalThis.fetch = async () => Response.json({ current: {} });
  const incomplete = await invoke();
  check('incomplete provider data returns 502', () => assert.equal(incomplete.statusCode, 502));
  globalThis.fetch = async () => { const error = Error('timeout'); error.name = 'TimeoutError'; throw error; };
  const timeout = await invoke();
  check('timeout returns 504', () => assert.equal(timeout.statusCode, 504));
  globalThis.fetch = async () => { throw Error(key); };
  const network = await invoke();
  check('network errors do not expose key', () => {
    assert.equal(network.statusCode, 502); assert.ok(!JSON.stringify(network.body).includes(key));
  });
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url)));
  check('Vercel serves public files and discovers root API function', () => {
    assert.equal(config.outputDirectory, 'public');
    assert.equal(config.framework, null);
    assert.ok(config.functions['api/weather.js']);
  });
  console.log(`${passed} checks passed.`);
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.WEATHER_API_KEY;
  else process.env.WEATHER_API_KEY = originalKey;
}
