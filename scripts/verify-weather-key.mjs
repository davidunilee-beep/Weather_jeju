import handler from '../api/weather.js';
import { loadWeatherKey } from './weather-key.mjs';

try {
  process.env.WEATHER_API_KEY = await loadWeatherKey({ keyFile: process.argv[2] || process.env.WEATHER_API_KEY_FILE });
  const response = {
    statusCode: 200,
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(body) {
      if (this.statusCode === 200) {
        console.log('새 인증키로 WeatherAPI 조회 성공 (HTTP 200)');
        console.log(JSON.stringify(body));
      } else {
        console.error(`날씨 조회 실패: HTTP ${this.statusCode}, 오류 코드 ${body.error?.code}`);
        process.exitCode = 1;
      }
      return this;
    }
  };
  await handler({ method: 'GET' }, response);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
