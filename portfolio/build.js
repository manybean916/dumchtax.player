// Dumchtax Player — Portfolio PPTX Generator
// 윤다빈 / UX·UI Designer
// run: node build.js  →  dumchtax-portfolio.pptx

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33" × 7.5"
pres.author = "윤다빈";
pres.title = "Dumchtax Player — UX/UI Design Portfolio";

// ─────────────────────────────────────────
//  DESIGN TOKENS
// ─────────────────────────────────────────
const C = {
  bgDark:    "0A0A0A",   // primary dark bg
  bgMid:     "141414",   // elevated surface
  bgSurface: "1C1C1C",   // card surface
  bgLight:   "F5F5F0",   // light page bg
  bgPaper:   "F0EDE4",   // polaroid cream
  accent:    "913439",   // deep red
  accentDim: "5C1F22",   // dark red
  border:    "2C2C2C",   // dark border
  borderLt:  "DEDAD0",   // light border
  white:     "F5F5F0",
  ink:       "0A0A0A",
  muted:     "5A5A5A",
  mutedLt:   "9A9A9A",
  secondary: "8A8A8A",
  teal:      "2A4A4A",   // secondary accent
};

const W = 13.33, H = 7.5;
const MONO = "Consolas";
const BODY = "Calibri";

// ─────────────────────────────────────────
//  HELPER FUNCTIONS
// ─────────────────────────────────────────
function dot(slide, x, y, r = 0.09, color = C.accent) {
  slide.addShape(pres.ShapeType.ellipse, {
    x, y, w: r, h: r,
    fill: { color }, line: { color }
  });
}

function hline(slide, x, y, w, color = C.border, h = 0.01) {
  slide.addShape(pres.ShapeType.rect, {
    x, y, w, h,
    fill: { color }, line: { color }
  });
}

function label(slide, text, x, y, lightBg = false) {
  dot(slide, x, y + 0.02);
  slide.addText(text.toUpperCase(), {
    x: x + 0.2, y: y, w: 6, h: 0.22,
    fontSize: 8, fontFace: MONO,
    charSpacing: 3.5, color: lightBg ? C.muted : C.mutedLt,
    margin: 0
  });
}

function slideNum(slide, n, lightBg = false) {
  slide.addText(`${String(n).padStart(2,"0")} / 17`, {
    x: W - 1.5, y: H - 0.45, w: 1.3, h: 0.25,
    fontSize: 8.5, fontFace: MONO, charSpacing: 2,
    color: lightBg ? C.muted : C.border,
    align: "right", margin: 0
  });
}

function polaroidShape(slide, x, y, w, h, {
  photoBg = C.bgMid, caption = "", rotate = 0,
  photoContent = null, shadow = true
} = {}) {
  const pad = 0.16;
  const captionH = 0.55;
  const totalH = h + captionH;
  const opts = { shadow: shadow ? { type: "outer", blur: 10, offset: 4, angle: 140, color: "000000", opacity: 0.22 } : null };

  slide.addShape(pres.ShapeType.rect, {
    x, y, w, h: totalH,
    fill: { color: C.bgPaper },
    line: { color: "E0DDD4", width: 0.5 },
    rotate,
    ...(shadow ? { shadow: { type: "outer", blur: 10, offset: 4, angle: 140, color: "000000", opacity: 0.22 } } : {})
  });
  slide.addShape(pres.ShapeType.rect, {
    x: x + pad, y: y + pad, w: w - pad * 2, h: h - pad,
    fill: { color: photoBg }, line: { color: "CCCAC0", width: 0.3 },
    rotate
  });
  if (caption) {
    slide.addText(caption, {
      x: x + pad, y: y + h + 0.05, w: w - pad * 2, h: captionH - 0.1,
      fontSize: 10, fontFace: "Brush Script MT",
      color: "3A3835", align: "center",
      italic: true, margin: 0,
      rotate
    });
  }
}

function lpShape(slide, x, y, r = 1.4, photoBg = C.bgMid) {
  // Outer LP
  slide.addShape(pres.ShapeType.ellipse, { x, y, w: r, h: r, fill: { color: "0D0D0D" }, line: { color: "222222", width: 0.5 } });
  // Grooves
  const grooves = [0.82, 0.74, 0.66, 0.58];
  grooves.forEach(g => {
    const gx = x + (r - r * g) / 2;
    const gy = y + (r - r * g) / 2;
    slide.addShape(pres.ShapeType.ellipse, { x: gx, y: gy, w: r * g, h: r * g, fill: { type: "none" }, line: { color: "1E1E1E", width: 0.3 } });
  });
  // Center image circle
  const cr = r * 0.38;
  const cx = x + (r - cr) / 2;
  const cy = y + (r - cr) / 2;
  slide.addShape(pres.ShapeType.ellipse, { x: cx, y: cy, w: cr, h: cr, fill: { color: photoBg }, line: { color: "333333", width: 0.3 } });
  // Spindle hole
  const hr = r * 0.07;
  const hx = x + (r - hr) / 2;
  const hy = y + (r - hr) / 2;
  slide.addShape(pres.ShapeType.ellipse, { x: hx, y: hy, w: hr, h: hr, fill: { color: C.bgDark }, line: { color: "111111", width: 0.2 } });
}

function cameraShape(slide, x, y, w = 2.4, h = 1.9) {
  // Camera body
  slide.addShape(pres.ShapeType.rect, {
    x, y: y + 0.3, w, h: h - 0.3,
    fill: { color: "1A1A1A" }, line: { color: "333333" },
    rectRadius: 0.08
  });
  // Top bar
  slide.addShape(pres.ShapeType.rect, {
    x: x + 0.08, y, w: w - 0.16, h: 0.32,
    fill: { color: "212121" }, line: { color: "333333" }
  });
  // Lens ring
  const lr = 0.62;
  const lx = x + w * 0.38 - lr / 2;
  const ly = y + 0.3 + (h - 0.3) / 2 - lr / 2;
  slide.addShape(pres.ShapeType.ellipse, { x: lx, y: ly, w: lr, h: lr, fill: { color: "111111" }, line: { color: "444444", width: 1 } });
  slide.addShape(pres.ShapeType.ellipse, { x: lx + 0.08, y: ly + 0.08, w: lr - 0.16, h: lr - 0.16, fill: { color: "192838" }, line: { color: "2A4050", width: 0.5 } });
  slide.addShape(pres.ShapeType.ellipse, { x: lx + 0.18, y: ly + 0.18, w: lr - 0.36, h: lr - 0.36, fill: { color: "142535" }, line: { color: "1A3040", width: 0.3 } });
  // Viewfinder
  slide.addShape(pres.ShapeType.rect, { x: x + 0.15, y: y + 0.06, w: 0.28, h: 0.18, fill: { color: "0A1520" }, line: { color: "444444" } });
  // Flash
  slide.addShape(pres.ShapeType.rect, { x: x + 0.52, y: y + 0.06, w: 0.4, h: 0.18, fill: { color: "181A10" }, line: { color: "3A3A20" } });
  // REC dot
  dot(slide, x + w - 0.35, y + 0.07, 0.08, C.accent);
  slide.addText("REC", { x: x + w - 0.26, y: y + 0.05, w: 0.24, h: 0.14, fontSize: 6, fontFace: MONO, color: C.accent, margin: 0 });
  // Shutter slot
  slide.addShape(pres.ShapeType.rect, { x: x + w * 0.2, y: y + 0.28, w: w * 0.6, h: 0.06, fill: { color: "111111" }, line: { color: "333333" } });
  // Model label
  slide.addText("instax mini 40", { x: x + w * 0.5 - 0.5, y: y + h - 0.24, w: 1.0, h: 0.18, fontSize: 6.5, fontFace: MONO, color: "5A5A5A", align: "center", italic: true, margin: 0 });
}

// ─────────────────────────────────────────
//  SLIDE 1 · COVER
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgDark };

  // Top accent stripe
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.05, fill: { color: C.accent }, line: { color: C.accent } });

  // REC indicator
  dot(s, 0.55, 0.52, 0.1);
  s.addText("REC", { x: 0.72, y: 0.48, w: 0.5, h: 0.2, fontSize: 9, fontFace: MONO, color: C.accent, charSpacing: 3, margin: 0 });

  // Title — DUMCHTAX
  s.addText("DUMCHTAX", { x: 0.55, y: 1.1, w: 9, h: 2.0,
    fontSize: 104, fontFace: MONO, bold: true, charSpacing: 6, color: C.white, margin: 0 });
  s.addText("PLAYER", { x: 0.55, y: 2.85, w: 9, h: 1.7,
    fontSize: 104, fontFace: MONO, bold: true, charSpacing: 6, color: C.accent, margin: 0 });

  // Thin divider
  hline(s, 0.55, 4.8, 5.8, C.border, 0.012);

  // Subtitle
  s.addText("PHOTO → MOOD → MUSIC  ·  UX/UI CASE STUDY", {
    x: 0.55, y: 5.0, w: 8, h: 0.3,
    fontSize: 10.5, fontFace: MONO, charSpacing: 4.5, color: C.mutedLt, margin: 0
  });

  // Name & role
  s.addText("윤다빈 / YUNDABIN", {
    x: 0.55, y: 5.5, w: 5, h: 0.5,
    fontSize: 18, fontFace: MONO, charSpacing: 2, color: C.white, margin: 0
  });
  s.addText("UX · UI DESIGNER", {
    x: 0.55, y: 6.05, w: 4, h: 0.3,
    fontSize: 11.5, fontFace: MONO, charSpacing: 5, color: C.secondary, margin: 0
  });

  // Right side: Polaroid mockup
  const px = 9.0, py = 1.0, pw = 3.5, ph = 3.2;
  polaroidShape(s, px, py, pw, ph, { photoBg: C.bgMid, caption: "Sun-Drenched", rotate: 4 });
  // LP inside the photo area
  lpShape(s, px + 0.45, py + 0.28, 2.2, "253035");
  // Glow under polaroid
  s.addShape(pres.ShapeType.ellipse, {
    x: px - 0.3, y: py + ph, w: pw + 0.6, h: 0.5,
    fill: { color: C.accent, transparency: 90 }, line: { type: "none" }
  });

  // Second polaroid peeking behind
  polaroidShape(s, 9.5, 1.6, 2.8, 2.6, { photoBg: "1A2030", caption: "Golden Hour", rotate: -6 });

  // Year
  s.addText("2025", { x: 11.8, y: H - 0.4, w: 1.3, h: 0.25, fontSize: 9, fontFace: MONO, color: C.border, align: "right", margin: 0 });

  // Bottom line
  hline(s, 0, H - 0.04, W, C.accentDim, 0.04);
  slideNum(s, 1);
}

// ─────────────────────────────────────────
//  SLIDE 2 · PROJECT OVERVIEW
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  label(s, "01 / PROJECT OVERVIEW", 0.55, 0.4, true);

  s.addText("AT A GLANCE", {
    x: 0.55, y: 0.75, w: 8, h: 0.9,
    fontSize: 52, fontFace: MONO, bold: true, charSpacing: 4, color: C.ink, margin: 0
  });

  hline(s, 0.55, 1.72, 12.2, C.borderLt, 0.01);

  // 3 big stats
  const stats = [
    { num: "3", unit: "SCREENS", desc: "HOME · PLAYER · LIBRARY", x: 0.55 },
    { num: "2", unit: "AI MODELS", desc: "Gemini Vision + YouTube API", x: 4.75 },
    { num: "0", unit: "FRAMEWORKS", desc: "Vanilla HTML / CSS / JS", x: 8.95 },
  ];
  stats.forEach(({ num, unit, desc, x }) => {
    s.addText(num, { x, y: 1.95, w: 2.5, h: 1.5, fontSize: 96, fontFace: MONO, bold: true, color: C.accent, margin: 0 });
    s.addText(unit, { x, y: 3.3, w: 3.5, h: 0.4, fontSize: 13, fontFace: MONO, bold: true, charSpacing: 3, color: C.ink, margin: 0 });
    s.addText(desc, { x, y: 3.72, w: 3.8, h: 0.3, fontSize: 11, fontFace: BODY, color: C.muted, margin: 0 });
    hline(s, x, 1.93, 0.42, C.accent, 0.04);
  });

  // Vertical dividers
  hline(s, 4.55, 2.0, 0.01, C.borderLt, 1.8);
  hline(s, 8.75, 2.0, 0.01, C.borderLt, 1.8);

  // Description block
  s.addText("WHAT IS DUMCHTAX PLAYER?", {
    x: 0.55, y: 4.4, w: 7, h: 0.35,
    fontSize: 11, fontFace: MONO, bold: true, charSpacing: 4, color: C.ink, margin: 0
  });
  s.addText(
    "사진 한 장을 찍으면 Gemini AI가 그 순간의 무드를 읽고, " +
    "어울리는 음악을 YouTube에서 찾아 재생합니다. " +
    "폴라로이드와 LP 바이닐의 아날로그 감성 속에서 " +
    "디지털 음악 경험을 새롭게 정의합니다.",
    { x: 0.55, y: 4.82, w: 8.8, h: 0.9, fontSize: 13.5, fontFace: BODY, color: C.muted, lineSpacingMultiple: 1.4, margin: 0 }
  );

  // Tags
  const tags = ["#Digilog", "#MoodMusic", "#Polaroid", "#LP", "#AIPhoto", "#Mobile"];
  tags.forEach((tag, i) => {
    const tx = 0.55 + i * 2.05;
    s.addShape(pres.ShapeType.rect, { x: tx, y: 5.9, w: 1.9, h: 0.32, fill: { color: "EBEBE4" }, line: { color: C.borderLt } });
    s.addText(tag, { x: tx, y: 5.9, w: 1.9, h: 0.32, fontSize: 9.5, fontFace: MONO, color: C.muted, align: "center", charSpacing: 1, margin: 0 });
  });

  // Right decoration: mini camera
  cameraShape(s, 10.3, 4.0, 2.5, 2.0);

  slideNum(s, 2, true);
}

// ─────────────────────────────────────────
//  SLIDE 3 · PROBLEM SPACE
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgDark };

  label(s, "02 / PROBLEM SPACE", 0.55, 0.4);

  s.addText("WHY DOES THIS\nNEED TO EXIST?", {
    x: 0.55, y: 0.75, w: 7.5, h: 1.7,
    fontSize: 52, fontFace: MONO, bold: true, charSpacing: 3,
    color: C.white, lineSpacingMultiple: 1.1, margin: 0
  });

  const problems = [
    {
      num: "01",
      title: "선택의 피로감",
      en: "Decision Fatigue",
      desc: "플레이리스트 탐색에 지쳐 음악을 듣지 않는 사용자. 알고리즘 추천은 정확하지만 감성적 연결이 없다.",
    },
    {
      num: "02",
      title: "휘발되는 추억",
      en: "Ephemeral Moments",
      desc: "사진과 그 순간의 감정은 기억되지만, 그때 들었던 음악과의 연결은 사라진다. 기억을 아카이빙할 도구가 없다.",
    },
    {
      num: "03",
      title: "아날로그 감성의 결핍",
      en: "Missing Analog Soul",
      desc: "스트리밍 서비스는 편리하지만 음악을 '소유'하는 경험, 물성이 있는 감각을 줄 수 없다. 감성적 여백이 없다.",
    },
  ];

  problems.forEach(({ num, title, en, desc }, i) => {
    const y = 2.7 + i * 1.4;
    // Number
    s.addText(num, { x: 0.55, y: y, w: 0.8, h: 1.0, fontSize: 40, fontFace: MONO, bold: true, color: C.accentDim, margin: 0 });
    // Title KO
    s.addText(title, { x: 1.5, y: y + 0.06, w: 4, h: 0.45, fontSize: 20, fontFace: MONO, bold: true, color: C.white, margin: 0 });
    // Title EN
    s.addText(en, { x: 1.5, y: y + 0.48, w: 4, h: 0.28, fontSize: 10, fontFace: MONO, charSpacing: 3, color: C.accent, margin: 0 });
    // Desc
    s.addText(desc, { x: 5.9, y: y + 0.08, w: 7.0, h: 0.9, fontSize: 12.5, fontFace: BODY, color: C.secondary, lineSpacingMultiple: 1.4, margin: 0 });
    // Horizontal rule
    if (i < 2) hline(s, 0.55, y + 1.28, 12.2, C.border);
  });

  slideNum(s, 3);
}

// ─────────────────────────────────────────
//  SLIDE 4 · SOLUTION & DIFFERENTIATION
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  label(s, "03 / SOLUTION", 0.55, 0.4, true);

  s.addText("DUMCHTAX\nSOLVES THIS.", {
    x: 0.55, y: 0.72, w: 6.5, h: 1.7,
    fontSize: 52, fontFace: MONO, bold: true, charSpacing: 3,
    color: C.ink, lineSpacingMultiple: 1.1, margin: 0
  });

  const diffs = [
    {
      icon: "◈",
      title: "Multimodal 감성 매칭",
      desc: "사진 → Gemini Vision API → 무드 키워드 추출 → YouTube 검색. 알고리즘이 아닌 당신의 '지금 이 순간'이 플레이리스트를 만든다.",
      tag: "P0 CORE",
    },
    {
      icon: "◉",
      title: "오브제 중심 아카이빙",
      desc: "폴라로이드 형태의 카드가 LIBRARY에 쌓인다. 사진 + 음악 + 순간을 하나의 오브제로 묶어 저장하고 재생한다.",
      tag: "P0 CORE",
    },
    {
      icon: "◫",
      title: "아날로그 인터페이스",
      desc: "LP 회전, 아날로그 페이더 내비게이션, 폴라로이드 인화 애니메이션. 디지털이지만 손으로 만지는 것처럼 느껴지는 UX.",
      tag: "P1 DELIGHT",
    },
    {
      icon: "◬",
      title: "Zero Friction Onboarding",
      desc: "API 키 없이도 데모 모드로 즉시 사용 가능. 설정은 설정 모달 하나에서 끝난다.",
      tag: "P2 ACCESS",
    },
  ];

  diffs.forEach(({ icon, title, desc, tag }, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.55 + col * 6.35;
    const y = 2.65 + row * 2.0;

    s.addShape(pres.ShapeType.rect, {
      x, y, w: 5.95, h: 1.72,
      fill: { color: i % 2 === 0 ? "EDEAE0" : C.bgPaper },
      line: { color: C.borderLt, width: 0.5 }
    });
    s.addText(icon, { x: x + 0.2, y: y + 0.15, w: 0.5, h: 0.5, fontSize: 22, fontFace: MONO, color: C.accent, margin: 0 });
    s.addText(title, { x: x + 0.2, y: y + 0.58, w: 4.8, h: 0.38, fontSize: 15, fontFace: MONO, bold: true, color: C.ink, margin: 0 });
    s.addText(desc, { x: x + 0.2, y: y + 0.94, w: 5.35, h: 0.68, fontSize: 11.5, fontFace: BODY, color: C.muted, lineSpacingMultiple: 1.3, margin: 0 });

    // Tag chip
    s.addShape(pres.ShapeType.rect, { x: x + 4.6, y: y + 0.14, w: 1.16, h: 0.24, fill: { color: col === 0 ? C.accentDim : C.accent }, line: { type: "none" } });
    s.addText(tag, { x: x + 4.6, y: y + 0.14, w: 1.16, h: 0.24, fontSize: 7.5, fontFace: MONO, color: C.white, align: "center", charSpacing: 1, margin: 0 });
  });

  slideNum(s, 4, true);
}

// ─────────────────────────────────────────
//  SLIDE 5 · TARGET USER & SCENARIO
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  label(s, "04 / TARGET USER", 0.55, 0.4, true);
  s.addText("WHO IS THIS FOR?", { x: 0.55, y: 0.72, w: 9, h: 0.9, fontSize: 44, fontFace: MONO, bold: true, charSpacing: 4, color: C.ink, margin: 0 });

  hline(s, 0.55, 1.68, 12.2, C.borderLt, 0.01);

  // Persona card
  s.addShape(pres.ShapeType.rect, { x: 0.55, y: 1.9, w: 3.6, h: 4.6,
    fill: { color: C.bgPaper }, line: { color: C.borderLt }
  });
  // Avatar circle
  s.addShape(pres.ShapeType.ellipse, { x: 0.95, y: 2.1, w: 2.0, h: 2.0, fill: { color: "D8D4C8" }, line: { type: "none" } });
  // Avatar silhouette (simplified)
  s.addShape(pres.ShapeType.ellipse, { x: 1.35, y: 2.2, w: 1.2, h: 1.2, fill: { color: "B8B4A8" }, line: { type: "none" } });
  s.addShape(pres.ShapeType.rect, { x: 1.0, y: 3.1, w: 1.9, h: 0.9, fill: { color: "B8B4A8" }, line: { type: "none" } });

  s.addText("김지수 / 25세", { x: 0.7, y: 4.25, w: 3.2, h: 0.38, fontSize: 15, fontFace: MONO, bold: true, color: C.ink, align: "center", margin: 0 });
  s.addText("대학원생 / 사진 좋아하는\n감성 밀레니얼·Z세대", { x: 0.7, y: 4.62, w: 3.2, h: 0.52, fontSize: 11, fontFace: BODY, color: C.muted, align: "center", lineSpacingMultiple: 1.3, margin: 0 });

  const traits = ["일상 사진 자주 촬영", "음악은 무드로 선택", "아날로그 물건 수집", "Spotify 헤비유저"];
  traits.forEach((t, i) => {
    dot(s, 0.72, 5.3 + i * 0.25, 0.07, C.accent);
    s.addText(t, { x: 0.88, y: 5.24 + i * 0.25, w: 3.0, h: 0.24, fontSize: 10.5, fontFace: BODY, color: C.muted, margin: 0 });
  });

  // Scenario steps
  const steps = [
    { step: "01", action: "사진 촬영", detail: "산책 중 노을 사진을 찍는다. 앱을 열고 TAKE PHOTO 버튼을 탭한다." },
    { step: "02", action: "무드 분석", detail: "셔터 플래시 후 폴라로이드가 인화된다. Gemini가 '따뜻함, 그리움'을 읽는다." },
    { step: "03", action: "음악 재생", detail: "페이더가 PLAYER로 이동. LP가 돌기 시작하며 IU의 '밤편지'가 흐른다." },
    { step: "04", action: "추억 저장", detail: "♡ 탭 → 페이더가 LIBRARY로. 폴라로이드가 보드에 툭 떨어진다." },
  ];

  steps.forEach(({ step, action, detail }, i) => {
    const x = 4.45;
    const y = 1.92 + i * 1.12;

    s.addShape(pres.ShapeType.rect, { x, y, w: 8.35, h: 1.0, fill: { color: i % 2 === 0 ? "F0EDE4" : "EAEAE0" }, line: { color: C.borderLt } });
    // Step num
    s.addShape(pres.ShapeType.rect, { x, y, w: 0.55, h: 1.0, fill: { color: i === 3 ? C.accent : C.accentDim }, line: { type: "none" } });
    s.addText(step, { x, y: y + 0.3, w: 0.55, h: 0.4, fontSize: 15, fontFace: MONO, bold: true, color: C.white, align: "center", margin: 0 });
    s.addText(action, { x: x + 0.7, y: y + 0.08, w: 2.2, h: 0.38, fontSize: 15, fontFace: MONO, bold: true, color: C.ink, margin: 0 });
    s.addText(detail, { x: x + 0.7, y: y + 0.48, w: 7.4, h: 0.45, fontSize: 11.5, fontFace: BODY, color: C.muted, lineSpacingMultiple: 1.3, margin: 0 });

    // Arrow connector
    if (i < 3) {
      s.addText("↓", { x: x + 3.9, y: y + 0.98, w: 0.55, h: 0.14, fontSize: 10, fontFace: MONO, color: C.muted, align: "center", margin: 0 });
    }
  });

  slideNum(s, 5, true);
}

// ─────────────────────────────────────────
//  SLIDE 6 · DESIGN PHILOSOPHY
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgDark };

  label(s, "05 / DESIGN PHILOSOPHY", 0.55, 0.4);

  // Big concept word
  s.addText("DIGILOG", {
    x: -0.1, y: 1.0, w: 13.5, h: 3.5,
    fontSize: 180, fontFace: MONO, bold: true, charSpacing: 2,
    color: "141414", margin: 0
  });

  // Overlay explanation
  s.addText("DIGITAL", { x: 0.55, y: 1.5, w: 5, h: 0.8, fontSize: 42, fontFace: MONO, bold: true, color: C.white, margin: 0 });
  s.addText("+", { x: 5.2, y: 1.5, w: 1.5, h: 0.8, fontSize: 42, fontFace: MONO, bold: true, color: C.accent, margin: 0 });
  s.addText("ANALOG", { x: 6.3, y: 1.5, w: 5, h: 0.8, fontSize: 42, fontFace: MONO, bold: true, color: C.white, margin: 0 });

  hline(s, 0.55, 2.5, 12.2, C.border);

  s.addText(
    "디지털의 편의와 아날로그의 물성·감성을 동시에 추구하는 디자인 철학.\n" +
    "Dumchtax Player는 스마트폰 앱이지만 폴라로이드 카메라처럼, " +
    "Spotify이지만 LP 플레이어처럼 경험된다.",
    { x: 0.55, y: 2.7, w: 9, h: 1.2, fontSize: 15, fontFace: BODY, color: C.secondary, lineSpacingMultiple: 1.6, margin: 0 }
  );

  // 4 principles
  const principles = [
    { sym: "◈", title: "TACTILE FIRST", desc: "드래그·햅틱·물리 기반 인터랙션" },
    { sym: "◉", title: "OBJECT UX", desc: "폴라로이드·LP·카메라 오브제 중심" },
    { sym: "◫", title: "ANALOG TIME", desc: "즉각성 없는 여백, 인화 대기의 미학" },
    { sym: "◬", title: "DARK CANVAS", desc: "빛을 담는 어두운 배경, 감성 집중" },
  ];

  principles.forEach(({ sym, title, desc }, i) => {
    const x = 0.55 + i * 3.16;
    s.addText(sym, { x, y: 4.3, w: 0.5, h: 0.5, fontSize: 20, fontFace: MONO, color: C.accent, margin: 0 });
    s.addText(title, { x, y: 4.82, w: 2.8, h: 0.35, fontSize: 11.5, fontFace: MONO, bold: true, charSpacing: 2, color: C.white, margin: 0 });
    s.addText(desc, { x, y: 5.2, w: 2.9, h: 0.35, fontSize: 11, fontFace: BODY, color: C.secondary, margin: 0 });
    if (i > 0) hline(s, x - 0.18, 4.3, 0.01, C.border, 1.4);
  });

  // Bottom quote
  hline(s, 0.55, 5.78, 12.2, C.border);
  s.addText(
    '"손에 잡히는 것처럼 느껴지는 디지털. 기억되는 음악."',
    { x: 0.55, y: 6.0, w: 12, h: 0.4, fontSize: 13, fontFace: BODY, italic: true, color: C.secondary, align: "center", margin: 0 }
  );

  slideNum(s, 6);
}

// ─────────────────────────────────────────
//  SLIDE 7 · COLOR SYSTEM
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgMid };

  label(s, "06 / DESIGN SYSTEM — COLOR", 0.55, 0.4);
  s.addText("COLOR", { x: 0.55, y: 0.72, w: 9, h: 0.95, fontSize: 52, fontFace: MONO, bold: true, charSpacing: 5, color: C.white, margin: 0 });
  s.addText("SYSTEM", { x: 3.55, y: 0.72, w: 9, h: 0.95, fontSize: 52, fontFace: MONO, bold: true, charSpacing: 5, color: C.accent, margin: 0 });

  hline(s, 0.55, 1.75, 12.2, C.border);

  const colors = [
    { hex: "0A0A0A", name: "BG DARK",    role: "Primary background",   x: 0.55,  textColor: C.white,     dark: true  },
    { hex: "141414", name: "SURFACE",    role: "Elevated surface",      x: 2.9,   textColor: C.white,     dark: true  },
    { hex: "2C2C2C", name: "BORDER",     role: "Dividers & lines",     x: 5.25,  textColor: C.secondary, dark: true  },
    { hex: "913439", name: "ACCENT",     role: "Primary action, REC",  x: 7.6,   textColor: C.white,     dark: true  },
    { hex: "5C1F22", name: "ACCENT DIM", role: "Hover / pressed state", x: 9.95,  textColor: C.secondary, dark: true  },
    { hex: "F0EDE4", name: "POLAROID",   role: "Card, paper surface",  x: 0.55,  textColor: C.muted,     dark: false, row: 1 },
    { hex: "F5F5F0", name: "BG LIGHT",   role: "Content page bg",      x: 2.9,   textColor: C.muted,     dark: false, row: 1 },
    { hex: "5A5A5A", name: "MUTED",      role: "Body text on light",   x: 5.25,  textColor: C.white,     dark: true,  row: 1 },
    { hex: "9A9A9A", name: "SECONDARY",  role: "Captions on dark bg",  x: 7.6,   textColor: C.ink,       dark: false, row: 1 },
    { hex: "DEDAD0", name: "BORDER LT",  role: "Dividers on light bg", x: 9.95,  textColor: C.muted,     dark: false, row: 1 },
  ];

  colors.forEach(({ hex, name, role, x, textColor, dark, row = 0 }) => {
    const y = 2.05 + row * 2.35;
    const sw = 2.1, sh = 1.85;
    s.addShape(pres.ShapeType.rect, { x, y, w: sw, h: sh, fill: { color: hex }, line: { color: dark ? "222222" : "DDDDDD", width: 0.5 } });
    s.addText(`#${hex}`, { x, y: y + sh - 0.55, w: sw, h: 0.28, fontSize: 10.5, fontFace: MONO, color: textColor, margin: [0, 0, 0, 8] });
    s.addText(name, { x, y: y + sh + 0.06, w: sw, h: 0.3, fontSize: 10, fontFace: MONO, bold: true, charSpacing: 2, color: C.white, margin: 0 });
    s.addText(role, { x, y: y + sh + 0.35, w: sw, h: 0.28, fontSize: 9.5, fontFace: BODY, color: C.secondary, margin: 0 });
  });

  slideNum(s, 7);
}

// ─────────────────────────────────────────
//  SLIDE 8 · TYPOGRAPHY & COMPONENTS
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  label(s, "07 / DESIGN SYSTEM — TYPE & COMPONENTS", 0.55, 0.4, true);
  s.addText("TYPOGRAPHY\n& COMPONENTS", { x: 0.55, y: 0.72, w: 10, h: 1.55, fontSize: 44, fontFace: MONO, bold: true, charSpacing: 3, color: C.ink, lineSpacingMultiple: 1.0, margin: 0 });

  hline(s, 0.55, 2.35, 5.4, C.borderLt, 0.01);

  // Type scale
  const typeScale = [
    { name: "DISPLAY",   font: MONO,  size: 28, weight: "Bold",    sample: "DUMCHTAX",        desc: "40–64px / Consolas Bold / 한글 대제목" },
    { name: "HEADING",   font: MONO,  size: 18, weight: "Bold",    sample: "LP PLAYER",        desc: "20–28px / Consolas Bold / 섹션 제목" },
    { name: "LABEL",     font: MONO,  size: 11, weight: "Regular", sample: "ISO 800  ●  REC",  desc: "10–12px / Consolas / 캡션·태그·라벨" },
    { name: "BODY",      font: BODY,  size: 13, weight: "Regular", sample: "무드가 음악이 되는 순간",   desc: "13–15px / Calibri / 설명 본문" },
    { name: "HANDWRITE", font: "Brush Script MT", size: 14, weight: "Italic", sample: "Sun-Drenched", desc: "16px / Script / 폴라로이드 캡션" },
  ];

  typeScale.forEach(({ name, font, size, weight, sample, desc }, i) => {
    const y = 2.58 + i * 0.88;
    s.addText(name, { x: 0.55, y, w: 1.4, h: 0.32, fontSize: 9, fontFace: MONO, charSpacing: 2, color: C.muted, margin: 0 });
    s.addText(sample, { x: 2.05, y: y - 0.04, w: 3.0, h: 0.55, fontSize: size, fontFace: font, bold: weight === "Bold", italic: weight === "Italic", color: C.ink, margin: 0 });
    s.addText(desc, { x: 5.0, y: y + 0.06, w: 1.35, h: 0.4, fontSize: 9, fontFace: BODY, color: C.muted, lineSpacingMultiple: 1.2, margin: 0 });
    hline(s, 0.55, y + 0.72, 5.9, C.borderLt, 0.01);
  });

  // Vertical divider
  hline(s, 6.55, 0.4, 0.01, C.borderLt, 6.8);

  // Components column
  s.addText("KEY COMPONENTS", { x: 6.85, y: 0.4, w: 6, h: 0.35, fontSize: 10, fontFace: MONO, charSpacing: 3, color: C.muted, margin: 0 });

  // Polaroid component sketch
  polaroidShape(s, 6.9, 0.9, 2.4, 2.0, { photoBg: "D0CCC0", caption: "Golden Hour", shadow: false });
  s.addText("POLAROID CARD", { x: 9.5, y: 1.15, w: 2.7, h: 0.3, fontSize: 11, fontFace: MONO, bold: true, color: C.ink, margin: 0 });
  s.addText("cream frame F0EDE4\n16px padding\nscript caption font\nrandom tilt ±10°", { x: 9.5, y: 1.5, w: 3.0, h: 0.85, fontSize: 10, fontFace: BODY, color: C.muted, lineSpacingMultiple: 1.4, margin: 0 });

  // LP component sketch
  lpShape(s, 6.9, 3.6, 1.8, "B0ACA0");
  s.addText("LP DISC", { x: 8.95, y: 3.75, w: 3.2, h: 0.3, fontSize: 11, fontFace: MONO, bold: true, color: C.ink, margin: 0 });
  s.addText("黑 vinyl 0D0D0D\n중앙 이미지 회전\n1.8s/rev playing\npause = stop", { x: 8.95, y: 4.1, w: 3.2, h: 0.85, fontSize: 10, fontFace: BODY, color: C.muted, lineSpacingMultiple: 1.4, margin: 0 });

  // Fader component
  s.addShape(pres.ShapeType.rect, { x: 6.9, y: 5.7, w: 3.5, h: 0.18, fill: { color: "D0CCC0" }, line: { color: C.borderLt } });
  // Notches
  [0, 1.75, 3.5].forEach(nx => {
    s.addShape(pres.ShapeType.rect, { x: 6.9 + nx - 0.01, y: 5.64, w: 0.02, h: 0.3, fill: { color: "A0A0A0" }, line: { type: "none" } });
  });
  // Knob
  s.addShape(pres.ShapeType.rect, { x: 7.6, y: 5.56, w: 0.7, h: 0.34, fill: { color: C.bgPaper }, line: { color: "C0BCB0" } });
  dot(s, 7.93, 5.7, 0.09, C.accent);
  s.addText("FADER NAV", { x: 10.55, y: 5.65, w: 2.5, h: 0.3, fontSize: 11, fontFace: MONO, bold: true, color: C.ink, margin: 0 });
  s.addText("3 notch positions\nhaptic on pass\nmagnetic snap 300px/s\n1:1 content drag", { x: 10.55, y: 5.95, w: 2.5, h: 0.9, fontSize: 10, fontFace: BODY, color: C.muted, lineSpacingMultiple: 1.4, margin: 0 });

  slideNum(s, 8, true);
}

// ─────────────────────────────────────────
//  SLIDE 9 · USER FLOW
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  label(s, "08 / USER FLOW", 0.55, 0.4, true);
  s.addText("3-PAGE FLOW", { x: 0.55, y: 0.72, w: 9, h: 0.9, fontSize: 44, fontFace: MONO, bold: true, charSpacing: 4, color: C.ink, margin: 0 });

  hline(s, 0.55, 1.72, 12.2, C.borderLt, 0.01);

  // Screen boxes
  const screens = [
    {
      name: "HOME",
      icon: "⌂",
      color: "1A2030",
      steps: ["CHOOSE PHOTO\nor TAKE PHOTO", "셔터 플래시\n폴라로이드 인화", "Gemini API\n무드 분석"],
      x: 0.55
    },
    {
      name: "PLAYER",
      icon: "◉",
      color: "1A1A0A",
      steps: ["LP 회전 시작\n페이더 이동", "♡ 탭 → 저장\n음악 재생 중", "PREV / NEXT\n볼륨 페이더"],
      x: 4.72
    },
    {
      name: "LIBRARY",
      icon: "▣",
      color: "1A1A2A",
      steps: ["폴라로이드 낙하\n보드에 저장", "카드 탭 →\n재생 복원", "REC PLAYBACK\nLOG 리셔플"],
      x: 8.9
    },
  ];

  screens.forEach(({ name, icon, color, steps, x }) => {
    // Phone mockup frame
    s.addShape(pres.ShapeType.rect, { x, y: 1.95, w: 3.85, h: 4.95, fill: { color: "E5E2D8" }, line: { color: C.borderLt, width: 0.5 }, rectRadius: 0.22 });
    s.addShape(pres.ShapeType.rect, { x: x + 0.18, y: 2.13, w: 3.49, h: 4.59, fill: { color }, line: { color: "444444", width: 0.5 }, rectRadius: 0.15 });
    // Screen label
    s.addText(icon, { x, y: 2.15, w: 3.85, h: 0.55, fontSize: 24, fontFace: MONO, color: C.white, align: "center", margin: 0 });
    s.addText(name, { x, y: 2.65, w: 3.85, h: 0.45, fontSize: 18, fontFace: MONO, bold: true, charSpacing: 5, color: C.white, align: "center", margin: 0 });

    // Steps
    steps.forEach((step, i) => {
      const sy = 3.25 + i * 1.1;
      s.addShape(pres.ShapeType.rect, { x: x + 0.3, y: sy, w: 3.25, h: 0.9, fill: { color: "FFFFFF", transparency: 88 }, line: { type: "none" } });
      s.addText(`${i + 1}`, { x: x + 0.32, y: sy + 0.08, w: 0.3, h: 0.3, fontSize: 9, fontFace: MONO, color: C.accent, bold: true, margin: 0 });
      s.addText(step, { x: x + 0.62, y: sy + 0.04, w: 2.8, h: 0.82, fontSize: 10.5, fontFace: BODY, color: C.white, lineSpacingMultiple: 1.3, margin: 0 });
    });

    // Page dot indicator at bottom
    [0, 1, 2].forEach((d, di) => {
      const isActive = ["HOME","PLAYER","LIBRARY"].indexOf(name) === di;
      dot(s, x + 1.6 + di * 0.3, 6.6, isActive ? 0.1 : 0.07, isActive ? C.accent : C.secondary);
    });
  });

  // Arrows between screens
  [4.45, 8.62].forEach(ax => {
    s.addText("→", { x: ax, y: 3.85, w: 0.5, h: 0.5, fontSize: 24, fontFace: MONO, color: C.accent, align: "center", margin: 0 });
    s.addText("FADER\nSNAP", { x: ax - 0.08, y: 4.38, w: 0.65, h: 0.45, fontSize: 8.5, fontFace: MONO, color: C.muted, align: "center", lineSpacingMultiple: 1.2, charSpacing: 1, margin: 0 });
  });

  // Return arrow
  s.addShape(pres.ShapeType.rect, { x: 0.55, y: 7.12, w: 12.3, h: 0.012, fill: { color: C.borderLt }, line: { type: "none" } });

  slideNum(s, 9, true);
}

// ─────────────────────────────────────────
//  SLIDE 10 · KEY SCREEN — HOME
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgDark };

  label(s, "09 / KEY SCREEN — HOME", 0.55, 0.4);
  s.addText("HOME", { x: 0.55, y: 0.72, w: 5, h: 0.9, fontSize: 52, fontFace: MONO, bold: true, charSpacing: 5, color: C.white, margin: 0 });
  s.addText("CAPTURE THE MOMENT", { x: 0.55, y: 1.65, w: 7, h: 0.38, fontSize: 13, fontFace: MONO, charSpacing: 3, color: C.accent, margin: 0 });

  hline(s, 0.55, 2.1, 12.2, C.border);

  // Camera illustration
  cameraShape(s, 0.55, 2.4, 3.2, 2.6);

  // Arrow
  s.addText("→", { x: 3.95, y: 3.4, w: 0.6, h: 0.5, fontSize: 26, fontFace: MONO, color: C.accent, align: "center", margin: 0 });

  // Polaroid printout
  polaroidShape(s, 4.75, 2.3, 2.6, 2.2, { photoBg: "253045", caption: "Mood: Nostalgic" });

  // Features callouts
  const callouts = [
    { title: "ISO 800 ● REC", desc: "카메라 스테이터스 레이블 — 아날로그 카메라 감성", y: 2.2 },
    { title: "SHUTTER FLASH", desc: "촬영 시 화면 전체 플래시 → 폴라로이드 슬롯 배출 애니메이션", y: 3.05 },
    { title: "필름 인화 애니메이션", desc: "흑백 → 컬러 + blur 해제 + grain 페이드 (약 2.4초)", y: 3.9 },
    { title: "CHOOSE / TAKE PHOTO", desc: "갤러리 선택 or 카메라 촬영 듀얼 입력 방식", y: 4.75 },
  ];

  callouts.forEach(({ title, desc, y }) => {
    dot(s, 7.75, y + 0.07, 0.08);
    s.addText(title, { x: 7.98, y, w: 5.0, h: 0.3, fontSize: 11.5, fontFace: MONO, bold: true, color: C.white, margin: 0 });
    s.addText(desc, { x: 7.98, y: y + 0.3, w: 5.1, h: 0.4, fontSize: 11, fontFace: BODY, color: C.secondary, lineSpacingMultiple: 1.3, margin: 0 });
    hline(s, 7.98, y + 0.7, 5.1, C.border);
  });

  // Gemini flow diagram
  s.addShape(pres.ShapeType.rect, { x: 0.55, y: 5.9, w: 12.2, h: 1.1, fill: { color: C.bgMid }, line: { color: C.border } });
  const flow = ["PHOTO", "→", "GEMINI VISION", "→", "MOOD KEYWORDS", "→", "YOUTUBE SEARCH"];
  const fcols = ["F5F5F0", C.border, C.accent, C.border, "F5F5F0", C.border, "F5F5F0"];
  flow.forEach((f, i) => {
    s.addText(f, {
      x: 0.75 + i * 1.72, y: 6.15, w: 1.5, h: 0.55,
      fontSize: i % 2 === 1 ? 20 : 11, fontFace: MONO, bold: i % 2 !== 1,
      color: fcols[i], align: "center", charSpacing: i % 2 === 0 ? 1 : 0, margin: 0
    });
  });

  slideNum(s, 10);
}

// ─────────────────────────────────────────
//  SLIDE 11 · KEY SCREEN — PLAYER
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgDark };

  label(s, "10 / KEY SCREEN — PLAYER", 0.55, 0.4);
  s.addText("PLAYER", { x: 0.55, y: 0.72, w: 5, h: 0.9, fontSize: 52, fontFace: MONO, bold: true, charSpacing: 5, color: C.white, margin: 0 });
  s.addText("THE MUSIC STARTS", { x: 0.55, y: 1.65, w: 7, h: 0.38, fontSize: 13, fontFace: MONO, charSpacing: 3, color: C.accent, margin: 0 });

  hline(s, 0.55, 2.1, 12.2, C.border);

  // LP + glow
  s.addShape(pres.ShapeType.ellipse, { x: 0.6, y: 2.1, w: 4.5, h: 4.5, fill: { color: C.accentDim, transparency: 90 }, line: { type: "none" } });
  lpShape(s, 0.75, 2.2, 4.2, "30404A");

  // Polaroid overlay
  polaroidShape(s, 2.3, 4.0, 2.0, 1.7, { photoBg: "253040", caption: "IU — 밤편지", rotate: 3 });

  // Controls row
  s.addText("⏮  ▶  ⏭", { x: 1.0, y: 6.6, w: 3.2, h: 0.45, fontSize: 20, fontFace: MONO, color: C.white, align: "center", margin: 0 });

  // Callouts
  const callouts = [
    { title: "LP 회전 애니메이션",    desc: "재생 시 1.8s/rev 시계방향 회전. 일시정지 시 즉시 정지. 중앙 썸네일도 함께 회전.",  y: 2.2  },
    { title: "ACCENT GLOW",          desc: "LP 뒤에 accent 색상 glow 효과. 음악이 켜진 상태임을 공간으로 표현.",              y: 3.05 },
    { title: "♡ HEART BUTTON",       desc: "폴라로이드 우측 상단 빈 하트. 저장 시 #913439 fill. 다시 탭하면 저장 취소.",       y: 3.9  },
    { title: "VOLUME FADER",         desc: "수직 페이더로 볼륨 조절. YouTube IFrame API volume() 연동.",                     y: 4.75 },
    { title: "오디오 전용 재생",      desc: "YouTube IFrame을 -400px 오프스크린 배치. 화면은 LP + 폴라로이드만 보임.",          y: 5.6  },
  ];

  callouts.forEach(({ title, desc, y }) => {
    dot(s, 5.6, y + 0.07, 0.08);
    s.addText(title, { x: 5.83, y, w: 7.2, h: 0.3, fontSize: 11.5, fontFace: MONO, bold: true, color: C.white, margin: 0 });
    s.addText(desc, { x: 5.83, y: y + 0.3, w: 7.2, h: 0.42, fontSize: 11, fontFace: BODY, color: C.secondary, lineSpacingMultiple: 1.3, margin: 0 });
    hline(s, 5.83, y + 0.73, 7.2, C.border);
  });

  slideNum(s, 11);
}

// ─────────────────────────────────────────
//  SLIDE 12 · KEY SCREEN — LIBRARY
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgDark };

  label(s, "11 / KEY SCREEN — LIBRARY", 0.55, 0.4);
  s.addText("LIBRARY", { x: 0.55, y: 0.72, w: 6, h: 0.9, fontSize: 52, fontFace: MONO, bold: true, charSpacing: 5, color: C.white, margin: 0 });
  s.addText("SCATTERED MEMORIES", { x: 0.55, y: 1.65, w: 7, h: 0.38, fontSize: 13, fontFace: MONO, charSpacing: 3, color: C.accent, margin: 0 });

  hline(s, 0.55, 2.1, 12.2, C.border);

  // Scattered polaroids
  const cards = [
    { x: 0.4,  y: 2.3,  w: 2.3, h: 1.9, bg: "2A3545", cap: "밤편지",     rot: -8 },
    { x: 2.1,  y: 2.85, w: 2.1, h: 1.75, bg: "352535", cap: "우주를 줄게", rot: 5 },
    { x: 3.5,  y: 2.2,  w: 2.4, h: 2.0, bg: "45352A", cap: "BOYHOOD",    rot: -3 },
    { x: 0.9,  y: 4.35, w: 2.0, h: 1.65, bg: "253535", cap: "위잉위잉",   rot: 7 },
    { x: 2.5,  y: 4.8,  w: 2.2, h: 1.8, bg: "303045", cap: "기억을걷는시간", rot: -4 },
  ];

  cards.forEach(({ x, y, w, h, bg, cap, rot }) => {
    polaroidShape(s, x, y, w, h, { photoBg: bg, caption: cap, rotate: rot });
  });

  // Callouts right side
  const callouts = [
    { title: "랜덤 배치 & 자유 드래그", desc: "각 카드는 랜덤 각도·위치로 배치. 손가락으로 자유롭게 이동 가능. 위치는 localStorage 영속.", y: 2.2 },
    { title: "TAP → 재생 복원",        desc: "카드 탭 시 저장된 사진 + 음악 조합 그대로 PLAYER 화면으로 이동 & 재생.", y: 3.05 },
    { title: "♡ 저장 토글",            desc: "저장 후 다시 하트 탭 → 라이브러리에서 삭제. 중복 저장 방지 로직 내장.", y: 3.9 },
    { title: "REC PLAYBACK LOG",       desc: "버튼 탭 시 카드 위치/각도 리셔플. 기록이 '흩어진' 추억처럼 재구성됨.", y: 4.75 },
  ];

  callouts.forEach(({ title, desc, y }) => {
    dot(s, 6.1, y + 0.07, 0.08);
    s.addText(title, { x: 6.33, y, w: 6.6, h: 0.3, fontSize: 11.5, fontFace: MONO, bold: true, color: C.white, margin: 0 });
    s.addText(desc, { x: 6.33, y: y + 0.3, w: 6.6, h: 0.42, fontSize: 11, fontFace: BODY, color: C.secondary, lineSpacingMultiple: 1.3, margin: 0 });
    hline(s, 6.33, y + 0.73, 6.6, C.border);
  });

  // REC button
  s.addShape(pres.ShapeType.rect, { x: 0.4, y: 6.55, w: 5.4, h: 0.38, fill: { color: C.bgMid }, line: { color: C.border } });
  dot(s, 0.6, 6.67, 0.1, C.accent);
  s.addText("REC PLAYBACK LOG", { x: 0.8, y: 6.58, w: 4.8, h: 0.28, fontSize: 10.5, fontFace: MONO, color: C.secondary, charSpacing: 3, margin: 0 });

  slideNum(s, 12);
}

// ─────────────────────────────────────────
//  SLIDE 13 · INTERACTION — FADER NAV
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  label(s, "12 / INTERACTION — FADER NAVIGATION", 0.55, 0.4, true);
  s.addText("ANALOG FADER\nNAVIGATION", { x: 0.55, y: 0.72, w: 10, h: 1.55, fontSize: 44, fontFace: MONO, bold: true, charSpacing: 3, color: C.ink, lineSpacingMultiple: 1.0, margin: 0 });

  hline(s, 0.55, 2.35, 12.2, C.borderLt, 0.01);

  // Fader states diagram
  const states = [
    { label: "HOME (0%)", knobX: 0,    active: 0 },
    { label: "PLAYER (50%)", knobX: 1.75, active: 1 },
    { label: "LIBRARY (100%)", knobX: 3.5, active: 2 },
  ];

  states.forEach(({ label: stLabel, knobX, active }, si) => {
    const y = 2.55 + si * 1.45;
    // Track
    s.addShape(pres.ShapeType.rect, { x: 0.55, y: y + 0.07, w: 3.5, h: 0.18, fill: { color: "D8D5CC" }, line: { color: C.borderLt } });
    // Notches
    [0, 1.75, 3.5].forEach(nx => {
      s.addShape(pres.ShapeType.rect, { x: 0.54 + nx, y: y, w: 0.02, h: 0.32, fill: { color: active * 1.75 > nx - 0.1 && active * 1.75 < nx + 0.1 ? C.accent : "A0A090" }, line: { type: "none" } });
    });
    // Knob
    s.addShape(pres.ShapeType.rect, { x: 0.55 + knobX - 0.35, y: y - 0.04, w: 0.7, h: 0.34, fill: { color: C.bgPaper }, line: { color: "C0BCB0", width: 0.5 }, shadow: { type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.15 } });
    dot(s, 0.55 + knobX - 0.05, y + 0.05, 0.09, C.accent);
    s.addText(stLabel, { x: 4.3, y: y, w: 3.2, h: 0.28, fontSize: 12, fontFace: MONO, bold: true, color: C.ink, margin: 0 });
    // Labels below track
    ["HOME","PLAYER","LIBRARY"].forEach((l, li) => {
      s.addText(l, { x: 0.55 + li * 1.75 - 0.35, y: y + 0.28, w: 0.9, h: 0.22, fontSize: 8, fontFace: MONO, charSpacing: 1, color: li === active ? C.accent : C.muted, align: "center", margin: 0 });
    });
  });

  // Behavior details right side
  const behaviors = [
    { icon: "◈", title: "1:1 드래그 동기화",   desc: "페이더 드래그와 콘텐츠 스크롤이 동일 비율로 연동됩니다. 자연스러운 물리 피드백." },
    { icon: "◉", title: "눈금 통과 햅틱",      desc: "navigator.vibrate(30)으로 노치 통과 시 진동. 아날로그 믹서의 클릭 감을 재현." },
    { icon: "◫", title: "자석 스냅 300px/s",  desc: "손을 떼면 가장 가까운 위치로 스냅. 플리킹 속도 300px/s 이상이면 다음 탭으로." },
    { icon: "◬", title: "레이블 weight 보간",  desc: "현재 활성 탭 레이블은 bold, 나머지는 normal. 드래그 중 실시간 보간." },
  ];

  behaviors.forEach(({ icon, title, desc }, i) => {
    const x = 7.9;
    const y = 2.55 + i * 1.15;
    s.addShape(pres.ShapeType.rect, { x, y, w: 5.0, h: 1.0, fill: { color: i % 2 === 0 ? "EDEAE0" : C.bgPaper }, line: { color: C.borderLt } });
    s.addText(icon, { x: x + 0.15, y: y + 0.16, w: 0.4, h: 0.4, fontSize: 18, fontFace: MONO, color: C.accent, margin: 0 });
    s.addText(title, { x: x + 0.6, y: y + 0.1, w: 4.0, h: 0.32, fontSize: 13, fontFace: MONO, bold: true, color: C.ink, margin: 0 });
    s.addText(desc, { x: x + 0.6, y: y + 0.44, w: 4.2, h: 0.48, fontSize: 11, fontFace: BODY, color: C.muted, lineSpacingMultiple: 1.3, margin: 0 });
  });

  // Haptic detail
  hline(s, 0.55, 7.0, 12.2, C.borderLt, 0.01);
  s.addText("navigator.vibrate(30)  →  노치 통과    navigator.vibrate([50,30,50])  →  스냅 착지", {
    x: 0.55, y: 7.06, w: 12.2, h: 0.28, fontSize: 10, fontFace: MONO, color: C.muted, charSpacing: 1.5, margin: 0
  });

  slideNum(s, 13, true);
}

// ─────────────────────────────────────────
//  SLIDE 14 · MICRO-INTERACTIONS TABLE
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  label(s, "13 / MICRO-INTERACTIONS", 0.55, 0.4, true);
  s.addText("MICRO-ANIMATIONS\n& INTERACTIONS", { x: 0.55, y: 0.72, w: 11, h: 1.55, fontSize: 44, fontFace: MONO, bold: true, charSpacing: 3, color: C.ink, lineSpacingMultiple: 1.0, margin: 0 });

  hline(s, 0.55, 2.35, 12.2, C.borderLt, 0.01);

  // Table header
  const cols = [0.55, 3.4, 6.2, 9.6];
  const hdrs = ["INTERACTION", "TRIGGER", "ANIMATION", "PURPOSE"];
  hdrs.forEach((h, i) => {
    s.addShape(pres.ShapeType.rect, { x: cols[i], y: 2.5, w: i < 3 ? cols[i + 1] - cols[i] - 0.1 : 3.0, h: 0.32, fill: { color: C.accentDim }, line: { type: "none" } });
    s.addText(h, { x: cols[i] + 0.12, y: 2.5, w: 2.5, h: 0.32, fontSize: 9.5, fontFace: MONO, bold: true, charSpacing: 2, color: C.white, margin: 0 });
  });

  const rows = [
    ["폴라로이드 인화",  "사진 선택/촬영",   "플래시 → 토출 → 흑백→컬러 + blur + grain", "기대감 형성, 느림의 미학"],
    ["LP 회전",         "재생 시작",        "1.8s/rev CW rotate, pause = stop",         "음악 재생 상태 시각화"],
    ["폴라로이드 낙하",  "♡ 탭 저장",       "중력+bounce 물리 드롭, --angle 개인 기울기", "저장의 물성 피드백"],
    ["하트 팝 애니메이션","저장 완료",       "scale 1→1.4→1 + fill 색상 전환 300ms",     "감정적 긍정 강화"],
    ["셔터 플래시",      "촬영 버튼",       "화면 전체 #FFF 0.3s 페이드",               "카메라 실감"],
    ["노치 햅틱",        "페이더 드래그",   "navigator.vibrate(30)",                     "아날로그 촉각 피드백"],
    ["스냅 착지 햅틱",   "페이더 손 뗌",   "navigator.vibrate([50,30,50])",             "탭 전환 완료 확인"],
    ["토스트 메시지",    "저장/삭제 액션",  "bottom slide-up + fade 2s auto-dismiss",   "상태 변화 명확한 피드백"],
  ];

  rows.forEach((row, ri) => {
    const y = 2.92 + ri * 0.52;
    const bg = ri % 2 === 0 ? "F0EDE4" : "EAEAE0";
    s.addShape(pres.ShapeType.rect, { x: 0.55, y, w: 12.2, h: 0.5, fill: { color: bg }, line: { type: "none" } });
    row.forEach((cell, ci) => {
      s.addText(cell, {
        x: cols[ci] + 0.12, y: y + 0.04, w: (ci < 3 ? cols[ci + 1] - cols[ci] - 0.25 : 3.1), h: 0.44,
        fontSize: ci === 0 ? 11 : 10.5, fontFace: ci === 0 ? MONO : BODY,
        bold: ci === 0, color: ci === 0 ? C.ink : C.muted,
        lineSpacingMultiple: 1.2, margin: 0
      });
    });
  });

  slideNum(s, 14, true);
}

// ─────────────────────────────────────────
//  SLIDE 15 · TECH STACK
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgDark };

  label(s, "14 / TECHNICAL ARCHITECTURE", 0.55, 0.4);
  s.addText("TECH STACK", { x: 0.55, y: 0.72, w: 9, h: 0.9, fontSize: 52, fontFace: MONO, bold: true, charSpacing: 4, color: C.white, margin: 0 });
  s.addText("VANILLA FIRST · ZERO DEPENDENCY", { x: 0.55, y: 1.7, w: 9, h: 0.35, fontSize: 11.5, fontFace: MONO, charSpacing: 3, color: C.accent, margin: 0 });

  hline(s, 0.55, 2.15, 12.2, C.border);

  // Architecture layers
  const layers = [
    {
      layer: "FRONTEND",
      color: "1C2832",
      items: [
        { name: "HTML5", desc: "Semantic markup, 3 pages, no framework" },
        { name: "CSS3", desc: "Custom properties, keyframes, pointer events" },
        { name: "Vanilla JS", desc: "ES6+, no bundler, ~700 lines" },
      ]
    },
    {
      layer: "AI / ANALYSIS",
      color: "1E1E0A",
      items: [
        { name: "Gemini 2.5 Flash", desc: "Photo mood extraction, music query generation" },
        { name: "Gemini 2.0 Flash", desc: "Fallback model (429 rate limit short-circuit)" },
      ]
    },
    {
      layer: "MEDIA / PLAYBACK",
      color: "1E0A0A",
      items: [
        { name: "YouTube Data API v3", desc: "Music search (videoCategoryId=10, embeddable)" },
        { name: "YouTube IFrame API", desc: "Audio-only playback (player off-screen -400px)" },
      ]
    },
    {
      layer: "PERSISTENCE",
      color: "0A1E1E",
      items: [
        { name: "localStorage", desc: "Library cards, API keys, card positions" },
        { name: "CSS Variables", desc: "--angle, --color-* design tokens runtime" },
      ]
    },
  ];

  layers.forEach(({ layer, color, items }, li) => {
    const x = 0.55 + li * 3.2;
    const y = 2.35;
    const w = 3.05;

    s.addShape(pres.ShapeType.rect, { x, y, w, h: 0.35, fill: { color }, line: { color: "333333" } });
    s.addText(layer, { x: x + 0.15, y: y + 0.02, w: w - 0.2, h: 0.3, fontSize: 9.5, fontFace: MONO, bold: true, charSpacing: 2.5, color: C.accent, margin: 0 });

    items.forEach(({ name, desc }, ii) => {
      const iy = y + 0.38 + ii * 1.05;
      s.addShape(pres.ShapeType.rect, { x, y: iy, w, h: 0.95, fill: { color: C.bgMid }, line: { color: "333333" } });
      s.addText(name, { x: x + 0.15, y: iy + 0.08, w: w - 0.2, h: 0.32, fontSize: 13, fontFace: MONO, bold: true, color: C.white, margin: 0 });
      s.addText(desc, { x: x + 0.15, y: iy + 0.4, w: w - 0.2, h: 0.5, fontSize: 10.5, fontFace: BODY, color: C.secondary, lineSpacingMultiple: 1.3, margin: 0 });
    });
  });

  // Arrows between layers
  [3.6, 6.8, 10.0].forEach(ax => {
    s.addText("→", { x: ax - 0.2, y: 3.4, w: 0.4, h: 0.4, fontSize: 16, fontFace: MONO, color: C.accent, align: "center", margin: 0 });
  });

  // Key decisions
  hline(s, 0.55, 5.75, 12.2, C.border);
  const decisions = [
    { d: "No framework",     r: "배포 복잡도 최소화, 정적 서버 즉시 실행" },
    { d: "Audio-only IFrame", r: "YouTube 영상 표시 없이 음악만 재생" },
    { d: "Dual API fallback", r: "2.5-flash → 2.0-flash 자동 폴백 + 데모 모드" },
  ];
  s.addText("KEY DESIGN DECISIONS", { x: 0.55, y: 5.85, w: 4, h: 0.28, fontSize: 9.5, fontFace: MONO, charSpacing: 3, color: C.secondary, margin: 0 });
  decisions.forEach(({ d, r }, i) => {
    const x = 0.55 + i * 4.05;
    dot(s, x, 6.24, 0.08);
    s.addText(d, { x: x + 0.2, y: 6.18, w: 2.5, h: 0.28, fontSize: 11, fontFace: MONO, bold: true, color: C.white, margin: 0 });
    s.addText(r, { x: x + 0.2, y: 6.45, w: 3.6, h: 0.4, fontSize: 10.5, fontFace: BODY, color: C.secondary, lineSpacingMultiple: 1.3, margin: 0 });
  });

  slideNum(s, 15);
}

// ─────────────────────────────────────────
//  SLIDE 16 · KPI & SUCCESS METRICS
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  label(s, "15 / KPI & SUCCESS METRICS", 0.55, 0.4, true);
  s.addText("SUCCESS METRICS", { x: 0.55, y: 0.72, w: 10, h: 0.9, fontSize: 44, fontFace: MONO, bold: true, charSpacing: 3, color: C.ink, margin: 0 });

  hline(s, 0.55, 1.72, 12.2, C.borderLt, 0.01);

  const metrics = [
    { num: "< 3s",  label: "ANALYSIS TIME",   desc: "Gemini 무드 분석 완료 목표\n(현재 avg 1.8s)", priority: "P0", x: 0.55  },
    { num: "90%",   label: "MOOD MATCH RATE",  desc: "분석된 무드와 재생 음악의\n감성 일치 만족도 목표", priority: "P0", x: 3.35  },
    { num: "70%",   label: "SAVE RATE",        desc: "재생 이후 폴라로이드 저장\n전환율 목표", priority: "P1", x: 6.15  },
    { num: "2.0+",  label: "REPLAYS/CARD",     desc: "저장된 카드 재재생 평균\n횟수 목표", priority: "P1", x: 8.95  },
  ];

  metrics.forEach(({ num, label: mLabel, desc, priority, x }) => {
    const y = 2.0;
    s.addShape(pres.ShapeType.rect, { x, y, w: 2.6, h: 3.2,
      fill: { color: x === 0.55 || x === 3.35 ? C.bgPaper : "EAEAE0" },
      line: { color: C.borderLt }
    });
    s.addShape(pres.ShapeType.rect, { x, y, w: 2.6, h: 0.32, fill: { color: priority === "P0" ? C.accent : C.accentDim }, line: { type: "none" } });
    s.addText(priority, { x, y, w: 2.6, h: 0.32, fontSize: 10, fontFace: MONO, bold: true, color: C.white, align: "center", charSpacing: 2, margin: 0 });
    s.addText(num, { x, y: y + 0.42, w: 2.6, h: 1.2, fontSize: 64, fontFace: MONO, bold: true, color: C.accent, align: "center", margin: 0 });
    s.addText(mLabel, { x: x + 0.12, y: y + 1.7, w: 2.36, h: 0.35, fontSize: 11, fontFace: MONO, bold: true, charSpacing: 2, color: C.ink, align: "center", margin: 0 });
    s.addText(desc, { x: x + 0.12, y: y + 2.1, w: 2.36, h: 0.85, fontSize: 10.5, fontFace: BODY, color: C.muted, align: "center", lineSpacingMultiple: 1.35, margin: 0 });
  });

  // UX Goals
  hline(s, 0.55, 5.45, 12.2, C.borderLt, 0.01);
  s.addText("UX QUALITY GOALS", { x: 0.55, y: 5.55, w: 4, h: 0.28, fontSize: 10, fontFace: MONO, charSpacing: 3, color: C.muted, margin: 0 });

  const uxGoals = [
    "첫 사용 30초 내 음악 재생 도달 (Zero Config Path)",
    "폴라로이드 드롭 애니메이션 이질감 없이 자연스럽게 (Delight Quality)",
    "API 키 없이도 데모 모드로 핵심 경험 전달 (Resilient UX)",
    "Library 카드 재재생 시 \"그때 그 기분\" 감성 재현 (Emotional Continuity)",
  ];

  uxGoals.forEach((g, i) => {
    dot(s, 0.55, 5.98 + i * 0.3, 0.08);
    s.addText(g, { x: 0.78, y: 5.92 + i * 0.3, w: 12.0, h: 0.28, fontSize: 12, fontFace: BODY, color: C.muted, margin: 0 });
  });

  slideNum(s, 16, true);
}

// ─────────────────────────────────────────
//  SLIDE 17 · CLOSING
// ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgDark };

  // Top accent
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.05, fill: { color: C.accent }, line: { color: C.accent } });

  // Big quote
  s.addText('"사진 한 장이\n음악이 되는 순간"', {
    x: 0.55, y: 1.0, w: 9, h: 3.2,
    fontSize: 64, fontFace: MONO, bold: true, charSpacing: 2,
    color: C.white, lineSpacingMultiple: 1.1, margin: 0
  });
  s.addText("— Dumchtax Player, 2025", {
    x: 0.55, y: 4.1, w: 7, h: 0.5,
    fontSize: 16, fontFace: MONO, italic: true, charSpacing: 2, color: C.secondary, margin: 0
  });

  hline(s, 0.55, 4.85, 12.2, C.border);

  // Contact
  s.addText("윤다빈  /  YUNDABIN", {
    x: 0.55, y: 5.1, w: 7, h: 0.5,
    fontSize: 22, fontFace: MONO, charSpacing: 2, color: C.white, margin: 0
  });
  s.addText("UX · UI DESIGNER", {
    x: 0.55, y: 5.6, w: 5, h: 0.35,
    fontSize: 12.5, fontFace: MONO, charSpacing: 4, color: C.accent, margin: 0
  });

  const links = [
    { icon: "⌁", label: "GITHUB", val: "github.com/manybean916/dumchtax.player" },
  ];
  links.forEach(({ icon, label: lLabel, val }, i) => {
    dot(s, 0.55, 6.22 + i * 0.38, 0.09);
    s.addText(`${lLabel}  ·  ${val}`, { x: 0.78, y: 6.16 + i * 0.38, w: 8, h: 0.3, fontSize: 12, fontFace: MONO, color: C.mutedLt, margin: 0 });
  });

  // Right side: stacked polaroids
  polaroidShape(s, 9.4, 0.8, 3.0, 2.5, { photoBg: "30404A", caption: "Scattered Memories", rotate: -6 });
  polaroidShape(s, 9.9, 2.0, 2.8, 2.3, { photoBg: "402830", caption: "Golden Hour", rotate: 8 });
  polaroidShape(s, 9.6, 3.5, 2.6, 2.1, { photoBg: "2A3040", caption: "밤편지", rotate: -3 });

  // Bottom line
  hline(s, 0, H - 0.04, W, C.accentDim, 0.04);

  s.addText("DUMCHTAX PLAYER", { x: W / 2 - 2.5, y: H - 0.38, w: 5, h: 0.28, fontSize: 9.5, fontFace: MONO, charSpacing: 4, color: C.border, align: "center", margin: 0 });
}

// ─────────────────────────────────────────
//  EXPORT
// ─────────────────────────────────────────
pres.writeFile({ fileName: "dumchtax-portfolio.pptx" })
  .then(() => console.log("✓ dumchtax-portfolio.pptx saved"))
  .catch(e => { console.error("✗", e); process.exit(1); });
