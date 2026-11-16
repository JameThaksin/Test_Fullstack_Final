// Pure exam logic (no DOM). Shared by the UI and by the automated tests.

export const LETTERS = ['ก', 'ข', 'ค', 'ง'];
export const DIFF_ORDER = ['easy', 'medium', 'hard'];

/** Create a fresh session for the given question ids. */
export function createSession(mode, ids) {
  return {
    mode,                 // 'exam' | 'practice'
    ids: ids.slice(),     // question ids in display order
    answers: {},          // id -> chosen index (0..3)
    marked: [],           // ids marked for review
    current: 0,           // index into ids
    submitted: false,
    view: 'exam',         // 'exam' | 'result' | 'review'
    startedAt: Date.now(),
    submittedAt: null,
  };
}

export function answeredCount(session) {
  return session.ids.filter((id) => session.answers[id] !== undefined).length;
}

/** Score a session. Every question counts 1 point. */
export function scoreSession(session, byId) {
  const res = {
    total: session.ids.length,
    correct: 0,
    wrong: 0,
    unanswered: 0,
    percent: 0,
    wrongIds: [],
    unansweredIds: [],
    byDifficulty: {},
    byTopic: {},
  };
  for (const id of session.ids) {
    const q = byId[id];
    const d = (res.byDifficulty[q.difficulty] ||= { correct: 0, total: 0 });
    const t = (res.byTopic[q.topic] ||= { correct: 0, total: 0 });
    d.total++; t.total++;
    const a = session.answers[id];
    if (a === undefined) { res.unanswered++; res.unansweredIds.push(id); }
    else if (a === q.answer) { res.correct++; d.correct++; t.correct++; }
    else { res.wrong++; res.wrongIds.push(id); }
  }
  res.percent = res.total ? Math.round((res.correct / res.total) * 10000) / 100 : 0;
  return res;
}

/** Ids worth practising again: answered wrong or left unanswered (in original order). */
export function idsToPractice(session, byId) {
  return session.ids.filter((id) => session.answers[id] !== byId[id].answer);
}

/** "5" / "6–8" / "26, 28" — collapse consecutive runs. */
export function formatPages(pages) {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < sorted.length; i++) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(i === j ? String(sorted[i]) : `${sorted[i]}–${sorted[j]}`);
    i = j;
  }
  return parts.join(', ');
}

export function citation(q, sources) {
  const src = sources[q.source.doc];
  const unit = src.kind === 'pdf' ? 'หน้า' : 'สไลด์';
  return `${src.file} • ${unit} ${formatPages(q.source.pages)}`;
}

export function formatDuration(ms) {
  if (!ms || ms < 0) return '-';
  const s = Math.round(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h} ชม. ${m} นาที` : m ? `${m} นาที ${sec} วินาที` : `${sec} วินาที`;
}

/** Basic structural validation of the question bank. Returns a list of problems. */
export function validateBank(bank) {
  const errs = [];
  const seen = new Set();
  for (const q of bank.questions || []) {
    if (seen.has(q.id)) errs.push(`${q.id}: duplicate id`);
    seen.add(q.id);
    if (!Array.isArray(q.choices) || q.choices.length !== 4) errs.push(`${q.id}: needs 4 choices`);
    else if (new Set(q.choices).size !== 4) errs.push(`${q.id}: duplicate choices`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errs.push(`${q.id}: bad answer index`);
    if (!DIFF_ORDER.includes(q.difficulty)) errs.push(`${q.id}: bad difficulty`);
    if (!bank.topics?.[q.topic]) errs.push(`${q.id}: unknown topic`);
    const src = bank.sources?.[q.source?.doc];
    if (!src) errs.push(`${q.id}: unknown source`);
    else if (!q.source.pages?.length || q.source.pages.some((p) => !Number.isInteger(p) || p < 1 || p > src.total)) {
      errs.push(`${q.id}: page out of range`);
    }
    if (!q.question || !q.explanation) errs.push(`${q.id}: missing text`);
    if (q.choiceNotes !== undefined) {
      const n = q.choiceNotes;
      if (!Array.isArray(n) || n.length !== 4) errs.push(`${q.id}: choiceNotes needs 4 entries`);
      else n.forEach((t, i) => {
        if (i === q.answer ? t !== null : !(typeof t === 'string' && t.trim())) errs.push(`${q.id}: bad choiceNote ${i}`);
      });
    }
  }
  return errs;
}
