const express = require('express'), http = require('http'), { Server } = require('socket.io');
const app = express(), srv = http.createServer(app), io = new Server(srv);
app.use(express.static('public'));

// ── 문제 은행: 여기에 계속 추가하면 됩니다 ──
// [힌트, 초성, [정답들]]
const CHO = [
  ['음식', 'ㅂㅂㅂ', ['비빔밥']], ['음식', 'ㄷㄲㅅ', ['돈까스']], ['음식', 'ㅊㅋ', ['치킨']], ['음식', 'ㅅㄱㅅ', ['삼겹살']], ['음식', 'ㅇㅁㄷ', ['왕만두']]
  ['간식', 'ㄸㅂㅇ', ['떡볶이']], ['간식', 'ㅇㅇㅅㅋㄹ', ['아이스크림']], ['과일', 'ㅂㄴㄴ', ['바나나']], ['과일', 'ㄱㄷㅋㅇ', ['골드키위']]
  ['동물', 'ㅋㄲㄹ', ['코끼리']], ['동물', 'ㄱㄹㄹ', ['고릴라']], ['교통', 'ㅈㅎㅊ', ['지하철']], ['직업', 'ㅅㅅㄴ', ['선생님']], ['직업', 'ㄹㅌㅅㅌ', ['루트세터']],
  ['가수', 'ㅂㅌㅅㄴㄷ', ['방탄소년단', 'bts']], ['브랜드', 'ㅅㅅ', ['삼성']], ['장소', 'ㄴㄹㅂ', ['노래방']],
];
// [이모지, 정답들]
const MOVIE = [
  ['🦁👑', ['라이온킹']], ['🚢🧊❤️', ['타이타닉']], ['🕷️🧑', ['스파이더맨']], ['👸❄️⛄', ['겨울왕국']],
  ['🦈🌊', ['죠스']], ['🐠🔍', ['니모를찾아서', '니모']], ['🧙⚡👓', ['해리포터']], ['🦖🏝️', ['쥬라기공원', '쥬라기월드']],
  ['🤖🚗', ['트랜스포머']], ['🧸🤠', ['토이스토리']], ['🚗💨😠', ['분노의질주']], ['🏫🧟', ['지금우리학교는']],
];

const rooms = {};
const pick = (a, n) => [...a].sort(() => Math.random() - .5).slice(0, n);
const norm = s => String(s).replace(/\s/g, '').toLowerCase();
const newCode = () => { let c; do { c = Math.random().toString(36).slice(2, 6).toUpperCase(); } while (rooms[c]); return c; };
const pub = r => ({ code: r.code, phase: r.phase, host: r.host,
  players: Object.entries(r.players).map(([id, p]) => ({ id, name: p.name, score: p.score })) });
const send = r => io.to(r.code).emit('state', pub(r));

function begin(r) {
  r.steps = [
    ...pick(CHO, 3).map(q => ({ t: 'quiz', title: '초성 퀴즈', hint: q[0], q: q[1], a: q[2], sec: 20 })),
    ...pick(MOVIE, 3).map(q => ({ t: 'quiz', title: '영화 맞히기', hint: '이모지로 영화 제목을 맞혀요', q: q[0], a: q[1], sec: 20 })),
    { t: 'tap', title: '연타왕', hint: '7초 동안 최대한 많이 누르세요!', sec: 7 },
  ];
  r.i = -1;
  Object.values(r.players).forEach(p => p.score = 0);
  next(r);
}
function next(r) {
  r.i++;
  if (r.i >= r.steps.length) { r.phase = 'end'; return send(r); }
  const s = r.steps[r.i];
  r.phase = 'play'; r.over = false; r.done = {}; r.taps = {}; r.start = Date.now();
  io.to(r.code).emit('step', { i: r.i, n: r.steps.length, t: s.t, title: s.title, hint: s.hint, q: s.q, sec: s.sec });
  send(r);
  clearTimeout(r.timer);
  r.timer = setTimeout(() => finish(r), s.sec * 1000);
}
function finish(r) {
  if (r.over) return;
  r.over = true; clearTimeout(r.timer);
  const s = r.steps[r.i];
  if (s.t === 'tap') {
    Object.entries(r.taps).sort((a, b) => b[1] - a[1]).forEach(([id, n], k) => {
      if (r.players[id]) { const g = Math.max(100 - k * 20, 20); r.players[id].score += g; r.done[id] = g; }
    });
  }
  send(r);
  io.to(r.code).emit('result', { answer: s.t === 'quiz' ? s.a[0] : null, taps: r.taps, gained: r.done });
  r.timer = setTimeout(() => next(r), 4500);
}

io.on('connection', s => {
  let r = null;
  const join = (c, name, cb) => {
    const R = rooms[c];
    if (!R) return cb({ err: '없는 방이에요. 코드를 다시 확인해 주세요.' });
    if (R.phase !== 'lobby') return cb({ err: '이미 시작한 방이에요.' });
    if (Object.keys(R.players).length >= 12) return cb({ err: '방이 꽉 찼어요. (최대 12명)' });
    r = R; r.players[s.id] = { name: String(name || '').slice(0, 8) || '익명', score: 0 };
    s.join(c); cb({ ok: 1, code: c }); send(r);
  };
  s.on('create', (name, cb) => {
    const c = newCode();
    rooms[c] = { code: c, phase: 'lobby', host: s.id, players: {}, steps: [], i: 0, over: false };
    join(c, name, cb);
  });
  s.on('join', (c, name, cb) => join(String(c).toUpperCase(), name, cb));
  s.on('start', () => { if (r && r.host === s.id && r.phase === 'lobby') begin(r); });
  s.on('again', () => { if (r && r.host === s.id && r.phase === 'end') { r.phase = 'lobby'; send(r); } });
  s.on('answer', (t, cb) => {
    if (!r || r.phase !== 'play' || r.over) return;
    const st = r.steps[r.i];
    if (st.t !== 'quiz' || r.done[s.id]) return;
    if (st.a.some(a => norm(a) === norm(t))) {
      const left = st.sec * 1000 - (Date.now() - r.start);
      const g = 50 + Math.round(50 * Math.max(left, 0) / (st.sec * 1000));
      r.players[s.id].score += g; r.done[s.id] = g;
      cb(true);
      io.to(r.code).emit('solved', { name: r.players[s.id].name, g });
      if (Object.keys(r.done).length >= Object.keys(r.players).length) finish(r); else send(r);
    } else cb(false);
  });
  s.on('tap', () => {
    if (!r || r.phase !== 'play' || r.over || r.steps[r.i].t !== 'tap') return;
    r.taps[s.id] = (r.taps[s.id] || 0) + 1;
  });
  s.on('disconnect', () => {
    if (!r) return;
    delete r.players[s.id];
    const ids = Object.keys(r.players);
    if (!ids.length) { clearTimeout(r.timer); delete rooms[r.code]; return; }
    if (r.host === s.id) r.host = ids[0];
    send(r);
  });
});

srv.listen(process.env.PORT || 3000, () => console.log('열렸어요 → http://localhost:' + (process.env.PORT || 3000)));
