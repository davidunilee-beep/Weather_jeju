// Vercel Node.js Function. The API key is configured in Vercel, never in public/.
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: { code: 405, message: 'GET 요청만 지원합니다.' } });
  }

  const key = process.env.WEATHER_API_KEY?.trim();
  if (!key) {
    return response.status(503).json({ error: { code: 1002, message: '서버의 WEATHER_API_KEY 설정이 필요합니다.' } });
  }

  const url = new URL('https://api.weatherapi.com/v1/current.json');
  url.search = new URLSearchParams({ key, q: '33.4996,126.5312', lang: 'ko', aqi: 'no' }).toString();
  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
    const data = await upstream.json();
    if (!upstream.ok || data.error) {
      // Provider messages can contain request details, so forward only the code.
      return response.status(502).json({ error: { code: data.error?.code || 9999, message: '날씨 제공 서비스 요청에 실패했습니다.' } });
    }
    const current = data.current;
    if (!current || !Number.isFinite(current.temp_c) || !Number.isFinite(current.humidity) || typeof current.condition?.text !== 'string' || !current.condition.text || typeof current.last_updated !== 'string' || !current.last_updated) {
      return response.status(502).json({ error: { code: 9999, message: '날씨 응답 데이터가 완전하지 않습니다.' } });
    }
    return response.status(200).json({ current: {
      temp_c: current.temp_c,
      humidity: current.humidity,
      condition: { text: current.condition.text },
      last_updated: current.last_updated
    } });
  } catch (error) {
    const timedOut = ['TimeoutError', 'AbortError'].includes(error.name);
    return response.status(timedOut ? 504 : 502).json({ error: {
      code: 9999,
      message: timedOut ? '날씨 서비스 응답 시간이 초과되었습니다.' : '날씨 서비스에 연결하지 못했습니다.'
    } });
  }
}
