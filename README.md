# Daruma Catch Game — Deploy Guide (Render.com)

ทำเกม "ดารุด็อก-ดารุแคท งับขนม" ให้ลูกค้าเล่นได้จริงผ่านลิงก์ของร้านเอง (ไม่ต้องพึ่งปุ่ม Publish ของ Claude) ต้อง deploy 2 ส่วน:

1. **daruma-catch-game.html** — ตัวเกม (static site)
2. **leaderboard-server/** — backend เก็บคะแนน (Web service)

---

## ส่วนที่ 1: Deploy backend เก็บคะแนน (leaderboard-server)

1. อัปโหลดโฟลเดอร์ `leaderboard-server` ขึ้น GitHub repo (สร้างใหม่หรือรวมกับ repo บอท LINE เดิมก็ได้)
2. เข้า [Render.com](https://render.com) > **New** > **Web Service**
3. เชื่อม GitHub repo ที่อัปโหลดไว้
4. ตั้งค่า:
   - **Root Directory**: `leaderboard-server` (ถ้ารวมไว้ในโฟลเดอร์ย่อยของ repo อื่น)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. ไปที่ **Environment** > เพิ่มตัวแปร:
   - `ADMIN_KEY` = ตั้งรหัสลับของคุณเอง (ใช้ดูคะแนนทั้งหมด/รีเซ็ต) 123456
6. กด **Create Web Service** รอ deploy เสร็จ จะได้ URL ประมาณ:
   ```
   https://daruma-leaderboard.onrender.com
   ```
   **คัดลอก URL นี้ไว้** ใช้ในขั้นตอนถัดไป

---

## ส่วนที่ 2: ใส่ URL backend เข้าไปในไฟล์เกม

1. เปิดไฟล์ `daruma-catch-game.html` ด้วยโปรแกรมแก้ไขข้อความ (Notepad, VS Code ฯลฯ)
2. หาบรรทัดนี้ (อยู่ใกล้ต้นๆ ของ `<script>`):
   ```js
   const API_BASE = ""; // TODO: put your Render backend URL here after deploying it
   ```
3. ใส่ URL backend ที่ได้จากขั้นตอนที่แล้วแทน:
   ```js
   const API_BASE = "https://daruma-leaderboard.onrender.com";
   ```
4. บันทึกไฟล์

---

## ส่วนที่ 3: Deploy ตัวเกม (static site)

1. อัปโหลดไฟล์ `daruma-catch-game.html` ขึ้น GitHub repo เดียวกัน (คนละโฟลเดอร์กับ backend ก็ได้ เช่น โฟลเดอร์ `game/`)
2. เข้า Render.com > **New** > **Static Site**
3. เชื่อม repo เดิม เลือกโฟลเดอร์ที่มีไฟล์เกม
4. ตั้งค่า:
   - **Build Command**: เว้นว่างไว้ (ไม่ต้อง build)
   - **Publish Directory**: `.` (หรือโฟลเดอร์ที่ไฟล์ html อยู่)
5. กด **Create Static Site** รอ deploy เสร็จ จะได้ URL เช่น:
   ```
   https://daruma-catch-game.onrender.com
   ```

**ลิงก์นี้แหละที่เอาไปส่งให้ลูกค้าเล่นผ่าน LINE ได้เลย** ไม่ต้องพึ่ง Claude อีกต่อไป

---

## เอาลิงก์ไปกระจายให้ลูกค้า

- **Broadcast** — ส่งลิงก์เกมพร้อมข้อความชวนเล่นผ่าน Line OA broadcast
- **Rich Menu** — ใส่ปุ่ม "เล่นเกมลุ้นรางวัล 🎮" เปิดลิงก์เกมเมื่อกด
- แปะลิงก์ใน Facebook/IG story ก็ได้

## ดูคะแนนเพื่อคัดผู้ชนะ

เรียก `GET /api/admin/all-scores` พร้อม header `x-admin-key` (รหัสที่ตั้งไว้ในขั้นตอนที่ 1) จะได้ข้อมูลดิบทุกคนพร้อมเวลาเล่น

⚠️ **ข้อควรรู้:** Render free tier ไฟล์เก็บคะแนนจะหายเมื่อ redeploy backend ใหม่ (ephemeral disk) ถ้าจะรันแคมเปญจริงจังนานหลายสัปดาห์ บอกได้ ผมช่วยต่อกับ database ถาวรให้ได้

