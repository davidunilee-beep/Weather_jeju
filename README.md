# 지금 제주 날씨는?

HTML, CSS, JavaScript로 만든 제주 현재 날씨 앱입니다. 화면을 열면 자동 조회하고, 새로고침 버튼으로 다시 요청합니다. 제주시 좌표(33.4996,126.5312)의 기온, 습도, 한국어 날씨, 데이터 업데이트 시각을 표시합니다.

## 실행

Node.js 22 이상에서 별도 설치 없이 `npm start`를 실행하고 http://127.0.0.1:5173 에 접속하세요.

기본적으로 사용자가 지정한 C:/Users/admin/Desktop/날씨 api 인증키.txt에서 키를 읽습니다. 다른 환경에서는 WEATHER_API_KEY 또는 WEATHER_API_KEY_FILE 환경변수를 설정하세요. 키는 브라우저 응답과 소스에 포함하지 않습니다.

## 배포

### Vercel

`api/weather.js`는 Vercel용 Node.js 서버 함수입니다. `vercel.json`이 화면 출력 경로를 `public`으로 설정하고, Vercel 배포 시 Worker 전용 빌드 대신 API 문법 검사를 실행합니다.

1. Vercel에서 `davidunilee-beep/Weather_jeju` 저장소를 연결하고 Production Branch를 `main`으로 지정합니다.
2. Root Directory는 저장소 루트(비워 두기 또는 `.`)로 지정합니다. `public`이나 로컬 상위 폴더명 `jeju-weather`를 입력하지 않습니다.
3. Settings → Environment Variables에서 `WEATHER_API_KEY`를 Production에 추가합니다. 값은 WeatherAPI에서 발급한 실제 키입니다. 키를 GitHub에 커밋하지 않습니다.
4. 최신 `main` 커밋을 배포합니다. 환경변수 변경 후에도 새 배포가 필요합니다.
5. `https://weatherjeju-smoky.vercel.app/api/weather`가 HTTP 200과 `current` JSON을 반환하는지 확인합니다.

`node scripts/test.mjs` 또는 npm을 사용할 수 있는 환경에서는 `npm test`로 8개 서버 검사를 실행합니다. 상세 절차는 `docs/vercel-guide.html`을 브라우저에서 열어 확인하세요.

### Sites

`node scripts/build.mjs` 또는 `npm run build`로 Worker용 `dist/server/index.js`를 생성합니다. 기존 Sites 배포용 경로는 유지합니다. Sites의 비밀 환경변수와 Vercel의 환경변수는 별개입니다.

공식 문서: https://www.weatherapi.com/docs/
