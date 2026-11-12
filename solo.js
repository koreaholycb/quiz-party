// 혼자 도전 모드: 오늘의 퀴즈(모두 같은 문제) + 전체 순위
// 순위는 서버 메모리에만 저장돼요. 서버가 재시작되거나 날짜(한국 시간)가 바뀌면 초기화됩니다.
module.exports = (app, { CHO, MOVIE }) => {
  const express = require('express'), crypto = require('crypto');
  app.use('/solo', express.json({ limit: '2kb' }));
  const SEC = 20;
  const norm = s => String(s).replace(/\s/g, '').toLowerCase();
  const today = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
  const rng = seed => {
    let h = 7; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 2654435761);
    return () => { h = h + 0x6D2B79F5 | 0; let t = Math.imul(h ^ h >>> 15, 1 | h);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  };
  const pick = (arr, n, r) => arr.map(x => [r(), x]).sort((a, b) => a[0] - b[0]).slice(0, n).map(p => p[1]);

  let day = '', qs = [], board = [];
  const sessions = new Map();
  const ensure = () => {
    const d = today(); if (d === day) return;
    day = d; board = []; const r = rng(d);
    qs = [
      ...pick(CHO, 5, r).map(q => ({ title: '초성 퀴즈', hint: q[0], q: q[1], a: q[2] })),
      ...pick(MOVIE, 5, r).map(q => ({ title: '영화/드라마', hint: '이모지로 제목을 맞혀요', q: q[0], a: q[1] })),
    ];
  };
  const view = s => ({ i: s.i, n: qs.length, title: qs[s.i].title, hint: qs[s.i].hint, q: qs[s.i].q, sec: SEC });
  const same = (a, b) => a.toLowerCase() === b.toLowerCase();

  function step(s, gained) {
    const shown = qs[s.i].a.filter(a => !a.startsWith('~')).join(' / ');
    s.score += gained; if (gained) s.ok++; s.i++;
    const out = { gained, answer: shown, score: s.score, ok: s.ok, n: qs.length };
    if (s.i < qs.length) { s.start = Date.now(); out.q = view(s); return out; }
    out.done = true;
    if (s.day === day && !board.some(b => same(b.name, s.name)) && board.length < 5000) {
      board.push({ name: s.name, score: s.score, ok: s.ok, at: Date.now() });
      board.sort((a, b) => b.score - a.score || a.at - b.at);
      out.recorded = true; out.rank = board.findIndex(b => same(b.name, s.name)) + 1; out.total = board.length;
    } else out.recorded = false;
    return out;
  }
  const getSession = (req, res) => {
    ensure();
    const s = sessions.get(req.body.token);
    if (!s) { res.json({ err: '도전이 끝났어요. 처음부터 다시 시작해 주세요.' }); return null; }
    if (s.day !== day) { sessions.delete(req.body.token); res.json({ err: '날짜가 바뀌어서 새 문제로 다시 시작해야 해요.' }); return null; }
    return s;
  };
  const reply = (req, res, s, o) => { if (o.done) sessions.delete(req.body.token); res.json(o); };

  app.post('/solo/start', (req, res) => {
    ensure();
    const name = String(req.body.name || '').trim().slice(0, 8);
    if (!name) return res.json({ err: '이름을 입력해 주세요.' });
    if (board.some(b => same(b.name, name))) return res.json({ err: '오늘 이미 기록이 있는 이름이에요. 다른 이름으로 도전해 보세요.' });
    const token = crypto.randomBytes(8).toString('hex');
    const s = { name, day, i: 0, score: 0, ok: 0, start: Date.now() };
    sessions.set(token, s);
    res.json({ token, q: view(s) });
  });
  app.post('/solo/answer', (req, res) => {
    const s = getSession(req, res); if (!s) return;
    const el = Date.now() - s.start;
    if (el > SEC * 1000 + 1500) { const o = step(s, 0); o.late = true; return reply(req, res, s, o); }
    if (!qs[s.i].a.some(a => norm(a.replace(/^~/, '')) === norm(req.body.text))) return res.json({ wrong: true });
    const g = 50 + Math.round(50 * Math.max(SEC * 1000 - el, 0) / (SEC * 1000));
    reply(req, res, s, step(s, g));
  });
  app.post('/solo/skip', (req, res) => {
    const s = getSession(req, res); if (!s) return;
    reply(req, res, s, step(s, 0));
  });
  app.get('/solo/rank', (req, res) => {
    ensure();
    res.json({ day, total: board.length, top: board.slice(0, 30).map(b => ({ name: b.name, score: b.score, ok: b.ok })) });
  });
  setInterval(() => { const lim = Date.now() - 36e5; for (const [k, v] of sessions) if (v.start < lim) sessions.delete(k); }, 6e5).unref();
};
