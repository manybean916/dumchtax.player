/* Netlify Function — YouTube Data API proxy
   서버 환경변수 YOUTUBE_API_KEY 로 검색을 대신 수행한다.
   키는 서버 안에만 존재하고 브라우저로 전달되지 않는다. */
"use strict";

function sameSite(event) {
  const host = event.headers.host || "";
  const src = event.headers.origin || event.headers.referer || "";
  if (!src) return true;
  try {
    return new URL(src).host === host;
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  if (!sameSite(event)) {
    return { statusCode: 403, body: JSON.stringify({ error: "forbidden origin" }) };
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return { statusCode: 503, body: JSON.stringify({ error: "server key not configured" }) };
  }

  const q = (event.queryStringParameters && event.queryStringParameters.q) || "";
  if (!q) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing q" }) };
  }

  const url =
    "https://www.googleapis.com/youtube/v3/search" +
    "?part=snippet&type=video&videoCategoryId=10&videoEmbeddable=true&maxResults=12" +
    `&q=${encodeURIComponent(q)}&key=${encodeURIComponent(key)}`;

  const r = await fetch(url);
  const text = await r.text();
  return { statusCode: r.status, headers: { "Content-Type": "application/json" }, body: text };
};
