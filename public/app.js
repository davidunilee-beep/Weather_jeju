'use strict';

const $ = (id) => document.getElementById(id);
const card = document.querySelector('.weather-card');
let loading = false;
let hasWeather = false;

function setStatus(message, error = false) {
  $('status').textContent = message;
  card.classList.toggle('error', error);
}

function formatUpdated(value) {
  // WeatherAPI's last_updated is already the location's local time (Asia/Seoul).
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})$/.exec(value);
  return match ? `${match[1]}.${match[2]}.${match[3]} · ${match[4]}` : value;
}

async function loadWeather() {
  if (loading) return;
  loading = true;
  card.setAttribute('aria-busy', 'true');
  card.classList.add('loading');
  $('refresh').disabled = true;
  $('badge').textContent = '불러오는 중';
  $('badge').classList.remove('live');
  setStatus('지금 제주의 날씨를 불러오고 있어요.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('/api/weather', { signal: controller.signal, cache: 'no-store' });
    let data;
    try { data = await response.json(); } catch { throw new Error('날씨 응답을 읽지 못했어요. 잠시 후 다시 시도해주세요.'); }
    if (!response.ok || data.error) {
      const code = data.error?.code;
      if ([1002, 2006, 2008].includes(code)) throw new Error('날씨 서비스 인증을 확인해주세요.');
      if (code === 2007) throw new Error('API 요청 한도를 초과했어요. WeatherAPI 사용량을 확인해주세요.');
      throw new Error('날씨를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    }
    const current = data.current;
    if (!current || !Number.isFinite(current.temp_c) || !Number.isFinite(current.humidity) || typeof current.condition?.text !== 'string' || !current.condition.text || typeof current.last_updated !== 'string' || !current.last_updated) {
      throw new Error('날씨 데이터가 완전하지 않아요. 다시 시도해주세요.');
    }
    $('temperature').textContent = String(current.temp_c);
    $('humidity').textContent = String(current.humidity);
    $('condition').textContent = current.condition.text;
    $('updated').textContent = formatUpdated(current.last_updated);
    $('badge').textContent = '현재 날씨';
    $('badge').classList.add('live');
    hasWeather = true;
    setStatus('제주의 현재 날씨를 불러왔어요.');
  } catch (error) {
    const message = error.name === 'AbortError' ? '연결 시간이 초과됐어요. 다시 시도해주세요.' : error instanceof TypeError ? '인터넷 연결을 확인하고 다시 시도해주세요.' : error.message;
    setStatus(`${message}${hasWeather ? ' 이전에 불러온 날씨를 표시하고 있어요.' : ''}`, true);
    $('badge').textContent = hasWeather ? '이전 데이터' : '연결 확인';
  } finally {
    clearTimeout(timeout);
    loading = false;
    card.setAttribute('aria-busy', 'false');
    card.classList.remove('loading');
    $('refresh').disabled = false;
  }
}

$('refresh').addEventListener('click', loadWeather);
loadWeather();
