# 배포 & 키 등록 (Netlify)

방문자가 **API 키 입력 없이 링크만으로** 앱을 쓰게 하려면, 키를 브라우저가 아니라 **Netlify 서버(환경변수)** 에 둡니다. 서버리스 프록시(`/api/gemini`, `/api/youtube`)가 대신 Google을 호출하므로 키는 브라우저·깃헙 어디에도 노출되지 않습니다.

```
방문자 브라우저  →  /api/gemini · /api/youtube  →  Google
                    (키는 Netlify 서버 환경변수에만 존재)
```

## 동작 우선순위 (3단 폴백)

앱은 다음 순서로 동작합니다:

1. **사용자가 ⚙️에 개인 키 입력** → 그 키로 브라우저에서 Google 직접 호출
2. **키 없음 + 서버 환경변수 설정됨** → 프록시가 서버 키로 호출 (← 방문자용 "키 없이 실행")
3. **둘 다 없음/실패** → 데모 모드(시간대 무드 + 데모 트랙)

## 1. 키 발급

| 키 | 발급처 |
|---|---|
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| `YOUTUBE_API_KEY` | https://console.cloud.google.com → YouTube Data API v3 활성화 후 API 키 |

## 2. Netlify에 환경변수 등록 (실제 키는 여기에만!)

Netlify 사이트 대시보드에서:

1. **Site configuration → Environment variables → Add a variable**
2. 아래 두 개를 추가 (값은 실제 키):
   - `GEMINI_API_KEY` = `발급받은 Gemini 키`
   - `YOUTUBE_API_KEY` = `발급받은 YouTube 키`
3. **Deploys → Trigger deploy → Deploy site** 로 재배포 (환경변수는 새 배포부터 적용)

> 🔒 실제 키를 `.env`, 코드, 깃헙에 **절대 넣지 마세요.** 저장소에는 `.env.example`(빈 템플릿)만 커밋됩니다. `.env`는 `.gitignore`로 제외돼 있습니다.

## 3. 키 남용 방지 (권장)

프록시는 공개 URL이라 이론상 누구나 호출할 수 있습니다. 다음으로 방어하세요:

- **프록시 자체**: `netlify/functions/*.js`가 요청 출처(origin/referer)가 사이트 자신일 때만 처리하도록 이미 검사합니다. (다른 웹사이트의 도용 차단)
- **YouTube 키**: Google Cloud Console에서 **API 제한 → YouTube Data API v3 만 허용**. 일 쿼터 기본 10,000 units.
- **Gemini 키**: 무료 티어 rate limit 내 사용. 유료 전환 시 **예산 알림(Budget alert)** 을 걸어두세요.
- 필요하면 Netlify 함수에 간단한 rate-limit(IP·시간당 횟수)을 추가할 수 있습니다.

## 4. 로컬에서 프록시까지 테스트하려면

정적 서버(`python3 -m http.server`)로는 `/api/*` 함수가 뜨지 않습니다. Netlify CLI를 쓰세요:

```bash
npm i -g netlify-cli
# 저장소 루트에 .env 파일 생성 후 실제 키 입력 (이 파일은 커밋되지 않음)
#   GEMINI_API_KEY=...
#   YOUTUBE_API_KEY=...
netlify dev     # → http://localhost:8888 에서 /api/* 포함 실행
```

프록시 없이 UI만 볼 때는 기존 방식 그대로:

```bash
python3 -m http.server 4173   # /api/* 는 데모 모드로 폴백
```
