# รายงานสรุป Full Stack Exam Quest (เวอร์ชัน 2)

## 1. ผลลัพธ์โดยรวม

| รายการ | ผล |
|---|---|
| จำนวนข้อสอบจริง | **60 ข้อ** (ไม่มีคำถามซ้ำ) |
| แบ่งตามระดับ | **Easy 20 / Medium 20 / Hard 20** |
| โหมด | **เฉลยทันทีทีละข้อ** (ค่าเริ่มต้น) และ **โหมดสอบ** (ทำครบแล้วส่ง) + ฝึกเฉพาะข้อที่ผิด |
| เหตุผลรายตัวเลือก | ทุกข้อบอกว่าข้อถูกถูกเพราะอะไร และตัวเลือกผิดอีก 3 ตัวผิดเพราะอะไร (รวม 180 เหตุผล) |
| ตำแหน่งเฉลย | ก 15 / ข 15 / ค 15 / ง 15 (กระจายเท่ากัน เดาจากตำแหน่งไม่ได้) |
| ความยาวตัวเลือก | ตัวเลือกที่ถูกเป็นตัวที่ยาวที่สุดเพียง 15/60 ข้อ (ใกล้ค่าสุ่ม 1 ใน 4) จึงเดาจากความยาวไม่ได้ |
| ไฟล์สไลด์ที่อ้างอิง | ครบทั้ง 12 ไฟล์ที่ได้รับ |
| หมวดวิชา | 11 หมวด |
| ตรวจคลังข้อสอบ (`tests/validate-bank.cjs`) | ผ่าน 15/15 |
| ทดสอบเล่นจริงบนเบราว์เซอร์ (`tests/e2e.test.cjs`) | ผ่าน 67/67 (desktop 1440px + มือถือ 390px) |

### สิ่งที่เปลี่ยนจากเวอร์ชันแรก

- **เฉลยทันทีทีละข้อ:** ตอนเริ่มและตอนทำใหม่เลือกได้ระหว่าง "เฉลยทันทีทีละข้อ" กับ "โหมดสอบ" ในโหมดเฉลยทันที พอเลือกคำตอบจะเห็นทันทีว่าถูกหรือผิด พร้อมคำอธิบาย ไฟล์และหน้าอ้างอิง และรายการเหตุผลของทั้ง 4 ตัวเลือก ตัวที่ผู้ทำเลือกมีป้าย "คุณเลือก" ตอบแล้วเปลี่ยนไม่ได้ และ Navigator เปลี่ยนเป็นสีถูก/ผิดทันที ทำครบแล้วกดดูสรุปคะแนนแยกระดับและหมวดได้เหมือนโหมดสอบ
- **บอกว่าทำไมข้ออื่นผิด:** ทุกข้อมีเหตุผลของตัวเลือกผิดแต่ละตัว (`choiceNotes` ในไฟล์ JSON) แสดงทั้งในโหมดเฉลยทันที หน้าดูเฉลยหลังส่ง และโหมดฝึกข้อที่ผิด
- **ยากขึ้น:** เปลี่ยนข้อที่ถามแค่ชื่อย่อหรือนิยามตรง ๆ เป็นคำถามแบบสถานการณ์และอ่านโค้ด (เช่น ผลของ `==` กับ `===`, specificity, ลำดับการโหลด CSS กับ Bootstrap, Promise ที่ถูก Rejected, ส่งฟอร์ม POST ไปยัง route ที่มีแค่ GET, `getElementsByClassName` ที่คืนค่า HTMLCollection, LIMIT/OFFSET, Salting) และเขียนตัวเลือกผิดให้เป็นความเข้าใจผิดที่พบบ่อย มีเหตุผลฟังขึ้น ไม่ใช่ตัวเลือกหลอกที่ตัดทิ้งได้ง่าย
- โหมดสอบแบบเดิมยังอยู่ครบ (เปลี่ยนคำตอบได้จนกว่าจะส่ง ข้ามข้อ ทำเครื่องหมาย ส่งแล้วดูเฉลย ฝึกเฉพาะข้อที่ผิด)
- ความคืบหน้าที่บันทึกไว้ของเวอร์ชันแรกจะถูกล้างหนึ่งครั้ง เพราะข้อสอบเปลี่ยนทั้งชุด

## 2. ไฟล์สไลด์ที่อ่านและหัวข้อสำคัญ

| ไฟล์ | จำนวนหน้า/สไลด์ | สาระสำคัญที่ใช้ออกข้อสอบ |
|---|---|---|
| 1.1-Course Introduction 1.pdf | 22 หน้า | องค์ประกอบ Full Stack (Front-End + Backend + Database), เทคโนโลยีในวิชา |
| 1.2-Front End Web Development.pdf | 16 หน้า | Internet, Server/Client, ISP, DNS, Internet Backbone, หน้าที่ Web Browser, HTML/CSS/JS |
| 2 - HTML 2.pdf | 69 หน้า | Boilerplate, anatomy ของ tag, self-closing tag, em/i, strong/b, semantic, alt, list, table, form, GitHub Pages, คำสั่ง Git |
| 3 - Intro to CSS.pptx | 174 สไลด์ | Inline/Internal/External CSS, syntax, selector, specificity, ID vs Class, Box Model, display, position, centering, font, em/rem, float |
| 4 - Introduction to Bootstrap.pptx | 103 สไลด์ | Bootstrap, การลิงก์ CSS, !important, wireframe, Navbar (expand, ms-auto, toggler), Grid 12 หน่วย, breakpoint sm/md/lg |
| 5 - Introduction to JavaScript 1.pdf | 67 หน้า | Data types, typeof, ตัวแปร, string length/slice, function, Math.random/floor, if-else, == vs ===, array, FizzBuzz, while |
| 6 - The Document Object Model DOM.pdf.txt | 120 สไลด์ | Inline/Internal/External JS, ตำแหน่ง script, DOM, querySelector, getElementBy*, classList, innerHTML/textContent, attribute, addEventListener, callback, higher-order function, JS object/JSON, keydown |
| BE1 - Backend Web Development.pdf | 82 หน้า | Node.js, npm, package.json, Express, routing, req/res, fs แบบ asynchronous (serial/parallel), callback hell, async/await |
| BE2 - Body Parser.pdf | 52 หน้า | 404 middleware, Promise, async/await, body-parser, POST request, res.send vs res.sendFile, __dirname, Number() |
| BE3 - API.pdf | 58 หน้า | express.static, API, sync/async, JSON, serialization, REST (stateless, HTTP methods), Postman, endpoint, query parameters, authentication |
| BE4 - Database.pdf.txt | 265 สไลด์ | axios, HTTP status code, CRUD API, SQL (CREATE/SELECT/WHERE/LIMIT/OFFSET/UPDATE/DELETE), constraints, ความสัมพันธ์ของตาราง, JOIN, aggregate, GROUP BY/HAVING |
| BE7 - MongoDB.pdf | 54 หน้า | MongoDB, dotenv/.env, .gitignore, CRUD, Basic Auth, Base64, hashing, salting, bcrypt |

## 3. Blueprint ข้อสอบ 60 ข้อ

| หมวด | Easy | Medium | Hard | รวม |
|---|---|---|---|---|
| พื้นฐานเว็บ & Front-End | 3 | 1 | 1 | 5 |
| HTML | 2 | 2 | 1 | 5 |
| CSS | 3 | 2 | 3 | 8 |
| Bootstrap | 2 | 2 | 2 | 6 |
| JavaScript | 2 | 2 | 2 | 6 |
| DOM & Events | 2 | 2 | 3 | 7 |
| Node.js & Express | 2 | 2 | 1 | 5 |
| Body Parser & Async | 1 | 2 | 1 | 4 |
| API & REST | 1 | 2 | 1 | 4 |
| Database & SQL | 1 | 2 | 3 | 6 |
| MongoDB & Security | 1 | 1 | 2 | 4 |
| **รวม** | **20** | **20** | **20** | **60** |

แนวทางระดับ: Easy = เข้าใจหลักการพื้นฐานและแยกแยะจากความเข้าใจผิดที่พบบ่อย, Medium = เลือกวิธีที่ถูกในสถานการณ์จริงหรืออ่านโค้ดสั้น ๆ, Hard = วิเคราะห์โค้ด คำนวณผลลัพธ์ หาสาเหตุของบั๊ก หรือเรียงลำดับขั้นตอนหลายขั้น

## 4. การตรวจความถูกต้องของแหล่งอ้างอิง

- ทุกข้อระบุชื่อไฟล์และเลขหน้า/สไลด์ และตรวจด้วยสคริปต์ว่าเลขหน้าไม่เกินจำนวนหน้าของไฟล์
- ตรวจด้วยสคริปต์อีกชั้นว่าคำสำคัญในคำตอบที่ถูกและโค้ดในโจทย์ปรากฏอยู่จริงในข้อความของหน้าที่อ้างอิง (ทุกข้อที่คำตอบมีคำภาษาอังกฤษหรือโค้ด พบคำสำคัญในหน้าที่อ้างอิง ส่วนคำที่ไม่พบเป็นเพียงค่าตัวอย่างในโค้ด เช่น "Hello World", "green")
- เลขหน้าของไฟล์ `.pdf` คือเลขหน้า PDF, `.pptx` คือเลขสไลด์, ไฟล์ `.pdf.txt` (DOM, Database) คือเลขสไลด์ที่พิมพ์อยู่ในไฟล์ข้อความ ซึ่งบางช่วงตัวเลขหายไป ข้อสอบจึงอ้างเฉพาะสไลด์ที่ข้อความชัดเจน และบางข้ออ้างเป็นช่วงหลายสไลด์
- สไลด์บางส่วนของ BE4 (ข้อความภาษาไทยในบางหน้า) อ่านไม่ออกเพราะฟอนต์เข้ารหัสผิด จึงออกข้อสอบจากส่วนที่อ่านได้ชัด (คำสั่ง SQL, ตัวอย่าง, ภาษาอังกฤษ) เป็นหลัก
- เหตุผลของตัวเลือกผิดอิงเนื้อหาสไลด์เป็นหลัก และบอกเลขหน้าไว้เมื่อเหตุผลมาจากหน้าอื่นของสไลด์

**ข้อที่ใช้การอนุมานหรือความรู้เสริมนอกสไลด์** (มีหมายเหตุสีเหลืองแสดงในเฉลยของข้อนั้นด้วย):

- ข้อ 24: เหตุผลที่ว่าลำดับการเขียนมีผลเฉพาะเมื่อ specificity เท่ากัน เป็นความรู้เสริมที่สไลด์ไม่ได้เขียนไว้ตรง ๆ
- ข้อ 27: ความหมายของ me-auto (margin ด้าน end) อนุมานจากรูปแบบ m + s ในสไลด์ และตัวอย่าง Navbar ในสไลด์ 20
- ข้อ 35: ลำดับที่ .catch() รับ error จาก .then() ด้านบนทั้งหมด อนุมานจากหลัก Chainable ในสไลด์
- ข้อ 48: ผลของการสลับลำดับเงื่อนไขอนุมานจากการทำงานของ if-else ในสไลด์ ไม่ได้มีตัวอย่างนี้ในสไลด์โดยตรง
- ข้อ 49: เรื่องโอกาสไม่เท่ากันของ Math.round เป็นความรู้เสริมนอกสไลด์
- ข้อ 54: ค่า "711" เป็นผลของการต่อ String ใน JavaScript สไลด์บอกสาเหตุ (ข้อมูลเป็น String) แต่ไม่ได้พิมพ์ผลนี้ไว้ตรง ๆ

## 5. ผลการทดสอบ

**ตรวจคลังข้อสอบ (15/15 ผ่าน)**: จำนวน 60 ข้อ, 20/20/20, ทุกข้อมี 4 ตัวเลือกไม่ซ้ำและเฉลยเดียว, เลขหน้าอยู่ในช่วง, คำถามไม่ซ้ำ, ภาษาไทยครบ, ทุกข้อมีเหตุผลของตัวเลือกผิดครบ 3 ตัว, ตัวเลือกที่ถูกไม่ได้ยาวที่สุดเสมอ, เฉลยกระจายเท่ากัน, อ้างอิงครบ 12 ไฟล์, ใช้ครบ 11 หมวด, คิดคะแนน 45/60 = 75% และ 7/60 = 11.67% ถูกต้อง

**เล่นจริงบนเบราว์เซอร์ (67/67 ผ่าน)** ครอบคลุม:
- หน้าเริ่มให้เลือกโหมด (ค่าเริ่มต้น = เฉลยทันที), ใส่ชื่อ, Navigator 60 ช่อง, badge ระดับ/หมวด, ตัวเลือก ก ข ค ง
- โหมดสอบ: เลือกและเปลี่ยนคำตอบ, ไม่เฉลยระหว่างทำ, ข้ามข้อ, ย้อนกลับ, คลิกเลขข้อ, ทำ/ยกเลิกเครื่องหมายทบทวน, คีย์ลัด, Navigator แยก 4 สถานะ
- รีเฟรชแล้วคำตอบ เครื่องหมาย ข้อปัจจุบัน ชื่อ และโหมดยังอยู่ รวมถึงหลังส่งแล้วผลยังอยู่
- ตอบผ่าน UI ครบ 55 ข้อ (ถูก 45, ผิด 10, ไม่ตอบ 5) → Progress 91.67%, หน้ายืนยันเตือน 5 ข้อ, คะแนน 45/60 = 75%, แยกระดับ 20/20, 20/20, 5/20 และตารางหมวดรวม 45/60
- หน้าเฉลยแสดงคำอธิบาย ไฟล์/หน้า และเหตุผลครบ 4 ตัวเลือกตรงกับคลังข้อสอบ, ตัวกรองข้อผิด (10) / ไม่ได้ตอบ (5)
- ฝึกเฉพาะข้อที่ผิด 15 ข้อ เฉลยทันที ล็อกคำตอบ ได้ 14/15 แล้วกลับไปผลสอบหลักได้
- ทำใหม่โดยเลือกโหมดเฉลยทันที: เลือกผิดแล้วเห็นทันทีว่าผิด พร้อมเหตุผลของตัวที่เลือก, ล็อกคำตอบ, Navigator เป็นสีผิดทันที, ข้อถูกขึ้นว่าตอบถูก, รีเฟรชแล้วยังอยู่โหมดเดิม, ทำครบได้ 59/60 และฝึกข้อที่ผิดต่อได้ 1 ข้อ
- ไม่มี error ใน console, มือถือ 390px ไม่มี scroll แนวนอน ปุ่มอยู่ในจอ และเหตุผลรายตัวเลือกแสดงครบ

ภาพหน้าจอจากการทดสอบอยู่ใน `tests/screenshots/` (เช่น `desktop-instant.png`, `mobile-instant.png`) และผลแต่ละข้ออยู่ใน `tests/last-run.json`, `tests/last-validate.json`

## 6. วิธีเปิดใช้งาน

ดูรายละเอียดใน `README.md` สรุปคือ เปิดโฟลเดอร์ใน VS Code แล้วคลิกขวา `index.html` → Open with Live Server หรือ deploy ทั้งโฟลเดอร์ขึ้น GitHub Pages / Vercel ได้ทันที (ไม่ต้อง build)

## 7. ตารางข้อสอบ เฉลย และแหล่งอ้างอิง (สำหรับผู้สอน/ผู้ตรวจ)

| ข้อ | ระดับ | หมวด | คำถาม (ย่อ) | เฉลย | ไฟล์อ้างอิง | หน้า/สไลด์ |
|---|---|---|---|---|---|---|
| 01 | Easy | พื้นฐานเว็บ & Front-End | เพื่อนคนหนึ่งบอกว่า "Full Stack คือการทำหน้าเว็บด้วย HTML, CSS และ Jav… | ค | 1.1-Course Introduction 1.pdf | 3 |
| 02 | Easy | พื้นฐานเว็บ & Front-End | ทำไม Client จึงต้องผ่าน DNS Server ก่อนจะส่ง Request ไปยัง google.com … | ก | 1.2-Front End Web Development.pdf | 4, 6, 7 |
| 03 | Easy | พื้นฐานเว็บ & Front-End | หน้าเว็บหนึ่งแสดงหัวข้อและข้อความครบ แต่ไม่มีสีหรือการจัดวางใด ๆ และกด… | ค | 1.2-Front End Web Development.pdf | 12, 13 |
| 04 | Easy | HTML | ข้อใดอธิบายแท็ก <br> และ <hr> ได้ถูกต้องตามสไลด์ | ข | 2 - HTML 2.pdf | 14–16 |
| 05 | Easy | HTML | ต้องการทำลิงก์จากหน้า index.html ไปหน้า contact.html ที่อยู่ในโฟลเดอร์… | ค | 2 - HTML 2.pdf | 45, 47 |
| 06 | Easy | CSS | ใน <body style="background-color:blue;"> ส่วน background-color:blue คื… | ง | 3 - Intro to CSS.pptx | 7 |
| 07 | Easy | CSS | เว็บไซต์มี 10 หน้า ต้องการเปลี่ยนสีพื้นหลังของทุกหน้าโดยแก้โค้ดเพียงที… | ข | 3 - Intro to CSS.pptx | 9, 24, 29 |
| 08 | Easy | CSS | กำหนด .box { padding: 20px; margin: 10px; } ข้อใดอธิบายตำแหน่งของพื้นท… | ข | 3 - Intro to CSS.pptx | 78, 85, 86 |
| 09 | Easy | Bootstrap | ข้อใดตรงกับความหมายของ Responsive Web Design ตามสไลด์ Bootstrap | ก | 4 - Introduction to Bootstrap.pptx | 6, 78 |
| 10 | Easy | Bootstrap | ใน <div class="row"> มี <div class="col-6"> และ <div class="col-3"> แถ… | ข | 4 - Introduction to Bootstrap.pptx | 84, 85 |
| 11 | Easy | JavaScript | คำสั่ง typeof("123"); ได้ผลลัพธ์เป็นอะไร | ข | 5 - Introduction to JavaScript 1.pdf | 15 |
| 12 | Easy | JavaScript | n = Math.floor(Math.random() * 6) + 1; ค่า n ที่เป็นไปได้คือข้อใด | ก | 5 - Introduction to JavaScript 1.pdf | 42, 43 |
| 13 | Easy | DOM & Events | ทำไมสไลด์จึงแนะนำให้วาง <script src="index.js"></script> ไว้บรรทัดสุดท… | ก | 6 - The Document Object Model DOM.pdf.txt | 12, 76 |
| 14 | Easy | DOM & Events | ต้องการเลือก <h1 id="title"> ด้วย querySelector ข้อใดถูกต้อง | ง | 6 - The Document Object Model DOM.pdf.txt | 46, 47 |
| 15 | Easy | Node.js & Express | บรรทัด const express = require('express'); ทำหน้าที่อะไร | ง | BE1 - Backend Web Development.pdf | 18, 19 |
| 16 | Easy | Node.js & Express | ใน app.get('/', (req, res) => { ... }) handler ต้องส่งข้อมูลกลับไปให้ผ… | ค | BE1 - Backend Web Development.pdf | 67, 71 |
| 17 | Easy | Body Parser & Async | index.html มี <form action="/" method="post"> แต่ calculator.js มีเพีย… | ก | BE2 - Body Parser.pdf | 30, 31, 33, 34 |
| 18 | Easy | API & REST | ต้องการแก้ไขข้อมูลสินค้าที่มีอยู่แล้วผ่าน REST API ควรใช้ HTTP Method … | ค | BE3 - API.pdf | 38 |
| 19 | Easy | Database & SQL | API ตอบกลับด้วย 500 Internal Server Error ข้อใดตีความได้ถูกต้อง | ง | BE4 - Database.pdf.txt | 19, 24 |
| 20 | Easy | MongoDB & Security | ข้อใดตรงกับลักษณะของ MongoDB ตามสไลด์ | ข | BE7 - MongoDB.pdf | 3, 4 |
| 21 | Medium | พื้นฐานเว็บ & Front-End | ตามหน้าที่ของ Web Browser 5 ขั้น ข้อใดระบุขั้นที่เกิด "ก่อน" Direct Re… | ค | 1.2-Front End Web Development.pdf | 9 |
| 22 | Medium | HTML | ข้อใดอธิบายความต่างระหว่าง <em> กับ <i> ได้ถูกต้อง | ง | 2 - HTML 2.pdf | 26, 28 |
| 23 | Medium | HTML | รูปภาพลายเส้นตกแต่งพื้นหลังไม่มีความหมายต่อเนื้อหา สไลด์แนะนำให้กำหนด … | ข | 2 - HTML 2.pdf | 30 |
| 24 | Medium | CSS | จากโค้ดด้านล่าง ข้อความใน <h1 class="title"> จะเป็นสีอะไร | ค | 3 - Intro to CSS.pptx | 48, 50 |
| 25 | Medium | CSS | เขียน span { width: 100px; } แล้วความกว้างของ <span> ไม่เปลี่ยน ถ้าต้อ… | ง | 3 - Intro to CSS.pptx | 91, 96 |
| 26 | Medium | Bootstrap | ใช้ Bootstrap แล้วเขียน h1 { font-size: ... } ใน styles.css แต่ขนาดไม่… | ง | 4 - Introduction to Bootstrap.pptx | 23, 25, 27 |
| 27 | Medium | Bootstrap | ใน Navbar ต้องการดัน <ul class="navbar-nav"> ไปชิดขวา ควรเพิ่ม class ใ… | ง | 4 - Introduction to Bootstrap.pptx | 64–66 |
| 28 | Medium | JavaScript | จากโค้ดด้านล่าง ผลของ a == b และ a === b คืออะไรตามลำดับ | ง | 5 - Introduction to JavaScript 1.pdf | 50 |
| 29 | Medium | JavaScript | ผู้ใช้กรอกชื่อ "cHaNakarn" ในโค้ดด้านล่าง alert จะแสดงข้อความใด | ง | 5 - Introduction to JavaScript 1.pdf | 29, 31, 32 |
| 30 | Medium | DOM & Events | เดิมปุ่มยังไม่มี class invisible ถ้าเรียกคำสั่งด้านล่าง 3 ครั้งติดกัน … | ค | 6 - The Document Object Model DOM.pdf.txt | 61–64 |
| 31 | Medium | DOM & Events | จาก HTML ด้านล่าง ผลของ innerHTML และ textContent ของ h1 คือข้อใด | ค | 6 - The Document Object Model DOM.pdf.txt | 67, 68 |
| 32 | Medium | Node.js & Express | เพื่อนส่งโปรเจกต์ Express มาโดยไม่มีโฟลเดอร์ node_modules มีแค่ packag… | ค | BE1 - Backend Web Development.pdf | 48–50 |
| 33 | Medium | Node.js & Express | งานใดเหมาะกับ Node.js "น้อยที่สุด" ตามสไลด์ | ค | BE1 - Backend Web Development.pdf | 10, 11 |
| 34 | Medium | Body Parser & Async | ต้องการให้ route "/" ส่งไฟล์ index.html กลับไปให้เบราว์เซอร์ โค้ดใดถูก… | ก | BE2 - Body Parser.pdf | 21, 22, 24, 25 |
| 35 | Medium | Body Parser & Async | จากโค้ดด้านล่าง ถ้าไม่มีไฟล์ example.txt อยู่จริง จะเกิดอะไรขึ้น | ค | BE2 - Body Parser.pdf | 9, 10 |
| 36 | Medium | API & REST | แยกส่วนประกอบของ Request ด้านล่างได้ถูกต้องตามข้อใด | ง | BE3 - API.pdf | 44, 55 |
| 37 | Medium | API & REST | หน้า bmiCalculator.html โหลดได้ แต่ styles.css ไม่ทำงาน ตามสไลด์ควรแก้… | ค | BE3 - API.pdf | 7–9 |
| 38 | Medium | Database & SQL | ใน API เวิร์กช็อป #4.1 คำขอ 3 รายการต่อไปนี้ได้ Status Code อะไรตามลำด… | ก | BE4 - Database.pdf.txt | 30, 33, 37 |
| 39 | Medium | Database & SQL | ตาราง users มี username varchar(40) primary key และมี 'admin' อยู่แล้ว… | ง | BE4 - Database.pdf.txt | 122, 141 |
| 40 | Medium | MongoDB & Security | ทำไมสไลด์จึงให้เก็บ username/password ของฐานข้อมูลไว้ในไฟล์ .env และเพ… | ง | BE7 - MongoDB.pdf | 15, 21, 27 |
| 41 | Hard | พื้นฐานเว็บ & Front-End | ข้อใดเรียงลำดับเส้นทางเมื่อ Client ต้องการดู google.com ได้ถูกต้องตามส… | ง | 1.2-Front End Web Development.pdf | 6–8 |
| 42 | Hard | HTML | ข้อใดเรียงลำดับคำสั่ง Git สำหรับอัปโหลดโปรเจกต์ขึ้น GitHub "ครั้งแรก" … | ค | 2 - HTML 2.pdf | 41, 43 |
| 43 | Hard | CSS | ใน [PA 4.4] Move the Cloud ทำไมต้องกำหนด .top-container { position: re… | ข | 3 - Intro to CSS.pptx | 105, 114, 116, 131 |
| 44 | Hard | CSS | ให้ 1em = 16px เป็นค่าเริ่มต้นของเบราว์เซอร์ จากโค้ดด้านล่าง h1 มีขนาด… | ก | 3 - Intro to CSS.pptx | 155, 156, 158, 159 |
| 45 | Hard | CSS | body มี text-align: center; แต่เมื่อกำหนด h1 { width: 10%; } แล้ว h1 ไ… | ข | 3 - Intro to CSS.pptx | 122, 124, 125 |
| 46 | Hard | Bootstrap | ทุก div มี class="col-lg-3 col-md-4 col-sm-6" ถ้า viewport กว้าง 800px… | ข | 4 - Introduction to Bootstrap.pptx | 95, 97, 100 |
| 47 | Hard | Bootstrap | Navbar ใช้ class="navbar navbar-expand-lg" เมนูเรียงแนวนอนบน Laptop แต… | ก | 4 - Introduction to Bootstrap.pptx | 52, 54–56 |
| 48 | Hard | JavaScript | จากโค้ด FizzBuzz ด้านล่าง ค่าที่ถูก push เมื่อ count = 10, 12, 15 คือข… | ก | 5 - Introduction to JavaScript 1.pdf | 47, 58, 65 |
| 49 | Hard | JavaScript | Love Calculator ต้องการคะแนนจำนวนเต็มตั้งแต่ 0 ถึง 100 (รวม 0 และ 100)… | ข | 5 - Introduction to JavaScript 1.pdf | 43, 45 |
| 50 | Hard | DOM & Events | จากโค้ดด้านล่าง การเติม () หลัง handleClick ทำให้เกิดอะไรขึ้น | ก | 6 - The Document Object Model DOM.pdf.txt | 79, 81–83 |
| 51 | Hard | DOM & Events | ทำไมคำสั่งด้านล่างจึงไม่เปลี่ยนข้อความบนปุ่ม และต้องแก้อย่างไร | ก | 6 - The Document Object Model DOM.pdf.txt | 42, 43 |
| 52 | Hard | DOM & Events | จากโค้ดด้านล่าง calculator(55, 66, multiply) ได้ผลเท่าใด และ calculato… | ก | 6 - The Document Object Model DOM.pdf.txt | 90, 92, 118 |
| 53 | Hard | Node.js & Express | เรียก fs.writeFile และ fs.readFile ของ 4 ไฟล์ต่อกันแบบไม่ซ้อนใน callba… | ข | BE1 - Backend Web Development.pdf | 8, 31–34, 36, 37, 42 |
| 54 | Hard | Body Parser & Async | ผู้ใช้กรอก 7 และ 11 แล้วกด Calculate ก่อนแก้โค้ด (ยังไม่ใช้ Number) se… | ก | BE2 - Body Parser.pdf | 42–44 |
| 55 | Hard | API & REST | หลักการ Stateless ของ REST API หมายความว่าอย่างไร | ข | BE3 - API.pdf | 38, 39 |
| 56 | Hard | Database & SQL | ตาราง users มี 3 แถว (id 1, 2, 3 ตามลำดับ) คำสั่งด้านล่างจะได้แถวใด | ค | BE4 - Database.pdf.txt | 108, 109 |
| 57 | Hard | Database & SQL | ตาราง persons มี unique (first_name, last_name) และมี ('John', 'Lennon… | ข | BE4 - Database.pdf.txt | 139, 140 |
| 58 | Hard | Database & SQL | ข้อใดออกแบบความสัมพันธ์ระหว่างตารางได้ถูกต้องตามสไลด์ | ก | BE4 - Database.pdf.txt | 151, 153, 155 |
| 59 | Hard | MongoDB & Security | ทำไม Basic Authentication ที่ส่ง Username/Password แบบเข้ารหัส Base64 … | ง | BE7 - MongoDB.pdf | 43–46 |
| 60 | Hard | MongoDB & Security | ผู้ใช้ 2 คนตั้งรหัสผ่านเหมือนกันคือ password123 วิธีใดทำให้ค่าที่เก็บใ… | ข | BE7 - MongoDB.pdf | 47, 49, 50, 52, 53 |
