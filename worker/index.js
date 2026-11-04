export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
    if (path === '/api/weather') {
      if (!env.WEATHER_API_KEY) return Response.json({ error: { code: 1002 } }, { status: 503, headers });
      const url = new URL('https://api.weatherapi.com/v1/current.json');
      url.search = new URLSearchParams({ key: env.WEATHER_API_KEY, q: '33.4996,126.5312', lang: 'ko', aqi: 'no' });
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        const data = await response.json();
        if (!response.ok || data.error) return Response.json({ error: { code: data.error?.code || 9999 } }, { status: 502, headers });
        // Return only the fields used by the interface. Never forward provider diagnostics.
        const c = data.current;
        return Response.json({ current: { temp_c: c.temp_c, humidity: c.humidity, condition: { text: c.condition.text }, last_updated: c.last_updated } }, { headers });
      } catch {
        return Response.json({ error: { code: 9999 } }, { status: 502, headers });
      }
    }
    const asset = assets[path === '/index.html' ? '/' : path];
    if (!asset) return new Response('Not found', { status: 404 });
    return new Response(asset.body, { headers: { 'Content-Type': asset.type, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' } });
  }
};
