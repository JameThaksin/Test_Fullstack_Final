# FULL STACK EXAM QUEST

เกมข้อสอบทบทวนวิชา Full Stack Web Development 60 ข้อ (Easy 20 / Medium 20 / Hard 20)
หน้าตาอิงจากภาพต้นแบบ BIG DATA QUIZ: พื้นหลัง Dark Navy, สีเน้นน้ำเงิน/ม่วง, การ์ดคำถามด้านซ้าย และตารางเลือกข้อ (Navigator) ด้านขวา

ใช้ HTML + CSS + Vanilla JavaScript (ES Modules) ไม่ต้อง build และไม่มี dependency ตอนใช้งาน

## วิธีเปิดใช้งาน

> ต้องเปิดผ่าน web server เพราะเกมโหลดคลังข้อสอบจาก `data/questions.json` ด้วย `fetch()`
> ถ้าดับเบิลคลิก `index.html` (เปิดแบบ `file://`) เบราว์เซอร์จะบล็อกการโหลด JSON และหน้าเว็บจะขึ้นข้อความแจ้งวิธีแก้

**VS Code Live Server**
1. เปิดโฟลเดอร์ `full-stack-exam-quest` ใน VS Code
2. ติดตั้งส่วนขยาย *Live Server* (Ritwick Dey)
3. คลิกขวาที่ `index.html` แล้วเลือก **Open with Live Server**

**เปิดด้วย Python (ทางเลือก)**
```bash
cd full-stack-exam-quest
python3 -m http.server 5500
# แล้วเปิด http://localhost:5500
```

## Deploy

**GitHub Pages**
1. สร้าง repository ใหม่ แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ (ให้ `index.html` อยู่ที่ root ของ repo)
2. ไปที่ Settings → Pages → Branch: `main` / folder `/ (root)` → Save
3. รอประมาณ 1–5 นาที จะได้ลิงก์ `https://<username>.github.io/<repo>/`

ทุก path ในโปรเจกต์เป็น relative path จึงทำงานได้ทั้งเมื่อโฮสต์ที่ root และใต้ path ย่อยของ GitHub Pages

**Vercel**
1. Import repository เข้า Vercel
2. Framework Preset: **Other**, Build Command: เว้นว่าง, Output Directory: `.` (root)
3. Deploy

## สิ่งที่ทำได้

- เลือกโหมดตอนเริ่มและตอนทำใหม่:
  - **เฉลยทันทีทีละข้อ** (ค่าเริ่มต้น): เลือกคำตอบแล้วรู้ทันทีว่าถูกหรือผิด พร้อมคำอธิบาย ไฟล์ + หน้าอ้างอิง และเหตุผลของทั้ง 4 ตัวเลือกว่าทำไมข้อถูกจึงถูกและข้ออื่นผิดเพราะอะไร (ตอบแล้วเปลี่ยนไม่ได้)
  - **โหมดสอบ**: ทำครบแล้วค่อยส่ง จึงเห็นคะแนนและเฉลย
- เลือกคำตอบ ก ข ค ง (คลิกหรือกดปุ่ม 1–4) ในโหมดสอบเปลี่ยนคำตอบได้จนกว่าจะส่ง
- ข้ามข้อ, ปุ่ม Previous / Next (หรือปุ่มลูกศร ← →)
- ทำเครื่องหมายทบทวน (ปุ่ม ★ หรือกด M)
- คลิกหมายเลขใน Navigator เพื่อไปข้อนั้น โดย Navigator แยกสถานะ ยังไม่ตอบ / ตอบแล้ว / ทบทวน / ข้อปัจจุบัน
- ดูจำนวนข้อที่ตอบแล้วและ Progress Bar
- ส่งข้อสอบ (มีหน้ายืนยันที่เตือนข้อที่ยังไม่ตอบ) แล้วดูคะแนน, เปอร์เซ็นต์, คะแนนแยกตามระดับและหมวด
- ดูเฉลย คำอธิบาย เหตุผลรายตัวเลือก และไฟล์สไลด์ + เลขหน้าอ้างอิงของทุกข้อ กรองดูเฉพาะข้อผิด / ไม่ได้ตอบ / ที่ทำเครื่องหมายได้
- ทำข้อสอบใหม่ทั้งหมด หรือฝึกเฉพาะข้อที่ผิด (โหมดฝึกจะเฉลยทันทีหลังเลือกตอบ)
- บันทึกความคืบหน้าใน `localStorage` อัตโนมัติ รีเฟรชแล้วไม่หาย
- Responsive ทั้ง Desktop และมือถือ

## โครงสร้างโปรเจกต์

```
full-stack-exam-quest/
├── index.html            หน้าเกม (header, การ์ดคำถาม, navigator, modal)
├── css/style.css         ธีมและ layout ทั้งหมด (ตัวแปรสีอยู่ใน :root)
├── js/
│   ├── main.js           ควบคุม UI, การนำทาง, การส่งข้อสอบ, โหมดเฉลยทันที/สอบ/ฝึก
│   ├── exam.js           ตรรกะล้วน: สร้าง session, คิดคะแนน, ตรวจคลังข้อสอบ, จัดรูปแบบเลขหน้า
│   └── store.js          บันทึก/โหลดความคืบหน้าจาก localStorage
├── data/questions.json   คลังข้อสอบ 60 ข้อ + รายชื่อไฟล์สไลด์ + หมวดวิชา
├── tests/
│   ├── validate-bank.cjs ตรวจคลังข้อสอบ (จำนวน, ระดับ, เฉลย, เลขหน้า, การคิดคะแนน)
│   ├── e2e.test.cjs      เล่นเกมจริงผ่านเบราว์เซอร์ (Playwright) ทั้ง desktop และมือถือ
│   └── screenshots/      ภาพหน้าจอจากการทดสอบ
└── REPORT_TH.md          รายงานสรุป, Blueprint และตารางอ้างอิงทุกข้อ
```

## รูปแบบคลังข้อสอบ (`data/questions.json`)

```json
{
  "id": "Q46",
  "difficulty": "hard",
  "topic": "bs",
  "question": "แต่ละ div มี class=\"col-lg-3 col-md-4 col-sm-6\" ...",
  "code": "(ไม่บังคับ) โค้ดประกอบคำถาม",
  "choices": ["...", "...", "...", "..."],
  "answer": 1,
  "choiceNotes": ["ทำไมตัวเลือก ก ผิด", null, "ทำไมตัวเลือก ค ผิด", "ทำไมตัวเลือก ง ผิด"],
  "explanation": "เหตุผลของคำตอบ อ้างอิงเนื้อหาสไลด์",
  "note": "(ไม่บังคับ) หมายเหตุเมื่อใช้การอนุมานนอกเหนือจากที่สไลด์พิมพ์ไว้",
  "source": { "doc": "bs", "pages": [95, 97, 100] }
}
```

- `answer` คือ index ของตัวเลือกที่ถูก (0 = ก, 1 = ข, 2 = ค, 3 = ง)
- `choiceNotes` เรียงตรงกับ `choices` ช่องของคำตอบที่ถูกเป็น `null` ช่องอื่นเป็นเหตุผลว่าทำไมตัวเลือกนั้นผิด
- `topic` ต้องตรงกับ key ใน `topics` และ `source.doc` ต้องตรงกับ key ใน `sources`
- เลขหน้า: ไฟล์ `.pdf` = เลขหน้า PDF, ไฟล์ `.pptx` = เลขสไลด์, ไฟล์ `.pdf.txt` = เลขสไลด์ที่พิมพ์อยู่ในไฟล์ข้อความ
- เพิ่ม/แก้ข้อสอบแล้วให้รัน `node tests/validate-bank.cjs` เพื่อตรวจว่าโครงสร้างและเลขหน้ายังถูกต้อง

## การทดสอบ

```bash
node tests/validate-bank.cjs   # ไม่ต้องใช้เบราว์เซอร์
node tests/e2e.test.cjs        # ต้องมี playwright (npm i -D playwright) และ python3
# ทดสอบเว็บที่ deploy แล้ว:
BASE_URL=https://<username>.github.io/<repo>/ node tests/e2e.test.cjs
```

> หมายเหตุ: เป็นชุดฝึกทบทวน ไม่ใช่ข้อสอบทางการของรายวิชา
