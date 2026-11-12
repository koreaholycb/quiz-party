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
  ['음식', 'ㄱㅂ', ['김밥', '국밥']], ['음식', 'ㅉㅈㅁ', ['짜장면']], ['음식', 'ㅉㅃ', ['짬뽕']],
  ['음식', 'ㄱㅊㅉㄱ', ['김치찌개']], ['음식', 'ㄷㅈㅉㄱ', ['된장찌개']],
  ['음식', 'ㅂㄷㅉㄱ', ['부대찌개']], ['음식', 'ㄴㅁ', ['냉면']], ['음식', 'ㅎㅂㄱ', ['햄버거']],
  ['음식', 'ㅂㄱㄱ', ['불고기']], ['음식', 'ㄱㅈㅌ', ['감자탕']],
  ['간식', 'ㅂㅇㅃ', ['붕어빵']], ['간식', 'ㅁㅋㄹ', ['마카롱']], ['간식', 'ㅎㄷㄱ', ['핫도그']],
  ['음료', 'ㅇㅁㄹㅋㄴ', ['아메리카노']], ['술', 'ㅁㄱㄹ', ['막걸리']],
  ['과일', 'ㅂㅅㅇ', ['복숭아']], ['과일', 'ㅍㅇㅇㅍ', ['파인애플']],
  ['동물', 'ㄱㄹ', ['기린', '고래']], ['동물', 'ㄱㅅㄷㅊ', ['고슴도치']], ['동물', 'ㅍㄱ', ['펭귄']],
  ['동물', 'ㅋㅁㄹㅇ', ['카멜레온']], ['동물', 'ㄷㄹㅈ', ['다람쥐']],
  ['장소', 'ㄴㅇㄱㅇ', ['놀이공원']], ['장소', 'ㄷㅅㄱ', ['도서관']], ['장소', 'ㅍㅇㅈ', ['편의점']],
  ['장소', 'ㅉㅈㅂ', ['찜질방']], ['장소', 'ㅇㅎㄱ', ['영화관']], ['장소', 'ㅁㅇㅌ', ['목욕탕']],
  ['직업', 'ㅅㅂㄱ', ['소방관']], ['직업', 'ㅂㅎㅅ', ['변호사']], ['직업', 'ㅇㄹㅅ', ['요리사']],
  ['가전', 'ㄴㅈㄱ', ['냉장고']], ['가전', 'ㅇㅇㅋ', ['에어컨']], ['물건', 'ㅂㅈㅂㅌㄹ', ['보조배터리']],
  ['물건', 'ㅇㅇㅍ', ['이어폰', '아이폰']], ['물건', 'ㄹㅁㅋ', ['리모컨']],
  ['앱/브랜드', 'ㅋㅋㅇㅌ', ['카카오톡']], ['앱/브랜드', 'ㅇㅅㅌㄱㄹ', ['인스타그램']],
  ['앱/브랜드', 'ㄴㅍㄹㅅ', ['넷플릭스']], ['앱/브랜드', 'ㅂㄷㅇㅁㅈ', ['배달의민족', '배민']],
  ['앱/브랜드', 'ㅋㅍ', ['쿠팡']], ['앱/브랜드', 'ㅅㅌㅂㅅ', ['스타벅스']], ['앱/브랜드', 'ㅁㄷㄴㄷ', ['맥도날드']],
  ['연예인', 'ㅇㅇㅇ', ['아이유']], ['연예인', 'ㅇㅈㅅ', ['유재석']], ['축구선수', 'ㅅㅎㅁ', ['손흥민']],
  ['연예인', 'ㅂㄹㅍㅋ', ['블랙핑크']], ['연예인', 'ㄱㅈㅎ', ['김장훈']],
  ['예능', 'ㄹㄴㅁ', ['런닝맨']], ['예능', 'ㅁㅎㄷㅈ', ['무한도전']],
  ['기념일', 'ㅋㄹㅅㅁㅅ', ['크리스마스']], ['명절', 'ㅊㅅ', ['추석']],
  ['직장인', 'ㅎㅅ', ['회식', '회사']], ['직장인', 'ㅇㄱ', ['월급', '야근']],
];
// [이모지, 정답들]
const MOVIE = [
  ['🦁👑', ['라이온킹']], ['🚢🧊❤️', ['타이타닉']], ['🕷️🧑', ['스파이더맨']], ['👸❄️⛄', ['겨울왕국']],
  ['🦈🌊', ['죠스']], ['🐠🔍', ['니모를찾아서', '니모']], ['🧙⚡👓', ['해리포터']], ['🦖🏝️', ['쥬라기공원', '쥬라기월드']],
  ['🤖🚗', ['트랜스포머']], ['🧸🤠', ['토이스토리']], ['🚗💨😠', ['분노의질주']], ['🏫🧟', ['지금우리학교는']],
  ['🧞🪔', ['알라딘']], ['🐀🍳', ['라따뚜이']], ['🐼🥋', ['쿵푸팬더']], ['💚👹🐴', ['슈렉']],
  ['🧜🦀', ['인어공주']], ['🛡️🔨⚡', ['어벤져스', '어벤저스']], ['🌌🕳️⏳', ['인터스텔라']],
  ['🧟🚆', ['부산행']], ['☠️🦜⚓', ['캐리비안의해적', '캐리비안의해적들']], ['🦍🏙️', ['킹콩']],
  ['🦇🌃', ['배트맨', '다크나이트']], ['🃏🤡', ['조커']], ['🤖🌱', ['월e', '월-e', 'wall-e', 'walle', '월이']],
  ['💍🌋🧙', ['반지의제왕']], ['⭐⚔️🌌', ['스타워즈']], ['👽📞🏠', ['이티', 'et', 'e.t']],
  ['⏰🚗⚡', ['백투더퓨처', '백투더퓨쳐']], ['🏠🪜🐛', ['기생충']], ['🍗🚓', ['극한직업']], ['🔵👽🌳', ['아바타']],
  ['🎈🏠👴', ['업', 'up']], ['💀🎸🌼', ['코코']], ['✈️😎', ['탑건']], ['💣🕵️', ['미션임파서블']],
  ['💊🔴🔵', ['매트릭스']], ['🌀🛌🏙️', ['인셉션']], ['👊😤🚔', ['범죄도시']],
  ['🔨🥟', ['올드보이']],
  ['🦑🔴🟢', ['오징어게임']], ['👹🗡️', ['도깨비']], ['🪂🇰🇵❤️', ['사랑의불시착']],
  ['📟🏘️', ['응답하라1988', '응답하라']], ['🏥🎶🎸', ['슬기로운의사생활', '슬의생']],
  ['😭👑', ['눈물의여왕']], ['🌊🧜', ['푸른바다의전설']], ['⭐👽❤️', ['별에서온그대', '별그대']],
  ['☀️🪖❤️', ['태양의후예']], ['🏰☁️🎓', ['스카이캐슬']], ['📻🚓⏳', ['시그널']],
  ['👑🐉🗡️', ['왕좌의게임']], ['👫☕🛋️', ['프렌즈']], ['🤴🧟', ['킹덤']], ['🍳👑🍯', ['대장금']],
  ['🌺🍺👮', ['동백꽃필무렵']], ['🎒🏊⏪', ['선재업고튀어']],
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
    ...pick(MOVIE, 3).map(q => ({ t: 'quiz', title: '영화,드라마 맞히기', hint: '이모지로 영화, 드라마 제목을 맞혀요', q: q[0], a: q[1], sec: 20 })),
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
require('./solo')(app, { CHO, MOVIE });
srv.listen(process.env.PORT || 3000, () => console.log('열렸어요 → http://localhost:' + (process.env.PORT || 3000)));
