# 지금 제주 날씨는?

HTML, CSS, JavaScript로 만든 제주 현재 날씨 앱입니다. 화면을 열면 자동 조회하고, 새로고침 버튼으로 다시 요청합니다. 제주시 좌표(33.4996,126.5312)의 기온, 습도, 한국어 날씨, 데이터 업데이트 시각을 표시합니다.

## 실행

Node.js 22 이상에서 별도 설치 없이 `npm start`를 실행하고 http://127.0.0.1:5173 에 접속하세요.

기본적으로 사용자가 지정한 C:/Users/admin/Desktop/날씨 api 인증키.txt에서 키를 읽습니다. 다른 환경에서는 WEATHER_API_KEY 또는 WEATHER_API_KEY_FILE 환경변수를 설정하세요. 키는 브라우저 응답과 소스에 포함하지 않습니다.

## 배포

`npm run build`로 Worker용 dist/server/index.js를 생성합니다. 배포 환경에서는 비밀 환경변수 WEATHER_API_KEY를 설정하세요.

공식 문서: https://www.weatherapi.com/docs/
