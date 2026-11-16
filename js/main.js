// Full Stack Exam Quest — UI controller (vanilla JS, ES module)
import {
  LETTERS, DIFF_ORDER, createSession, answeredCount, scoreSession,
  idsToPractice, citation, formatDuration, validateBank,
} from './exam.js';
import { loadState, saveState, clearState } from './store.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

let bank = null;          // full JSON
let byId = {};            // id -> question
let state = { name: '', session: null, examSession: null };
let reviewFilter = 'all';

// ------------------------------------------------------------------ helpers
const S = () => state.session;
const curId = () => S().ids[S().current];
const curQ = () => byId[curId()];
const isReview = () => S().view === 'review';
const isPractice = () => S().mode === 'practice';
const isInstant = () => S().mode === 'instant';
const revealsOnPick = () => isPractice() || isInstant(); // answer shown right after picking
const MODES = {
  instant: { label: 'เฉลยทันทีทีละข้อ', desc: 'ตอบแล้วรู้ผลทันที พร้อมเหตุผลว่าทำไมข้อถูกจึงถูก และข้ออื่นผิดเพราะอะไร (ตอบแล้วเปลี่ยนไม่ได้)' },
  exam: { label: 'โหมดสอบ', desc: 'ทำครบแล้วค่อยส่ง เปลี่ยนคำตอบได้จนกว่าจะส่ง แล้วจึงดูคะแนนและเฉลย' },
};
let lastMode = 'instant';
const persist = () => saveState(state);

function diffLabel(d) { return bank.difficulties[d] || d; }
function topicLabel(t) { return bank.topics[t] || t; }

function toast(msg, ms = 2600) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add('hidden'), ms);
}

// ------------------------------------------------------------------ modal
let modalHandlers = null;
function openModal({ title, body, okText = 'ตกลง', cancelText = 'ยกเลิก', okClass = 'btn-primary', onOk, onCancel, focus }) {
  $('modalTitle').textContent = title;
  const b = $('modalBody');
  b.replaceChildren();
  if (typeof body === 'string') b.innerHTML = body; else if (body) b.append(body);
  const ok = $('modalOk');
  ok.textContent = okText;
  ok.className = 'btn ' + okClass;
  const cancel = $('modalCancel');
  cancel.textContent = cancelText || '';
  cancel.classList.toggle('hidden', !cancelText);
  modalHandlers = { onOk, onCancel };
  $('modal').classList.remove('hidden');
  setTimeout(() => (focus ? b.querySelector(focus) : ok)?.focus(), 30);
}
function closeModal() {
  $('modal').classList.add('hidden');
  modalHandlers = null;
}
function modalOk() {
  const h = modalHandlers;
  if (h?.onOk && h.onOk() === false) return; // handler may keep modal open
  closeModal();
}
function modalCancel() {
  const h = modalHandlers;
  closeModal();
  h?.onCancel?.();
}

// ------------------------------------------------------------------ session actions
function startExam(mode = 'exam') {
  lastMode = mode;
  state.session = createSession(mode, bank.questions.map((q) => q.id));
  state.examSession = null;
  reviewFilter = 'all';
  persist();
  render();
}

function startPractice(ids) {
  if (!ids.length) return;
  if (!isPractice()) state.examSession = S();
  state.session = createSession('practice', ids);
  reviewFilter = 'all';
  persist();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function select(idx) {
  const s = S();
  if (s.view !== 'exam') return;
  const id = curId();
  if (revealsOnPick() && s.answers[id] !== undefined) return; // instant/practice lock after checking
  s.answers[id] = idx;
  persist();
  render();
}

function toggleMark() {
  const s = S();
  if (s.view !== 'exam') return;
  const id = curId();
  const i = s.marked.indexOf(id);
  if (i >= 0) s.marked.splice(i, 1); else s.marked.push(id);
  persist();
  render();
}

function visibleIndices() {
  const s = S();
  if (!isReview() || reviewFilter === 'all') return s.ids.map((_, i) => i);
  return s.ids.map((id, i) => [id, i]).filter(([id]) => matchesFilter(id)).map(([, i]) => i);
}
function matchesFilter(id) {
  const s = S();
  const a = s.answers[id];
  if (reviewFilter === 'wrong') return a !== undefined && a !== byId[id].answer;
  if (reviewFilter === 'unanswered') return a === undefined;
  if (reviewFilter === 'marked') return s.marked.includes(id);
  return true;
}

function go(index) {
  const s = S();
  if (index < 0 || index >= s.ids.length) return;
  s.current = index;
  persist();
  render();
  if (window.matchMedia('(max-width: 860px)').matches) {
    $('qCounter').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
function step(dir) {
  const list = visibleIndices();
  const s = S();
  if (!list.length) return;
  const pos = list.indexOf(s.current);
  let next;
  if (pos === -1) next = dir > 0 ? list.find((i) => i > s.current) : [...list].reverse().find((i) => i < s.current);
  else next = list[pos + dir];
  if (next !== undefined) go(next);
}

function onNext() {
  const s = S();
  if (s.view === 'exam' && s.current === s.ids.length - 1) { confirmSubmit(); return; }
  step(1);
}

function confirmSubmit() {
  const s = S();
  const total = s.ids.length;
  const done = answeredCount(s);
  const left = total - done;
  const marked = s.marked.length;
  const body = el('div');
  const p1 = el('p');
  p1.innerHTML = `ตอบแล้ว <b>${done}</b> จาก <b>${total}</b> ข้อ`;
  body.append(p1);
  if (left) body.append(el('p', 'warn', `ยังไม่ได้ตอบอีก ${left} ข้อ (ข้อที่ไม่ได้ตอบจะนับเป็น 0 คะแนน)`));
  if (marked) body.append(el('p', 'warn', `มีข้อที่ทำเครื่องหมายทบทวนไว้ ${marked} ข้อ`));
  body.append(el('p', '', revealsOnPick()
    ? 'ส่งเพื่อดูสรุปคะแนนของรอบนี้ แยกตามระดับและหมวด'
    : 'เมื่อส่งแล้วจะเปลี่ยนคำตอบไม่ได้ แต่สามารถดูเฉลยและทำข้อสอบใหม่ได้'));
  openModal({
    title: isPractice() ? 'ส่งแบบฝึก?' : isInstant() ? 'ดูสรุปคะแนน?' : 'ยืนยันการส่งข้อสอบ?',
    body,
    okText: isPractice() ? 'ส่งแบบฝึก' : isInstant() ? 'ดูสรุปคะแนน' : 'ส่งข้อสอบ',
    cancelText: 'กลับไปทำต่อ',
    onOk: submit,
  });
}

function submit() {
  const s = S();
  s.submitted = true;
  s.submittedAt = Date.now();
  s.view = 'result';
  persist();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openReview(index) {
  const s = S();
  s.view = 'review';
  if (index !== undefined) s.current = index;
  reviewFilter = 'all';
  persist();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function backToResult() {
  S().view = 'result';
  persist();
  render();
}

// radio cards for choosing instant-feedback vs exam mode
function modePicker(initial) {
  const box = el('div', 'mode-pick');
  box.setAttribute('role', 'radiogroup');
  box.setAttribute('aria-label', 'เลือกโหมด');
  let value = initial;
  for (const [k, m] of Object.entries(MODES)) {
    const b = el('button', 'mode-opt');
    b.type = 'button';
    b.dataset.mode = k;
    b.setAttribute('role', 'radio');
    b.append(el('b', '', m.label), el('span', '', m.desc));
    b.addEventListener('click', () => { value = k; sync(); });
    box.append(b);
  }
  function sync() {
    box.querySelectorAll('.mode-opt').forEach((b) => {
      const on = b.dataset.mode === value;
      b.classList.toggle('active', on);
      b.setAttribute('aria-checked', String(on));
    });
  }
  sync();
  return { node: box, get: () => value };
}

function confirmRetake() {
  const wrap = el('div');
  wrap.append(el('p', '', `คำตอบและผลเดิมจะถูกล้าง แล้วเริ่มทำ ${bank.questions.length} ข้อใหม่ตั้งแต่ข้อ 1 เลือกโหมดที่ต้องการ:`));
  const picker = modePicker(lastMode);
  wrap.append(picker.node);
  openModal({
    title: 'ทำข้อสอบใหม่ทั้งหมด?',
    body: wrap,
    okText: 'เริ่มใหม่', okClass: 'btn-danger',
    onOk: () => startExam(picker.get()),
  });
}
function confirmRestart() {
  const s = S();
  openModal({
    title: isPractice() ? 'เริ่มแบบฝึกรอบนี้ใหม่?' : 'เริ่มทำข้อสอบใหม่?',
    body: `<p>คำตอบและเครื่องหมายทบทวนทั้งหมดในรอบนี้จะถูกล้าง (โหมดเดิม: ${isPractice() ? 'ฝึกข้อที่ผิด' : MODES[s.mode].label})</p>`,
    okText: 'ล้างและเริ่มใหม่', okClass: 'btn-danger',
    onOk: () => {
      state.session = createSession(s.mode, s.ids);
      persist();
      render();
    },
  });
}

function editName(first) {
  const wrap = el('div');
  let picker = null;
  if (first) {
    const info = el('div', 'info-grid');
    const counts = { easy: 0, medium: 0, hard: 0 };
    bank.questions.forEach((q) => counts[q.difficulty]++);
    for (const d of DIFF_ORDER) {
      const c = el('div', d);
      c.append(el('b', '', String(counts[d])), el('span', '', diffLabel(d)));
      info.append(c);
    }
    wrap.append(
      el('p', '', `ข้อสอบปรนัย ${bank.questions.length} ข้อ ครอบคลุม ${Object.keys(bank.topics).length} หมวด ตั้งแต่ HTML, CSS, Bootstrap, JavaScript, DOM ไปจนถึง Node.js, API และฐานข้อมูล ทุกข้ออ้างอิงไฟล์สไลด์และเลขหน้า`),
      info,
    );
    wrap.append(el('p', 'mode-head', 'เลือกโหมด'));
    picker = modePicker(lastMode);
    wrap.append(picker.node);
    wrap.append(el('p', 'small', 'ทั้งสองโหมดข้ามข้อ ทำเครื่องหมายทบทวน และคลิกหมายเลขเพื่อไปข้อนั้นได้ ความคืบหน้าบันทึกอัตโนมัติ รีเฟรชแล้วไม่หาย'));
  }
  const label = el('label', '', 'ชื่อผู้ทำข้อสอบ');
  label.htmlFor = 'nameInput';
  const input = el('input');
  input.type = 'text';
  input.id = 'nameInput';
  input.maxLength = 40;
  input.placeholder = 'เช่น เจมส์';
  input.value = state.name || '';
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); modalOk(); } });
  wrap.append(label, input);
  openModal({
    title: first ? 'พร้อมเริ่มทำข้อสอบหรือยัง?' : 'แก้ไขชื่อผู้ทำ',
    body: wrap,
    okText: first ? 'เริ่มเลย' : 'บันทึก',
    cancelText: first ? null : 'ยกเลิก',
    focus: '#nameInput',
    onOk: () => {
      state.name = input.value.trim() || 'ผู้เข้าสอบ';
      if (first) startExam(picker.get()); else { persist(); render(); }
    },
  });
}

// ------------------------------------------------------------------ rendering
function render() {
  const s = S();
  if (!s) return;
  const view = s.view;
  $('examView').classList.toggle('hidden', view === 'result');
  $('resultView').classList.toggle('hidden', view !== 'result');
  $('errorView').classList.add('hidden');
  if (view === 'result') renderResult(); else renderQuestion();
  renderNavigator();
}

function renderQuestion() {
  const s = S();
  const q = curQ();
  const total = s.ids.length;
  const review = isReview();
  const practice = isPractice();
  const chosen = s.answers[q.id];
  const instant = isInstant();
  const revealed = review || (revealsOnPick() && chosen !== undefined);

  // header line
  $('qCounter').textContent = `คำถามที่ ${s.current + 1} / ${total}`;
  $('takerName').textContent = state.name || '-';
  const done = answeredCount(s);
  $('answeredCount').textContent = done;
  $('answeredTotal').textContent = total;
  const pct = total ? (done / total) * 100 : 0;
  $('progressFill').style.width = pct + '%';
  $('progressBar').setAttribute('aria-valuenow', String(Math.round(pct)));

  const chip = $('modeChip');
  chip.classList.toggle('hidden', !(practice || instant || review));
  chip.textContent = review ? (practice ? 'เฉลยแบบฝึก' : 'โหมดดูเฉลย')
    : practice ? `ฝึกข้อที่ผิด • ข้อสอบข้อ ${bank.questions.indexOf(q) + 1}` : 'โหมดเฉลยทันที';

  // review filter
  const rf = $('reviewFilter');
  rf.classList.toggle('hidden', !review);
  if (review) {
    const counts = {
      all: s.ids.length,
      wrong: s.ids.filter((id) => s.answers[id] !== undefined && s.answers[id] !== byId[id].answer).length,
      unanswered: s.ids.filter((id) => s.answers[id] === undefined).length,
      marked: s.marked.length,
    };
    rf.querySelectorAll('.chip').forEach((c) => {
      const f = c.dataset.filter;
      c.classList.toggle('active', f === reviewFilter);
      c.replaceChildren(c.dataset.label || (c.dataset.label = c.textContent), ' ', el('span', 'n', `(${counts[f]})`));
    });
  }

  // badges & text
  const db = $('diffBadge');
  db.textContent = diffLabel(q.difficulty);
  db.className = 'badge diff ' + q.difficulty;
  $('topicBadge').textContent = topicLabel(q.topic);
  $('markedBadge').classList.toggle('hidden', !s.marked.includes(q.id));
  $('qText').textContent = q.question;
  const code = $('qCode');
  code.classList.toggle('hidden', !q.code);
  code.firstElementChild.textContent = q.code || '';

  // options
  const box = $('options');
  box.replaceChildren();
  q.choices.forEach((text, i) => {
    const b = el('button', 'option');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(chosen === i));
    b.dataset.index = String(i);
    if (chosen === i) b.classList.add('selected');
    let icon = '';
    if (revealed) {
      b.disabled = true;
      if (i === q.answer) { b.classList.add('correct'); icon = '✓'; }
      else if (chosen === i) { b.classList.add('wrong'); icon = '✗'; }
    }
    const radio = el('span', 'radio');
    radio.setAttribute('aria-hidden', 'true');
    b.append(radio, el('span', 'letter', LETTERS[i] + '.'), el('span', 'opt-text', text));
    if (icon) b.append(el('span', 'mark-icon', icon));
    b.addEventListener('click', () => select(i));
    box.append(b);
  });

  // feedback / explanation
  const fb = $('feedback');
  fb.classList.toggle('hidden', !revealed);
  if (revealed) {
    const ok = chosen === q.answer;
    fb.className = 'feedback ' + (chosen === undefined ? '' : ok ? 'ok' : 'bad');
    $('feedbackTitle').textContent = chosen === undefined
      ? `ไม่ได้ตอบ • คำตอบที่ถูกคือ ${LETTERS[q.answer]}.`
      : ok ? `ตอบถูก ✓ (${LETTERS[q.answer]}.)` : `ตอบผิด ✗ • คุณตอบ ${LETTERS[chosen]}. คำตอบที่ถูกคือ ${LETTERS[q.answer]}.`;
    $('feedbackText').textContent = q.explanation;
    const note = $('feedbackNote');
    note.classList.toggle('hidden', !q.note);
    note.textContent = q.note ? 'หมายเหตุ: ' + q.note : '';
    $('feedbackSource').textContent = '📄 อ้างอิง: ' + citation(q, bank.sources);
    // per-choice reasons: why the answer is right and why each other choice is wrong
    const reasons = $('choiceReasons');
    reasons.replaceChildren();
    const notes = q.choiceNotes || [];
    q.choices.forEach((text, i) => {
      const right = i === q.answer;
      const why = right ? '' : notes[i];
      if (!right && !why) return;
      const li = el('li', 'reason ' + (right ? 'is-right' : 'is-wrong') + (chosen === i ? ' is-chosen' : ''));
      const head = el('div', 'reason-head');
      head.append(el('span', 'reason-icon', right ? '✓' : '✗'), el('span', 'reason-letter', LETTERS[i] + '.'), el('span', 'reason-choice', text));
      if (chosen === i) head.append(el('span', 'reason-you', 'คุณเลือก'));
      li.append(head, el('p', 'reason-why', right ? 'คำตอบที่ถูก (เหตุผลอยู่ในคำอธิบายด้านบน)' : 'ผิดเพราะ ' + why));
      reasons.append(li);
    });
    reasons.parentElement.querySelector('.choices-head').classList.toggle('hidden', !reasons.children.length);
  }

  // actions
  const list = visibleIndices();
  const pos = list.indexOf(s.current);
  const hasPrev = pos === -1 ? list.some((i) => i < s.current) : pos > 0;
  const hasNext = pos === -1 ? list.some((i) => i > s.current) : pos < list.length - 1;
  $('prevBtn').disabled = !hasPrev;
  const next = $('nextBtn');
  if (!review && s.current === total - 1) {
    next.textContent = practice ? 'ส่งแบบฝึก ✓' : instant ? 'ดูสรุปคะแนน ✓' : 'ส่งข้อสอบ ✓';
    next.disabled = false;
  } else {
    next.textContent = 'ข้อถัดไป →';
    next.disabled = !hasNext;
  }
  const mark = $('markBtn');
  mark.classList.toggle('hidden', review);
  const marked = s.marked.includes(q.id);
  mark.classList.toggle('active', marked);
  mark.setAttribute('aria-pressed', String(marked));
  mark.querySelector('.star').textContent = marked ? '★' : '☆';
  mark.querySelector('.lbl').textContent = marked ? 'ยกเลิกทบทวน' : 'ทบทวนทีหลัง';
  mark.title = marked ? 'ยกเลิกเครื่องหมายทบทวน (M)' : 'ทำเครื่องหมายทบทวน (M)';
  $('editNameBtn').classList.toggle('hidden', review);
}

function cellClasses(id, i) {
  const s = S();
  const cls = ['cell'];
  const a = s.answers[id];
  const showResult = s.view !== 'exam' || (revealsOnPick() && a !== undefined);
  if (showResult) {
    if (a === undefined) cls.push(s.view === 'exam' ? '' : 'unanswered-r');
    else cls.push(a === byId[id].answer ? 'correct' : 'wrong');
  } else if (a !== undefined) cls.push('answered');
  if (s.marked.includes(id)) cls.push('marked');
  if (s.view !== 'result' && i === s.current) cls.push('current');
  if (isReview() && reviewFilter !== 'all' && !matchesFilter(id)) cls.push('dim');
  return cls.filter(Boolean).join(' ');
}

function renderNavigator() {
  const s = S();
  const resultish = s.view !== 'exam';
  $('navTitle').textContent = isPractice() ? `ฝึกข้อที่ผิด (${s.ids.length} ข้อ)` : isInstant() ? 'ข้อสอบทั้งหมด • เฉลยทันที' : 'ข้อสอบทั้งหมด';
  $('navSub').textContent = s.view === 'result' ? 'คลิกหมายเลขเพื่อดูเฉลยข้อนั้น' : 'คลิกหมายเลขเพื่อข้ามไปทำข้ออื่น';

  const legend = $('legend');
  legend.replaceChildren();
  const items = resultish || revealsOnPick()
    ? [['correct', 'ตอบถูก'], ['wrong', 'ตอบผิด'], ['empty', 'ยังไม่ตอบ'], ['marked', 'ทบทวน']]
    : [['answered', 'ตอบแล้ว'], ['marked', 'ทำเครื่องหมายทบทวน'], ['current', 'ข้อปัจจุบัน'], ['empty', 'ยังไม่ตอบ']];
  if (revealsOnPick() && !resultish) items.push(['current', 'ข้อปัจจุบัน']);
  for (const [k, t] of items) {
    const li = el('li');
    li.append(el('span', 'sw ' + k), document.createTextNode(t));
    legend.append(li);
  }

  const grid = $('navGrid');
  grid.replaceChildren();
  s.ids.forEach((id, i) => {
    const c = el('button', cellClasses(id, i), String(i + 1));
    c.type = 'button';
    c.dataset.index = String(i);
    const st = s.answers[id] === undefined ? 'ยังไม่ตอบ' : 'ตอบแล้ว';
    c.setAttribute('aria-label', `ข้อ ${i + 1} ${st}${s.marked.includes(id) ? ' ทำเครื่องหมายทบทวน' : ''}`);
    if (i === s.current && s.view !== 'result') c.setAttribute('aria-current', 'true');
    c.addEventListener('click', () => {
      if (s.view === 'result') openReview(i); else go(i);
    });
    grid.append(c);
  });

  // footer
  const stats = $('navStats');
  stats.replaceChildren();
  const done = answeredCount(s);
  const add = (n, label) => { const d = el('div', 'stat'); d.append(el('b', '', String(n)), el('span', '', label)); stats.append(d); };
  if (resultish) {
    const r = scoreSession(s, byId);
    add(r.correct, 'ถูก'); add(r.wrong, 'ผิด'); add(r.unanswered, 'ไม่ได้ตอบ');
  } else {
    add(done, 'ตอบแล้ว'); add(s.ids.length - done, 'ยังไม่ตอบ'); add(s.marked.length, 'ทบทวน');
  }
  const submitBtn = $('submitBtn');
  const restartBtn = $('restartBtn');
  if (s.view === 'exam') {
    submitBtn.textContent = isPractice() ? 'ส่งแบบฝึก' : isInstant() ? 'ดูสรุปคะแนน' : 'ส่งข้อสอบ';
    submitBtn.onclick = confirmSubmit;
    restartBtn.textContent = isPractice() ? 'เริ่มแบบฝึกใหม่' : 'เริ่มทำใหม่';
    restartBtn.onclick = confirmRestart;
    restartBtn.classList.remove('hidden');
  } else if (s.view === 'review') {
    submitBtn.textContent = 'กลับไปหน้าคะแนน';
    submitBtn.onclick = backToResult;
    restartBtn.classList.add('hidden');
  } else {
    submitBtn.textContent = 'ดูเฉลยทั้งหมด';
    submitBtn.onclick = () => openReview(0);
    restartBtn.textContent = 'ทำข้อสอบใหม่ทั้งหมด';
    restartBtn.onclick = confirmRetake;
    restartBtn.classList.remove('hidden');
  }
}

function renderResult() {
  const s = S();
  const r = scoreSession(s, byId);
  const practice = isPractice();
  $('resultEyebrow').textContent = practice ? 'ผลการฝึกข้อที่ผิด' : isInstant() ? 'ผลการทำแบบเฉลยทันที' : 'ผลการสอบ';
  $('scoreRing').style.setProperty('--pct', String(r.percent));
  $('scorePct').textContent = `${Number.isInteger(r.percent) ? r.percent : r.percent.toFixed(2)}%`;
  $('scoreSub').textContent = `${r.correct} / ${r.total} ข้อ`;
  const level = r.percent >= 80 ? 'ยอดเยี่ยม! เข้าใจเนื้อหาเกือบทั้งหมดแล้ว'
    : r.percent >= 60 ? 'ทำได้ดี ทบทวนหมวดที่คะแนนต่ำอีกนิด'
    : r.percent >= 40 ? 'พอใช้ ลองดูเฉลยและฝึกข้อที่ผิดอีกรอบ'
    : 'ควรทบทวนสไลด์เพิ่ม แล้วลองฝึกข้อที่ผิดดูอีกครั้ง';
  $('resultTitle').textContent = `${state.name || 'ผู้เข้าสอบ'} ได้ ${r.correct} คะแนน`;
  $('resultMsg').textContent = level;
  const ul = $('resultStats');
  ul.replaceChildren();
  const li = (cls, label, val) => { const x = el('li', cls); x.append(label + ' ', el('b', '', String(val))); ul.append(x); };
  li('ok', 'ถูก', r.correct);
  li('bad', 'ผิด', r.wrong);
  li('', 'ไม่ได้ตอบ', r.unanswered);
  li('', 'คะแนน', `${r.correct}/${r.total}`);
  li('', 'เวลาที่ใช้', formatDuration((s.submittedAt || Date.now()) - s.startedAt));

  const bars = $('diffBars');
  bars.replaceChildren();
  for (const d of DIFF_ORDER) {
    const v = r.byDifficulty[d];
    if (!v) continue;
    const row = el('div', 'bar-row');
    const p = v.total ? Math.round((v.correct / v.total) * 100) : 0;
    const track = el('div', 'bar-track');
    const fill = el('div', 'bar-fill ' + d);
    fill.style.width = p + '%';
    track.append(fill);
    row.append(el('span', 'name ' + d, diffLabel(d)), track, el('span', 'val', `${v.correct}/${v.total} (${p}%)`));
    bars.append(row);
  }

  const tbody = $('topicTable').querySelector('tbody');
  tbody.replaceChildren();
  for (const t of Object.keys(bank.topics)) {
    const v = r.byTopic[t];
    if (!v) continue;
    const p = Math.round((v.correct / v.total) * 100);
    const tr = el('tr');
    tr.append(el('td', '', topicLabel(t)), el('td', '', String(v.correct)), el('td', '', String(v.total)),
      el('td', p < 50 ? 'low' : p >= 80 ? 'high' : '', p + '%'));
    tbody.append(tr);
  }

  const toPractice = idsToPractice(s, byId);
  const pb = $('practiceBtn');
  pb.disabled = toPractice.length === 0;
  pb.textContent = toPractice.length
    ? `${practice ? 'ฝึกข้อที่ยังผิดอีกครั้ง' : 'ฝึกเฉพาะข้อที่ผิด'} (${toPractice.length} ข้อ)`
    : 'ไม่มีข้อที่ผิด 🎉';
  pb.onclick = () => startPractice(toPractice);
  $('backToExamResultBtn').classList.toggle('hidden', !(practice && state.examSession));
}

// ------------------------------------------------------------------ events
function bindEvents() {
  $('prevBtn').addEventListener('click', () => step(-1));
  $('nextBtn').addEventListener('click', onNext);
  $('markBtn').addEventListener('click', toggleMark);
  $('editNameBtn').addEventListener('click', () => editName(false));
  $('reviewBtn').addEventListener('click', () => openReview(0));
  $('retakeBtn').addEventListener('click', confirmRetake);
  $('backToExamResultBtn').addEventListener('click', () => {
    state.session = state.examSession;
    state.examSession = null;
    state.session.view = 'result';
    persist();
    render();
  });
  $('modalOk').addEventListener('click', modalOk);
  $('modalCancel').addEventListener('click', modalCancel);
  $('reviewFilter').addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (!c) return;
    reviewFilter = c.dataset.filter;
    const list = visibleIndices();
    if (list.length && !list.includes(S().current)) S().current = list[0];
    render();
  });
  document.addEventListener('keydown', (e) => {
    if (!$('modal').classList.contains('hidden')) {
      if (e.key === 'Escape' && !$('modalCancel').classList.contains('hidden')) modalCancel();
      return;
    }
    if (!S() || S().view === 'result') return;
    if (e.target.closest('input, textarea') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (['1', '2', '3', '4'].includes(e.key)) { select(Number(e.key) - 1); }
    else if (e.key === 'ArrowRight') { onNext(); }
    else if (e.key === 'ArrowLeft') { step(-1); }
    else if (e.key === 'm' || e.key === 'M') { toggleMark(); }
  });
}

// ------------------------------------------------------------------ boot
function restore(saved) {
  if (!saved || typeof saved !== 'object') return false;
  const validSession = (x) => x && Array.isArray(x.ids) && x.ids.length && x.ids.every((id) => byId[id])
    && typeof x.answers === 'object' && Array.isArray(x.marked);
  state.name = typeof saved.name === 'string' ? saved.name : '';
  if (!validSession(saved.session)) return false;
  state.session = saved.session;
  state.examSession = validSession(saved.examSession) ? saved.examSession : null;
  const s = state.session;
  if (!['exam', 'instant', 'practice'].includes(s.mode)) s.mode = 'exam';
  lastMode = (s.mode === 'practice' ? state.examSession?.mode : s.mode) || 'instant';
  s.current = Math.min(Math.max(0, s.current | 0), s.ids.length - 1);
  if (!['exam', 'result', 'review'].includes(s.view)) s.view = s.submitted ? 'result' : 'exam';
  // drop answers for ids not in this session / bad indices
  for (const k of Object.keys(s.answers)) {
    if (!s.ids.includes(k) || ![0, 1, 2, 3].includes(s.answers[k])) delete s.answers[k];
  }
  s.marked = s.marked.filter((id) => s.ids.includes(id));
  return true;
}

async function boot() {
  bindEvents();
  try {
    const res = await fetch('data/questions.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    bank = await res.json();
  } catch (err) {
    $('examView').classList.add('hidden');
    $('navCol').classList.add('hidden');
    $('errorView').classList.remove('hidden');
    $('errorMsg').textContent = 'เปิดไฟล์ data/questions.json ไม่ได้ (' + err.message + ') — ถ้าเปิด index.html ด้วยการดับเบิลคลิก (file://) เบราว์เซอร์จะบล็อกการโหลด JSON ให้เปิดผ่าน VS Code Live Server หรือ web server แทน';
    return;
  }
  const problems = validateBank(bank);
  if (problems.length) console.warn('Question bank problems:', problems);
  byId = Object.fromEntries(bank.questions.map((q) => [q.id, q]));

  if (restore(loadState())) {
    render();
    const s = S();
    if (s.view === 'exam' && (answeredCount(s) || s.marked.length || s.current)) {
      toast(`กู้คืนความคืบหน้าแล้ว • ตอบไปแล้ว ${answeredCount(s)} ข้อ`);
    }
  } else {
    clearState();
    // show an empty exam behind the start dialog
    state.session = createSession('exam', bank.questions.map((q) => q.id));
    render();
    state.session = null;
    editName(true);
  }

  // test hook (read-only snapshot)
  window.__fseq = {
    getState: () => JSON.parse(JSON.stringify(state)),
    bank: () => bank,
  };
}

boot();
