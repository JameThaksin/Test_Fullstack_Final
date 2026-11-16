/*
 * ทดสอบใช้งานจริงแบบ end-to-end ด้วย Playwright (Chromium headless)
 * รัน:  node tests/e2e.test.cjs
 *   - ต้องมี playwright (npm i -D playwright) และ python3 สำหรับเปิด static server ชั่วคราว
 *   - BASE_URL=https://.../  → ทดสอบเว็บที่ deploy แล้วแทนการเปิด server ในเครื่อง
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8600 + Math.floor(Math.random() * 300);
const BASE = process.env.BASE_URL ? process.env.BASE_URL.replace(/\/?$/, '/') : `http://127.0.0.1:${PORT}/`;
const URL = BASE + 'index.html';
const SHOTS = path.join(__dirname, 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));
const Q = bank.questions;

const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail: String(detail) });
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
}
const st = (page) => page.evaluate(() => window.__fseq.getState());
const text = (page, sel) => page.$eval(sel, (e) => e.textContent.trim());
async function currentIndex(page) { return (await st(page)).session.current; }
async function goTo(page, i) { await page.click(`#navGrid .cell[data-index="${i}"]`); }
async function choose(page, idx) { await page.click(`#options .option[data-index="${idx}"]`); }

async function main() {
  let server = null;
  if (!process.env.BASE_URL) {
    server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 900));
  }
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });

  try {
    // 1. load + start dialog
    await page.goto(URL);
    await page.waitForSelector('#modal:not(.hidden) #nameInput');
    record('หน้าเว็บโหลดได้และแสดงหน้าต่างเริ่มสอบ', true);
    const counts = await page.$$eval('.info-grid b', (b) => b.map((x) => x.textContent));
    record('หน้าเริ่มแสดง Easy 20 / Medium 20 / Hard 20', counts.join('/') === '20/20/20', counts.join('/'));
    const modes = await page.$$eval('.mode-opt', (b) => b.map((x) => x.dataset.mode + ':' + x.classList.contains('active')));
    record('หน้าเริ่มให้เลือกโหมด เฉลยทันที / โหมดสอบ (ค่าเริ่มต้น = เฉลยทันที)', modes.join(',') === 'instant:true,exam:false', modes.join(','));
    await page.click('.mode-opt[data-mode="exam"]');
    await page.fill('#nameInput', 'เจมส์');
    await page.click('#modalOk');
    await page.waitForSelector('#modal.hidden', { state: 'attached' });
    record('เลือกโหมดสอบแล้ว session เป็น exam', (await st(page)).session.mode === 'exam');
    const cells = await page.$$eval('#navGrid .cell', (c) => c.length);
    record('Navigator มี 60 ช่อง', cells === 60, cells);
    record('ชื่อหัวเกม FULL STACK EXAM QUEST', (await text(page, '.brand-title')) === 'FULL STACK EXAM QUEST');
    record('แสดงชื่อผู้ทำ', (await text(page, '#takerName')) === 'เจมส์');
    record('เริ่มที่คำถามที่ 1 / 60', (await text(page, '#qCounter')) === 'คำถามที่ 1 / 60');
    record('ข้อ 1 เป็นข้อปัจจุบันใน navigator', await page.$eval('#navGrid .cell[data-index="0"]', (e) => e.classList.contains('current')));
    record('มี Difficulty badge และ Topic badge', (await text(page, '#diffBadge')) === 'Easy' && (await text(page, '#topicBadge')).length > 0);
    const letters = await page.$$eval('#options .letter', (l) => l.map((x) => x.textContent));
    record('ตัวเลือก ก ข ค ง ครบ 4 ตัว', letters.join('') === 'ก.ข.ค.ง.', letters.join(' '));
    record('ปุ่มย้อนกลับถูกปิดที่ข้อแรก', await page.$eval('#prevBtn', (b) => b.disabled));

    // 2. select + change answer
    await choose(page, 1);
    let s = await st(page);
    record('เลือกคำตอบแล้วนับ ตอบแล้ว 1 / 60', s.session.answers.Q01 === 1 && (await text(page, '#answeredCount')) === '1');
    record('ช่องข้อ 1 เปลี่ยนเป็นสถานะตอบแล้ว', await page.$eval('#navGrid .cell[data-index="0"]', (e) => e.classList.contains('answered')));
    await choose(page, 3);
    s = await st(page);
    record('เปลี่ยนคำตอบได้ (นับยังเป็น 1 และคำตอบใหม่ถูกบันทึก)', s.session.answers.Q01 === 3 && (await text(page, '#answeredCount')) === '1');
    record('ตัวเลือกที่เลือกถูกไฮไลต์เพียงตัวเดียว', (await page.$$('#options .option.selected')).length === 1);
    record('โหมดสอบไม่เฉลยระหว่างทำ', await page.$eval('#feedback', (e) => e.classList.contains('hidden')));

    // 3. skip with next, prev
    await page.click('#nextBtn');
    await page.click('#nextBtn');
    record('ข้ามข้อด้วยปุ่มข้อถัดไป (ไปข้อ 3 โดยไม่ตอบข้อ 2)', (await currentIndex(page)) === 2 && (await st(page)).session.answers.Q02 === undefined);
    await page.click('#prevBtn');
    record('ปุ่มย้อนกลับไปข้อ 2', (await currentIndex(page)) === 1);

    // 4. jump via navigator + mark
    await goTo(page, 44);
    record('คลิกหมายเลข 45 แล้วไปข้อ 45', (await text(page, '#qCounter')) === 'คำถามที่ 45 / 60');
    await page.click('#markBtn');
    record('ทำเครื่องหมายทบทวนข้อ 45', await page.$eval('#navGrid .cell[data-index="44"]', (e) => e.classList.contains('marked'))
      && !(await page.$eval('#markedBadge', (e) => e.classList.contains('hidden'))));
    await page.keyboard.press('m');
    record('กด M ยกเลิกเครื่องหมายทบทวน', !(await page.$eval('#navGrid .cell[data-index="44"]', (e) => e.classList.contains('marked'))));
    await page.keyboard.press('m');
    await page.keyboard.press('2');
    record('คีย์ลัด 2 เลือกตัวเลือก ข', (await st(page)).session.answers.Q45 === 1);
    await page.keyboard.press('ArrowRight');
    record('คีย์ลัด → ไปข้อถัดไป', (await currentIndex(page)) === 45);
    const statusClasses = await page.$eval('#navGrid', (g) => ({
      cur: g.children[45].className, ans: g.children[0].className, mark: g.children[44].className, empty: g.children[1].className,
    }));
    record('Navigator แยกสถานะ ยังไม่ตอบ / ตอบแล้ว / ทบทวน / ข้อปัจจุบัน',
      statusClasses.cur.includes('current') && statusClasses.ans.includes('answered')
      && statusClasses.mark.includes('marked') && statusClasses.empty === 'cell', JSON.stringify(statusClasses));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOTS, 'desktop-exam.png') });

    // 5. refresh keeps progress
    await page.reload();
    await page.waitForFunction(() => window.__fseq && window.__fseq.getState().session);
    s = await st(page);
    record('Refresh แล้ว progress ไม่หาย (คำตอบ, เครื่องหมาย, ข้อปัจจุบัน, ชื่อ)',
      s.session.answers.Q01 === 3 && s.session.answers.Q45 === 1 && s.session.marked.includes('Q45')
      && s.session.current === 45 && s.name === 'เจมส์' && (await text(page, '#answeredCount')) === '2'
      && (await page.$eval('#modal', (m) => m.classList.contains('hidden'))));

    // 6. answer the whole exam: 45 correct, 10 wrong, 5 unanswered (via UI clicks)
    for (let i = 0; i < 60; i++) {
      await goTo(page, i);
      const q = Q[i];
      if (i < 45) await choose(page, q.answer);
      else if (i < 55) await choose(page, (q.answer + 1) % 4);
      else if ((await st(page)).session.answers[q.id] !== undefined) throw new Error('unexpected answer');
    }
    record('ตอบผ่าน UI ครบ 55 ข้อ', (await text(page, '#answeredCount')) === '55');
    const progressW = await page.$eval('#progressFill', (e) => e.style.width);
    record('Progress bar ตรงกับจำนวนที่ตอบ (55/60)', Math.abs(parseFloat(progressW) - (55 / 60) * 100) < 0.01, progressW);

    // 7. submit with confirm
    await goTo(page, 59);
    record('ข้อสุดท้ายปุ่มเปลี่ยนเป็นส่งข้อสอบ', (await text(page, '#nextBtn')).startsWith('ส่งข้อสอบ'));
    await page.click('#submitBtn');
    await page.waitForSelector('#modal:not(.hidden)');
    const confirmText = await text(page, '#modalBody');
    record('หน้ายืนยันเตือนข้อที่ยังไม่ตอบ 5 ข้อ', confirmText.includes('ยังไม่ได้ตอบอีก 5 ข้อ') && confirmText.includes('ทำเครื่องหมายทบทวนไว้ 1 ข้อ'), confirmText);
    await page.click('#modalCancel');
    record('กดกลับไปทำต่อ ยังไม่ส่ง', !(await st(page)).session.submitted);
    await page.click('#submitBtn');
    await page.click('#modalOk');
    await page.waitForSelector('#resultView:not(.hidden)');
    const pct = await text(page, '#scorePct');
    const sub = await text(page, '#scoreSub');
    record('คะแนน 45 / 60 = 75%', pct === '75%' && sub === '45 / 60 ข้อ', `${pct} ${sub}`);
    const bars = await page.$$eval('.bar-row .val', (v) => v.map((x) => x.textContent));
    // Q01-20 easy, Q21-40 medium, Q41-60 hard → easy 20/20, medium 20/20, hard 5/20
    record('คะแนนแยกตามระดับถูกต้อง (Easy 20/20, Medium 20/20, Hard 5/20)',
      bars[0] === '20/20 (100%)' && bars[1] === '20/20 (100%)' && bars[2] === '5/20 (25%)', bars.join(' | '));
    const topicSum = await page.$$eval('#topicTable tbody tr', (rows) => rows.reduce((a, r) => [a[0] + +r.children[1].textContent, a[1] + +r.children[2].textContent], [0, 0]));
    record('ตารางหมวดวิชารวมได้ 45 / 60', topicSum[0] === 45 && topicSum[1] === 60, topicSum.join('/'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOTS, 'desktop-result.png'), fullPage: true });

    // 8. refresh on result
    await page.reload();
    await page.waitForSelector('#resultView:not(.hidden)');
    record('Refresh หน้าผลสอบแล้วผลยังอยู่', (await text(page, '#scorePct')) === '75%');

    // 9. review with explanations + citation
    await page.click('#reviewBtn');
    await page.waitForSelector('#feedback:not(.hidden)');
    const src = await text(page, '#feedbackSource');
    record('โหมดเฉลยแสดงคำอธิบายและไฟล์/หน้าอ้างอิง', src.includes('1.1-Course Introduction 1.pdf') && src.includes('หน้า 3'), src);
    const reasons = await page.$$eval('#choiceReasons .reason', (r) => r.map((x) => x.className + '|' + x.querySelector('.reason-why').textContent));
    record('เฉลยบอกเหตุผลครบ 4 ตัวเลือก (ถูก 1 ข้อ + ทำไมผิดอีก 3 ข้อ)',
      reasons.length === 4 && reasons.filter((r) => r.includes('is-wrong') && r.includes('ผิดเพราะ ')).length === 3
      && reasons[Q[0].answer].includes('is-right'), reasons.length);
    record('เหตุผลของตัวเลือกผิดตรงกับคลังข้อสอบ', reasons.every((r, i) => i === Q[0].answer || r.endsWith(Q[0].choiceNotes[i])));
    record('โหมดเฉลยล็อกตัวเลือกและไฮไลต์คำตอบที่ถูก', await page.$eval(`#options .option[data-index="${Q[0].answer}"]`, (e) => e.classList.contains('correct') && e.disabled));
    await page.click('#reviewFilter .chip[data-filter="wrong"]');
    const wrongChip = await text(page, '#reviewFilter .chip[data-filter="wrong"]');
    record('กรองข้อที่ตอบผิดได้ 10 ข้อ และไปข้อ 46', wrongChip.includes('(10)') && (await currentIndex(page)) === 45, wrongChip);
    record('ข้อที่ผิดแสดงคำตอบของผู้ใช้เป็นสีแดง', (await page.$$('#options .option.wrong')).length === 1);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOTS, 'desktop-review.png') });
    await page.click('#reviewFilter .chip[data-filter="unanswered"]');
    record('กรองข้อที่ไม่ได้ตอบได้ 5 ข้อ', (await text(page, '#reviewFilter .chip[data-filter="unanswered"]')).includes('(5)') && (await currentIndex(page)) === 55);
    await page.click('#submitBtn'); // = กลับไปหน้าคะแนน
    await page.waitForSelector('#resultView:not(.hidden)');

    // 10. practise wrong only (10 wrong + 5 unanswered)
    const pbText = await text(page, '#practiceBtn');
    record('ปุ่มฝึกเฉพาะข้อที่ผิดนับ 15 ข้อ (ผิด 10 + ไม่ได้ตอบ 5)', pbText.includes('15'), pbText);
    await page.click('#practiceBtn');
    await page.waitForSelector('#examView:not(.hidden)');
    s = await st(page);
    const expected = Q.slice(45).map((q) => q.id);
    record('โหมดฝึกมีเฉพาะข้อที่ผิด/ไม่ได้ตอบ', JSON.stringify(s.session.ids) === JSON.stringify(expected) && (await text(page, '#qCounter')) === 'คำถามที่ 1 / 15');
    await choose(page, (Q[45].answer + 1) % 4);
    record('โหมดฝึกเฉลยทันทีพร้อมคำอธิบาย', !(await page.$eval('#feedback', (e) => e.classList.contains('hidden'))) && (await text(page, '#feedbackTitle')).startsWith('ตอบผิด'));
    record('ตัวเลือกถูกปิดหลังตรวจแล้ว', (await page.$$eval('#options .option', (o) => o.every((x) => x.disabled))));
    await page.keyboard.press(String(Q[45].answer + 1)); // try to change via keyboard
    record('โหมดฝึกล็อกคำตอบหลังตรวจแล้ว', (await st(page)).session.answers[Q[45].id] === (Q[45].answer + 1) % 4);
    for (let i = 1; i < 15; i++) { await goTo(page, i); await choose(page, Q[45 + i].answer); }
    await page.click('#submitBtn');
    await page.click('#modalOk');
    await page.waitForSelector('#resultView:not(.hidden)');
    record('ผลฝึก 14 / 15', (await text(page, '#scoreSub')) === '14 / 15 ข้อ' && (await text(page, '#resultEyebrow')) === 'ผลการฝึกข้อที่ผิด');
    record('ฝึกซ้ำข้อที่ยังผิด เหลือ 1 ข้อ', (await text(page, '#practiceBtn')).includes('(1 ข้อ)'));
    await page.click('#backToExamResultBtn');
    record('กลับไปผลสอบหลักได้ (75%)', (await text(page, '#scorePct')) === '75%' && (await text(page, '#resultEyebrow')) === 'ผลการสอบ');

    // 11. retake in instant-feedback mode
    await page.click('#retakeBtn');
    await page.waitForSelector('#modal:not(.hidden) .mode-opt');
    record('หน้าทำใหม่ให้เลือกโหมดได้', (await page.$$('#modal .mode-opt')).length === 2);
    await page.click('.mode-opt[data-mode="instant"]');
    await page.click('#modalOk');
    s = await st(page);
    record('ทำข้อสอบใหม่: ล้างคำตอบ เริ่มข้อ 1 ครบ 60 ข้อ ในโหมดเฉลยทันที',
      s.session.mode === 'instant' && s.session.ids.length === 60 && Object.keys(s.session.answers).length === 0
      && s.session.current === 0 && !s.session.submitted && (await text(page, '#answeredCount')) === '0', s.session.mode);
    record('ป้ายบอกโหมดเฉลยทันที', (await text(page, '#modeChip')) === 'โหมดเฉลยทันที');

    // 12. instant mode: reveal right after each pick, with reasons; Q1 wrong on purpose, rest correct (keyboard)
    const wrong0 = (Q[0].answer + 2) % 4;
    await page.keyboard.press(String(wrong0 + 1));
    record('เฉลยทันทีหลังเลือก (ข้อผิด)', !(await page.$eval('#feedback', (e) => e.classList.contains('hidden')))
      && (await text(page, '#feedbackTitle')).startsWith('ตอบผิด'));
    const chosenReason = await page.$eval('#choiceReasons .reason.is-chosen', (e) => e.textContent);
    record('เฉลยทันทีบอกว่าทำไมตัวที่เลือกผิด', chosenReason.includes('คุณเลือก') && chosenReason.includes(Q[0].choiceNotes[wrong0]));
    record('เฉลยทันทีแสดงไฟล์และหน้าอ้างอิง', (await text(page, '#feedbackSource')).includes('หน้า 3'));
    await page.keyboard.press(String(Q[0].answer + 1));
    record('ตอบแล้วเปลี่ยนไม่ได้ในโหมดเฉลยทันที', (await st(page)).session.answers[Q[0].id] === wrong0);
    record('Navigator แสดงข้อ 1 เป็นสีผิดทันที', await page.$eval('#navGrid .cell[data-index="0"]', (e) => e.classList.contains('wrong')));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOTS, 'desktop-instant.png'), fullPage: true });
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press(String(Q[1].answer + 1));
    record('เฉลยทันทีหลังเลือก (ข้อถูก)', (await text(page, '#feedbackTitle')).startsWith('ตอบถูก'));
    await page.reload();
    await page.waitForFunction(() => window.__fseq && window.__fseq.getState().session);
    s = await st(page);
    record('Refresh แล้วยังอยู่โหมดเฉลยทันทีและเห็นเฉลยข้อเดิม', s.session.mode === 'instant' && s.session.current === 1
      && !(await page.$eval('#feedback', (e) => e.classList.contains('hidden'))));
    for (let i = 1; i < 60; i++) {
      if (i > 1) await page.keyboard.press(String(Q[i].answer + 1));
      if (i < 59) await page.keyboard.press('ArrowRight');
    }
    record('ข้อสุดท้ายปุ่มเปลี่ยนเป็นดูสรุปคะแนน', (await text(page, '#nextBtn')).startsWith('ดูสรุปคะแนน'));
    await page.keyboard.press('ArrowRight'); // last question → submit dialog
    await page.waitForSelector('#modal:not(.hidden)');
    await page.click('#modalOk');
    await page.waitForSelector('#resultView:not(.hidden)');
    record('ผลโหมดเฉลยทันที 59/60 และฝึกข้อที่ผิดได้ 1 ข้อ', (await text(page, '#scoreSub')) === '59 / 60 ข้อ'
      && (await text(page, '#resultEyebrow')) === 'ผลการทำแบบเฉลยทันที' && (await text(page, '#practiceBtn')).includes('(1 ข้อ)'),
      await text(page, '#scoreSub'));

    record('ไม่มี error ใน console', errors.length === 0, errors.join(' | '));

    // 13. Mobile layout
    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const mp = await m.newPage();
    await mp.goto(URL);
    await mp.waitForSelector('#nameInput');
    await mp.screenshot({ path: path.join(SHOTS, 'mobile-start.png') });
    await mp.fill('#nameInput', 'เจมส์');
    await mp.click('#modalOk');
    await mp.goto(URL); // reload in mobile
    await mp.waitForFunction(() => window.__fseq && window.__fseq.getState().session);
    await mp.tap('#navGrid .cell[data-index="45"]');
    await mp.tap('#options .option[data-index="0"]');
    record('มือถือ: โหมดเฉลยทันที (ค่าเริ่มต้น) แสดงเหตุผลครบ 4 ตัวเลือก',
      (await mp.$$('#choiceReasons .reason')).length === 4 && !(await mp.$eval('#feedback', (e) => e.classList.contains('hidden'))));
    await mp.tap('#markBtn');
    const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    record('มือถือ 390px ไม่มี scroll แนวนอน', overflow <= 0, overflow);
    const btnBox = await mp.$$eval('.q-actions .btn', (bs) => bs.map((b) => b.getBoundingClientRect()).map((r) => Math.round(r.right)));
    record('ปุ่ม Previous / Mark / Next อยู่ในจอมือถือ', btnBox.every((r) => r <= 390), btnBox.join(','));
    record('มือถือ: เลือกคำตอบและทำเครื่องหมายได้', (await mp.evaluate(() => window.__fseq.getState().session.marked.includes('Q46'))));
    await mp.evaluate(() => window.scrollTo(0, 0));
    await mp.waitForTimeout(400);
    await mp.screenshot({ path: path.join(SHOTS, 'mobile-exam.png') });
    await mp.screenshot({ path: path.join(SHOTS, 'mobile-full.png'), fullPage: true });
    await mp.$eval('#feedback', (e) => e.scrollIntoView({ block: 'start' }));
    await mp.waitForTimeout(300);
    await mp.screenshot({ path: path.join(SHOTS, 'mobile-instant.png') });
    await m.close();
  } catch (e) {
    record('ข้อผิดพลาดระหว่างทดสอบ', false, e.stack || e.message);
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  fs.writeFileSync(path.join(__dirname, 'last-run.json'), JSON.stringify(results, null, 2));
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}
main();
