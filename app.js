/* ================================================================
   Dumchtax Player — photo → mood → music
   Gemini API (vision mood analysis) + YouTube API (search & play)
   ================================================================ */
"use strict";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ---------------- Settings (API keys) ---------------- */
const settings = {
  get geminiKey() { return localStorage.getItem("dumchtax_gemini_key") || ""; },
  set geminiKey(v) { localStorage.setItem("dumchtax_gemini_key", v); },
  get youtubeKey() { return localStorage.getItem("dumchtax_youtube_key") || ""; },
  set youtubeKey(v) { localStorage.setItem("dumchtax_youtube_key", v); },
};

/* ---------------- App state ---------------- */
const state = {
  page: 0,                 // 0 HOME / 1 PLAYER / 2 LIBRARY
  photo: null,             // current photo dataURL
  analysis: null,          // { mood, keywords, caption, musicQuery }
  results: [],             // youtube search results [{id,title,artist}]
  trackIndex: 0,
  playing: false,
  playerReady: false,
  library: loadLibrary(),
  savedCurrent: false,
};

function loadLibrary() {
  try { return JSON.parse(localStorage.getItem("dumchtax_library") || "[]"); }
  catch { return []; }
}
function persistLibrary() {
  try { localStorage.setItem("dumchtax_library", JSON.stringify(state.library)); }
  catch { toast("저장 공간이 가득 찼어요. 오래된 추억을 정리해 주세요."); }
}

/* ---------------- Haptics ---------------- */
function haptic(ms) { if (navigator.vibrate) navigator.vibrate(ms); }

/* ---------------- Toast ---------------- */
let toastTimer = null;
function toast(msg, dur = 3200) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, dur);
}

/* ================================================================
   FADER NAVIGATION — drag / haptic ticks / magnetic snapping
   ================================================================ */
const faderArea = $("#fader-track-area");
const knob = $("#fader-knob");
const knobDot = $("#knob-dot");
const pagesEl = $("#pages");
const labels = $$(".fader-label");
const navIcons = $$(".nav-icon");

let trackW = 0;
let knobX = 0;           // px from track start
let dragging = false;
let dragStartX = 0, dragStartKnob = 0;
let lastMoveX = 0, lastMoveT = 0, velocity = 0;
let lastNotchHit = -1;

function measureTrack() {
  trackW = faderArea.clientWidth;
  setKnob((state.page / 2) * trackW, false);
}
function notchPositions() { return [0, trackW / 2, trackW]; }

function setKnob(x, animate) {
  knobX = Math.max(0, Math.min(trackW, x));
  const progress = trackW ? knobX / trackW : 0; // 0..1 over 2 pages
  if (animate) {
    knob.style.transition = "left 220ms cubic-bezier(0.25,0.46,0.45,0.94)";
    pagesEl.style.transition = "transform 220ms cubic-bezier(0.25,0.46,0.45,0.94)";
  } else {
    knob.style.transition = "none";
    pagesEl.style.transition = "none";
  }
  knob.style.left = knobX + "px";
  // content 1:1 sync — pages container is 300% wide, full travel = 2 page widths
  pagesEl.style.transform = `translateX(${-progress * (200 / 3)}%)`;
  updateLabels(progress * 2);
}

function updateLabels(pos) { // pos: 0..2 (tab space)
  labels.forEach((el, i) => {
    const d = Math.min(1, Math.abs(pos - i));
    el.style.fontWeight = d < 0.5 ? 700 : 500;
    // ink ↔ muted lerp
    const t = 1 - d;
    const c = Math.round(90 - t * 80); // 90→10 grayscale-ish
    el.style.color = d < 0.04 && i === Math.round(pos) ? "var(--color-accent)" : `rgb(${c},${c},${c})`;
  });
  navIcons.forEach((el, i) => {
    el.style.color = Math.round(pos) === i && Math.abs(pos - i) < 0.04
      ? "var(--color-ink)" : "var(--color-muted)";
  });
}

function snapTo(tab, animate = true) {
  state.page = tab;
  setKnob((tab / 2) * trackW, animate);
  knobDot.classList.remove("pulse");
  void knobDot.offsetWidth;
  knobDot.classList.add("pulse");
  haptic(20); // snap confirm — medium
}

function nearestTab(x, vel) {
  if (Math.abs(vel) > 300) {
    return vel > 0 ? Math.min(state.page + 1, 2) : Math.max(state.page - 1, 0);
  }
  const n = notchPositions();
  let best = 0, bestD = Infinity;
  n.forEach((p, i) => { const d = Math.abs(p - x); if (d < bestD) { bestD = d; best = i; } });
  return best;
}

faderArea.addEventListener("pointerdown", (e) => {
  dragging = true;
  faderArea.setPointerCapture(e.pointerId);
  dragStartX = e.clientX;
  dragStartKnob = knobX;
  lastMoveX = e.clientX; lastMoveT = performance.now(); velocity = 0;
  lastNotchHit = -1;
  haptic(8); // drag start — soft
  // jump knob to touch point if tapping the track directly
  const rect = faderArea.getBoundingClientRect();
  const local = e.clientX - rect.left;
  if (Math.abs(local - knobX) > 30) { dragStartKnob = local; setKnob(local, false); }
});
faderArea.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const now = performance.now();
  const dt = now - lastMoveT;
  if (dt > 0) velocity = ((e.clientX - lastMoveX) / dt) * 1000;
  lastMoveX = e.clientX; lastMoveT = now;
  setKnob(dragStartKnob + (e.clientX - dragStartX), false);
  // notch pass haptic tick
  notchPositions().forEach((p, i) => {
    if (Math.abs(knobX - p) <= 6 && lastNotchHit !== i) { lastNotchHit = i; haptic(10); }
  });
});
faderArea.addEventListener("pointerup", () => {
  if (!dragging) return;
  dragging = false;
  snapTo(nearestTab(knobX, velocity));
});
faderArea.addEventListener("pointercancel", () => {
  if (!dragging) return;
  dragging = false;
  snapTo(nearestTab(knobX, 0));
});

labels.forEach((el) => el.addEventListener("click", () => snapTo(+el.dataset.tab)));
navIcons.forEach((el) => el.addEventListener("click", () => snapTo(+el.dataset.tab)));
window.addEventListener("resize", measureTrack);

/* ================================================================
   PAGE 1 — HOME : photo pick → polaroid print → analyze
   ================================================================ */
const homePhoto = $("#home-photo");
const homeStatus = $("#home-status");
const homeActions = $("#home-actions");
const polaroidOut = $("#polaroid-out");

$("#choose-photo-btn").addEventListener("click", () => $("#file-input").click());
$("#take-photo-btn").addEventListener("click", () => $("#camera-input").click());
$("#file-input").addEventListener("change", onPhotoPicked);
$("#camera-input").addEventListener("change", onPhotoPicked);

function onPhotoPicked(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => compressImage(reader.result, 640).then(startPrintFlow);
  reader.readAsDataURL(file);
}

function compressImage(dataUrl, maxSize) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.src = dataUrl;
  });
}

function setStatus(text, active) {
  homeStatus.textContent = text;
  homeStatus.classList.toggle("active", !!active);
}

async function startPrintFlow(dataUrl) {
  state.photo = dataUrl;
  state.savedCurrent = false;

  // [1] shutter flash (0–300ms)
  const flash = $("#shutter-flash");
  flash.classList.remove("fire"); void flash.offsetWidth; flash.classList.add("fire");
  haptic(25);

  // [2] film eject (300–700ms)
  setTimeout(() => {
    homeActions.style.display = "none";
    homePhoto.src = dataUrl;
    homePhoto.style.display = "block";
    homePhoto.classList.remove("developing");
    homePhoto.style.filter = "brightness(0.05) saturate(0) blur(8px)";
    polaroidOut.classList.remove("ejecting"); void polaroidOut.offsetWidth;
    polaroidOut.classList.add("ejecting");
  }, 300);

  // [3] film developing (700–2200ms) — runs while Gemini analyzes
  setTimeout(() => {
    homePhoto.style.filter = "";
    homePhoto.classList.add("developing");
    const grain = $("#home-grain");
    grain.classList.remove("show"); void grain.offsetWidth; grain.classList.add("show");
    setStatus("Developing...", true);
  }, 700);

  // analysis runs in parallel with the develop animation
  const analysisPromise = analyzePhoto(dataUrl);
  const minDevelop = new Promise((r) => setTimeout(r, 2200));

  setTimeout(() => setStatus("Analyzing...", true), 1700);

  let analysis;
  try {
    [analysis] = await Promise.all([analysisPromise, minDevelop]);
  } catch (err) {
    console.warn("analysis failed:", err);
    analysis = null;
  }

  // [4] landing bounce + done
  polaroidOut.classList.remove("bounce"); void polaroidOut.offsetWidth;
  polaroidOut.classList.add("bounce");
  haptic(12);

  if (!analysis) {
    analysis = fallbackAnalysis();
    toast("사진이 부끄러움을 타네요! 대신 지금 시간대에 어울리는 음악을 준비했어요");
  }
  state.analysis = analysis;
  setStatus("Ready", false);

  // search music & move to player
  const tracks = await findTracks(analysis);
  state.results = tracks;
  state.trackIndex = 0;
  errorStreak = 0;
  updatePlayerPolaroid();
  snapTo(1); // slide fader to PLAYER
  playTrack(tracks[0]);
  resetHomeAfter();
}

function resetHomeAfter() {
  setTimeout(() => {
    homePhoto.style.display = "none";
    homePhoto.classList.remove("developing");
    homeActions.style.display = "flex";
    setStatus("Ready...", false);
  }, 1200);
}

/* ---------------- Gemini vision analysis ---------------- */
async function analyzePhoto(dataUrl) {
  if (!settings.geminiKey) {
    await new Promise((r) => setTimeout(r, 900)); // demo-mode pacing
    return fallbackAnalysis();
  }
  const base64 = dataUrl.split(",")[1];
  const body = {
    contents: [{
      parts: [
        { text:
`Analyze this photo's visual mood for music matching.
Respond with ONLY a JSON object, no markdown fences:
{
 "mood": "<short mood phrase in English>",
 "keywords": ["<3-5 english mood keywords>"],
 "caption": "<poetic 2-4 word title for this photo>",
 "musicQuery": "<a YouTube search query for a song/playlist that matches this mood, in English>"
}` },
        { inline_data: { mime_type: "image/jpeg", data: base64 } },
      ],
    }],
  };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(settings.geminiKey)}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error("Gemini API " + res.status);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const json = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(json);
  if (!parsed.musicQuery) throw new Error("no musicQuery");
  return parsed;
}

function fallbackAnalysis() {
  const h = new Date().getHours();
  if (h < 6)  return { mood: "midnight calm", keywords: ["night","quiet","dream"], caption: "Midnight Drift", musicQuery: "calm midnight ambient music" };
  if (h < 11) return { mood: "fresh morning", keywords: ["morning","light","fresh"], caption: "Morning Light", musicQuery: "fresh morning acoustic music" };
  if (h < 17) return { mood: "lazy afternoon", keywords: ["warm","mellow","sunny"], caption: "Sun-Drenched", musicQuery: "mellow afternoon lofi music" };
  if (h < 21) return { mood: "golden hour", keywords: ["sunset","golden","nostalgic"], caption: "Golden Hour", musicQuery: "golden hour chill sunset music" };
  return { mood: "city night", keywords: ["neon","night","urban"], caption: "Neon Pulse", musicQuery: "late night city jazz music" };
}

/* ---------------- YouTube search ---------------- */
const DEMO_TRACKS = [
  { id: "jfKfPfyJRdk", title: "lofi hip hop radio", artist: "Lofi Girl" },
  { id: "4xDzrJKXOOY", title: "synthwave radio", artist: "Lofi Girl" },
  { id: "Na0w3Mz46GA", title: "asian lofi radio", artist: "Lofi Girl" },
];

async function findTracks(analysis) {
  if (!settings.youtubeKey) {
    toast("YouTube API 키가 없어 데모 트랙을 재생합니다 (⚙️ 설정에서 키 입력)");
    return DEMO_TRACKS.map((t) => ({ ...t }));
  }
  try {
    const q = encodeURIComponent(analysis.musicQuery);
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&videoEmbeddable=true&maxResults=8&q=${q}&key=${encodeURIComponent(settings.youtubeKey)}`
    );
    if (!res.ok) throw new Error("YouTube API " + res.status);
    const data = await res.json();
    const items = (data.items || []).filter((i) => i.id?.videoId);
    if (!items.length) throw new Error("no results");
    return items.map((i) => ({
      id: i.id.videoId,
      title: decodeHtml(i.snippet.title),
      artist: decodeHtml(i.snippet.channelTitle),
    }));
  } catch (err) {
    console.warn("youtube search failed:", err);
    toast("음원 검색에 실패했어요. 유사한 무드의 대체 음원으로 전환합니다.");
    return DEMO_TRACKS.map((t) => ({ ...t }));
  }
}

function decodeHtml(s) {
  const el = document.createElement("textarea");
  el.innerHTML = s;
  return el.value;
}

/* ================================================================
   PAGE 2 — PLAYER : YouTube IFrame + LP rotation
   ================================================================ */
let ytPlayer = null;
let pendingVideoId = null;
let errorStreak = 0;

// YouTube IFrame API bootstrap
const ytScript = document.createElement("script");
ytScript.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(ytScript);

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player("yt-holder", {
    width: "200", height: "200",
    playerVars: { playsinline: 1, controls: 0, rel: 0, modestbranding: 1 },
    events: {
      onReady: () => {
        state.playerReady = true;
        ytPlayer.setVolume(currentVolume);
        if (pendingVideoId) { loadVideo(pendingVideoId); pendingVideoId = null; }
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) { errorStreak = 0; setPlayingUI(true); }
        else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) setPlayingUI(false);
        if (e.data === YT.PlayerState.ENDED) nextTrack();
      },
      onError: () => {
        errorStreak++;
        // try the next track, but stop once every result has failed —
        // retrying the same list forever would keep resetting player state
        if (state.results.length > 1 && errorStreak < state.results.length) {
          toast("이 음원은 재생할 수 없어요. 유사한 무드의 대체 음원으로 스위칭!");
          nextTrack();
        } else {
          setPlayingUI(false);
          toast("음원을 재생할 수 없어요. 다른 사진으로 다시 시도해 보세요!");
        }
      },
    },
  });
};

function loadVideo(id) {
  $("#yt-circle").classList.add("visible");
  ytPlayer.loadVideoById(id);
}

function playTrack(track) {
  if (!track) return;
  state.savedCurrent = false;
  $("#save-btn").classList.remove("saved");
  updatePlayerPolaroid();
  if (state.playerReady) loadVideo(track.id);
  else pendingVideoId = track.id;
}

function currentTrack() { return state.results[state.trackIndex] || null; }

function updatePlayerPolaroid() {
  const t = currentTrack();
  const cap = $("#player-caption");
  if (state.photo) {
    $("#player-photo").src = state.photo;
    $("#player-photo").style.display = "block";
  }
  if (t) {
    const title = t.title.length > 46 ? t.title.slice(0, 44) + "…" : t.title;
    cap.textContent = `${t.artist} - ${title}`;
  } else {
    cap.textContent = state.analysis ? state.analysis.caption : "No music yet";
  }
}

function setPlayingUI(playing) {
  state.playing = playing;
  $("#lp-disc").classList.toggle("spinning", playing);
  $("#lp-glow").classList.toggle("on", playing);
  $("#icon-play").style.display = playing ? "none" : "block";
  $("#icon-pause").style.display = playing ? "block" : "none";
}

$("#play-btn").addEventListener("click", () => {
  if (!ytPlayer || !state.playerReady) return toast("플레이어 준비 중...");
  if (!currentTrack()) return toast("먼저 HOME에서 사진을 골라주세요!");
  state.playing ? ytPlayer.pauseVideo() : ytPlayer.playVideo();
  haptic(15);
});
$("#prev-btn").addEventListener("click", () => { stepTrack(-1); });
$("#next-btn").addEventListener("click", () => { stepTrack(1); });
function stepTrack(dir) {
  if (!state.results.length) return;
  state.trackIndex = (state.trackIndex + dir + state.results.length) % state.results.length;
  playTrack(currentTrack());
  haptic(10);
}
function nextTrack() { stepTrack(1); }

/* ---------------- Volume fader ---------------- */
let currentVolume = 65;
const volTrack = $("#volume-track");
const volKnob = $("#volume-knob");
function setVolumeFromY(clientY) {
  const r = volTrack.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
  currentVolume = Math.round((1 - ratio) * 100);
  volKnob.style.top = `${ratio * 100}%`;
  if (ytPlayer && state.playerReady) ytPlayer.setVolume(currentVolume);
}
volKnob.addEventListener("pointerdown", (e) => {
  volKnob.setPointerCapture(e.pointerId);
  const move = (ev) => setVolumeFromY(ev.clientY);
  const up = () => {
    volKnob.removeEventListener("pointermove", move);
    volKnob.removeEventListener("pointerup", up);
  };
  volKnob.addEventListener("pointermove", move);
  volKnob.addEventListener("pointerup", up);
});

/* ---------------- Save to library ---------------- */
$("#save-btn").addEventListener("click", () => {
  const t = currentTrack();
  if (!t || !state.photo) return toast("저장할 추억이 아직 없어요!");
  if (state.savedCurrent) return toast("이미 라이브러리에 저장된 추억이에요.");
  const card = {
    id: "m" + Date.now(),
    savedAt: new Date().toISOString(),
    imageUri: state.photo,
    moodTags: state.analysis ? state.analysis.keywords : [],
    caption: state.analysis ? state.analysis.caption : "",
    track: { youtubeId: t.id, title: t.title, artist: t.artist },
    polaroidAngle: Math.round((Math.random() * 16 - 8) * 10) / 10,
    position: null, // assigned on first render
  };
  state.library.push(card);
  persistLibrary();
  state.savedCurrent = true;
  $("#save-btn").classList.add("saved");
  haptic(20);
  // magnetic slide to LIBRARY, then the polaroid drops onto the pile
  snapTo(2);
  setTimeout(() => {
    renderLibrary(card.id);
    setTimeout(() => haptic(15), 620); // landing tick
    toast("폴라로이드가 라이브러리에 떨어졌어요 ●");
  }, 280);
});

/* ================================================================
   PAGE 3 — LIBRARY : scattered memories
   ================================================================ */
const board = $("#library-board");

function renderLibrary(dropId) {
  $("#library-empty").style.display = state.library.length ? "none" : "flex";
  // remove cards no longer present
  board.querySelectorAll(".memory-card").forEach((el) => {
    if (!state.library.find((c) => c.id === el.dataset.id)) el.remove();
  });
  const bw = board.clientWidth || 360;
  const bh = board.clientHeight || 480;
  state.library.forEach((card, i) => {
    let el = board.querySelector(`[data-id="${card.id}"]`);
    if (!el) {
      el = buildCardEl(card);
      board.appendChild(el);
      if (card.id === dropId) {
        el.classList.add("dropping");
        setTimeout(() => el.classList.remove("dropping"), 700);
      }
    }
    if (!card.position) {
      card.position = {
        x: Math.round(20 + Math.random() * Math.max(40, bw - 200)),
        y: Math.round(10 + Math.random() * Math.max(40, bh - 240)),
      };
    }
    el.style.left = card.position.x + "px";
    el.style.top = card.position.y + "px";
    el.style.setProperty("--angle", card.polaroidAngle + "deg");
    el.style.transform = `rotate(${card.polaroidAngle}deg)`;
    el.style.zIndex = 10 + i;
  });
  persistLibrary();
}

function buildCardEl(card) {
  const el = document.createElement("div");
  el.className = "memory-card";
  el.dataset.id = card.id;
  const img = document.createElement("img");
  img.src = card.imageUri;
  img.alt = card.caption || "";
  const cap = document.createElement("p");
  cap.className = "card-caption";
  cap.textContent = card.caption || card.track.title;
  el.appendChild(img);
  el.appendChild(cap);
  attachCardInteraction(el, card);
  return el;
}

/* drag to move / tap (<4px) to replay */
function attachCardInteraction(el, card) {
  let startX = 0, startY = 0, origX = 0, origY = 0, moved = 0, down = false;
  el.addEventListener("pointerdown", (e) => {
    down = true; moved = 0;
    startX = e.clientX; startY = e.clientY;
    origX = card.position.x; origY = card.position.y;
    el.setPointerCapture(e.pointerId);
    el.style.zIndex = 999;
  });
  el.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    moved = Math.max(moved, Math.hypot(dx, dy));
    card.position.x = origX + dx;
    card.position.y = origY + dy;
    el.style.left = card.position.x + "px";
    el.style.top = card.position.y + "px";
  });
  el.addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    if (moved < 4) replayCard(el, card);
    else persistLibrary();
  });
}

function replayCard(el, card) {
  haptic(15);
  // selection visual: accent glow + others dim
  board.querySelectorAll(".memory-card").forEach((c) => {
    c.style.transition = "all 300ms ease";
    if (c === el) {
      c.classList.add("selected");
      c.style.transform = "rotate(0deg) scale(1.12)";
      c.style.zIndex = 999;
    } else {
      c.style.opacity = "0.35";
      c.style.filter = "brightness(0.7)";
    }
  });
  setTimeout(() => {
    // restore board state
    board.querySelectorAll(".memory-card").forEach((c) => {
      c.classList.remove("selected");
      c.style.opacity = "";
      c.style.filter = "";
    });
    renderLibrary();
    // restore photo + track into player
    state.photo = card.imageUri;
    state.analysis = { caption: card.caption, keywords: card.moodTags, musicQuery: "" };
    state.results = [{ id: card.track.youtubeId, title: card.track.title, artist: card.track.artist }];
    state.trackIndex = 0;
    errorStreak = 0;
    snapTo(1);
    playTrack(currentTrack());
  }, 500);
}

$("#rec-log-btn").addEventListener("click", () => {
  // re-scatter the pile
  state.library.forEach((c) => {
    c.position = null;
    c.polaroidAngle = Math.round((Math.random() * 16 - 8) * 10) / 10;
  });
  renderLibrary();
  haptic(15);
});
$("#go-home-btn").addEventListener("click", () => snapTo(0));

/* ================================================================
   Settings modal
   ================================================================ */
const modal = $("#settings-modal");
$("#settings-btn").addEventListener("click", () => {
  $("#gemini-key-input").value = settings.geminiKey;
  $("#youtube-key-input").value = settings.youtubeKey;
  modal.hidden = false;
});
$("#settings-cancel").addEventListener("click", () => { modal.hidden = true; });
$("#settings-save").addEventListener("click", () => {
  settings.geminiKey = $("#gemini-key-input").value.trim();
  settings.youtubeKey = $("#youtube-key-input").value.trim();
  modal.hidden = true;
  toast(settings.geminiKey || settings.youtubeKey
    ? "API 키가 저장되었습니다."
    : "키 없이 데모 모드로 동작합니다.");
});
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

/* ================================================================
   Init
   ================================================================ */
measureTrack();
snapTo(0, false);
renderLibrary();
updateLabels(0);
