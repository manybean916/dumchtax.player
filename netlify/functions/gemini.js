/* Netlify Function — Gemini proxy
   서버 환경변수 GEMINI_API_KEY 로 Google 을 대신 호출한다.
   키는 이 함수(서버) 안에만 존재하고 브라우저로 전달되지 않는다. */
"use strict";

// 다른 웹사이트가 이 프록시를 도용하지 못하도록, 요청 출처가
// 이 사이트 자신일 때만 허용한다(브라우저가 origin/referer 를 보낼 때).
function sameSite(event) {
  const host = event.headers.host || "";
  const src = event.headers.origin || event.headers.referer || "";
  if (!src) return true; // 헤더가 없으면(일부 클라이언트) 통과 — 아래 쿼터로 방어
  try {
    return new URL(src).host === host;
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  if (!sameSite(event)) {
    return { statusCode: 403, body: JSON.stringify({ error: "forbidden origin" }) };
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // 환경변수 미설정 → 앱은 데모 모드로 우아하게 폴백한다.
    return { statusCode: 503, body: JSON.stringify({ error: "server key not configured" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "invalid json" }) };
  }
  const body = payload.body || payload; // { body: {...} } 또는 원본 그대로 허용

  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastStatus = 502;
  let lastText = "";
  for (const model of models) {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    if (r.ok) {
      const data = await r.text();
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: data };
    }
    lastStatus = r.status;
    lastText = await r.text();
    if (r.status === 429) break; // rate-limit — 다음 모델 시도해도 소용없음
  }
  return { statusCode: lastStatus, body: lastText || JSON.stringify({ error: "gemini upstream error" }) };
};
