# Dumchtax Player

사진 한 장이 음악이 되는 순간 — 폴라로이드 × LP 감성의 모바일 뮤직플레이어.

## 실행

정적 웹앱입니다. 아무 정적 서버로 열면 됩니다:

```bash
cd dumchtax-player
python3 -m http.server 4173
# → http://localhost:4173 (모바일 사이즈, 최대 420px)
```

## API 키 설정

앱 우측 상단 ⚙️ 설정에서 입력합니다. 키는 브라우저 localStorage에만 저장됩니다.

| 키 | 용도 | 발급처 |
|---|---|---|
| Gemini API Key | 업로드 사진의 무드 분석 (gemini-2.0-flash) | https://aistudio.google.com/apikey |
| YouTube Data API Key | 무드에 맞는 음악 검색 (Data API v3) | https://console.cloud.google.com (YouTube Data API v3 활성화) |

- **키가 없을 때**: 데모 모드 — 시간대 기반 무드 분석 + 데모 트랙(Lofi Girl 라디오) 재생.
- Gemini 분석 실패 시: 시간대별 웰컴 플레이리스트로 폴백.
- 음원 재생 불가 시: 다음 트랙으로 자동 스위칭.

## 핵심 플로우 (P0)

사진 선택/촬영 → 셔터 플래시 + 폴라로이드 인화 애니메이션 → Gemini 무드 분석 →
YouTube 검색 → 페이더가 PLAYER로 자동 슬라이드 → LP 회전 + 재생 →
폴라로이드 우측 상단 ♡(하트) 탭 → 페이더가 LIBRARY로 자석 이동 + 폴라로이드 낙하 저장
(저장된 하트는 `#913439`로 채워짐) → 카드 탭 시 그 조합 그대로 재생 복원.

## 구현된 인터랙션

- **아날로그 페이더 내비게이션**: 드래그 1:1 콘텐츠 동기화, 눈금 통과 햅틱(`navigator.vibrate`), 자석 스냅(거리/플리킹 속도 300px/s 기준), 레이블 weight 보간
- **폴라로이드 인화**: 플래시 → 필름 토출 → 흑백→컬러 + blur 해제 + grain 페이드 (약 2.4초)
- **LP 회전**: 재생 중 시계방향 1.8s/rev, 일시정지 시 정지, accent glow 연동
- **Scattered Memories**: 랜덤 각도/위치 폴라로이드 더미, 자유 드래그(위치 영속), 탭 시 재생 복원, REC PLAYBACK LOG 버튼으로 재셔플
