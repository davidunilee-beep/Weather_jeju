import { readFile } from 'node:fs/promises';

export const defaultKeyFile = 'C:/Users/admin/Desktop/날씨 api 인증키.txt';

export async function loadWeatherKey({
  key = process.env.WEATHER_API_KEY,
  keyFile = process.env.WEATHER_API_KEY_FILE || defaultKeyFile
} = {}) {
  if (key?.trim()) return key.trim();
  let text;
  try {
    text = await readFile(keyFile, 'utf8');
  } catch {
    throw new Error('인증키 파일을 읽지 못했습니다. WEATHER_API_KEY_FILE 경로를 확인해주세요.');
  }
  // Accept longer replacement keys instead of silently truncating them.
  const candidates = [...new Set(text.match(/(?<![a-z0-9_-])[a-z0-9_-]{20,128}(?![a-z0-9_-])/gi) || [])];
  if (candidates.length !== 1) {
    throw new Error('인증키 파일에는 현재 사용할 WeatherAPI 키 한 개만 남겨주세요.');
  }
  return candidates[0];
}
