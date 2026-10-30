# Broiler Farm Management System

ระบบจัดการฟาร์มไก่เนื้อแบบครบวงจรสำหรับ Contract Farming บนสถาปัตยกรรม React + Node.js + MySQL พร้อม Docker Compose สำหรับใช้งานทันทีบน Ubuntu

## ภาพรวม

- ระบบจัดการรอบการเลี้ยง (batches)
- บันทึกข้อมูลประจำวันจากหน้าโรงเรือน (daily logs)
- จัดการสต็อกอาหาร/ยา/วัคซีน (inventory)
- คำนวณ KPI เช่น FCR, ADG, Mortality Rate
- Dashboard สำหรับ Owner / Vet / Manager
- Worker mode สำหรับการกรอกข้อมูลแบบมือถือและปุ่มกดใหญ่
- รองรับภาษาไทย / พม่า / อังกฤษ

## โครงสร้างโปรเจกต์

- `database/` : MySQL schema และ seed data
- `server/` : Backend API Express + JWT + MySQL
- `client/` : Frontend React + Vite + Tailwind CSS
- `docker-compose.yml` : เริ่มระบบทั้ง 3 ส่วนด้วย Docker Compose

## ข้อกำหนดก่อนติดตั้ง

- Ubuntu 20.04+ หรือ 22.04+
- Docker Engine
- Docker Compose v2
- Git

ตรวจสอบว่า Docker พร้อมใช้งาน:

```bash
docker --version
docker compose version
```

## วิธีติดตั้งและใช้งานบน Ubuntu

### 1) Clone repo

```bash
git clone https://github.com/satiraphan/bsfarm.chicken.git
cd bsfarm.chicken
```

### 2) สร้างไฟล์ environment

สำหรับการใช้งานทันทีสามารถใช้ค่าตั้งต้นที่มีให้แล้วใน `docker-compose.yml` โดยไม่ต้องแก้ไขใด ๆ แต่ถ้าต้องการปรับค่า ให้ทำดังนี้:

```bash
cp server/.env.example server/.env
```

ไฟล์ `server/.env` จะมีค่าเริ่มต้น เช่น:

```env
PORT=3001
DB_HOST=db
DB_PORT=3306
DB_NAME=broiler_farm
DB_USER=broiler
DB_PASSWORD=broiler123
JWT_SECRET=change_this_secret_in_production
```

### 3) เริ่มระบบด้วย Docker Compose

```bash
docker compose up --build -d
```

รอจนทุก service เริ่มทำงานแล้วตรวจสอบสถานะ:

```bash
docker compose ps
```

### 4) เปิดเว็บไซต์

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/health

### 5) เข้าระบบด้วยบัญชีเริ่มต้น

ผู้ใช้งานเริ่มต้นที่ระบบจะสร้างอัตโนมัติ:

- Username: `owner`
- Password: `farm@123`

### 6) ทดสอบ API

```bash
curl http://localhost:3001/health
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"farm@123"}'
```

## โหมดผู้ใช้งาน

### Owner / Vet / Manager

- Dashboard KPI
- ตารางสรุปทุกโรงเรือน
- ดูแนวโน้ม FCR และอัตราการตาย
- ดูรายละเอียด batch และรายงานประจำวัน

### Worker

- ปุ่มกดใหญ่สำหรับการบันทึกตัวเลข
- การกรอกข้อมูลในรูปแบบมือถือ
- พิมพ์เลขแบบ Numpad เพื่อความรวดเร็ว
- สนับสนุนภาษาพม่า/ไทย/อังกฤษ

## MySQL schema

ไฟล์ schema อยู่ที่

- `database/schema.sql`

Schema มีตารางหลักดังนี้:

- `users`
- `houses`
- `batches`
- `daily_logs`
- `inventory`
- `harvesting_records`

มีการตั้งค่า `ENGINE=InnoDB`, `CHARSET=utf8mb4`, `FOREIGN KEY`, `INDEX` พร้อม `COMMENT` ชัดเจน

## Backend API

Endpoints หลัก:

- `POST /api/auth/login`
- `GET /api/batches`
- `POST /api/batches`
- `PUT /api/batches/:id`
- `DELETE /api/batches/:id`
- `GET /api/logs/batch/:batchId`
- `POST /api/logs`
- `GET /api/analytics/batch/:batchId`
- `GET /api/inventory`

## Frontend

Frontend ใช้:

- React + Vite
- Tailwind CSS
- Lucide Icons
- Recharts

## การหยุดระบบ

```bash
docker compose down
```

ถ้าต้องการลบข้อมูลฐานข้อมูลให้ลบ volume ด้วย:

```bash
docker compose down -v
```

## ปัญหาที่พบบ่อย: `sh: vite: Permission denied`

สาเหตุทั่วไปคือ `node_modules` จากเครื่อง host หรือ bind mount ถูกแชร์เข้ามาใน container แบบมี permission ที่ไม่ถูกต้อง เช่น เมื่อใช้ Windows / WSL และมี `node_modules` จาก host ติดมาใน folder ของ project

แก้ไขได้ด้วย:

```bash
cd bsfarm.chicken
rm -rf client/node_modules
rm -rf server/node_modules
docker compose down
docker compose up --build -d
```

หรือถ้าต้องการเริ่มจากศูนย์จริง:

```bash
find . -name node_modules -type d -prune -exec rm -rf {} +
docker compose up --build -d
```

## หมายเหตุสำหรับ production

- เปลี่ยน `JWT_SECRET`
- เปลี่ยนรหัสผ่าน MySQL ให้เป็นค่าที่ปลอดภัย
- ใช้ reverse proxy เช่น Nginx หรือ Traefik
- เปิด HTTPS และเก็บ secret ในระบบ secret manager

---

## สำหรับทีมพัฒนาระบบต่อยอด

- เพิ่มระบบรายงาน Excel/PDF
- เพิ่มการแจ้งเตือนเหตุการณ์ผิดปกติจาก farm
- เพิ่ม authentication กลุ่ม SSO
- เพิ่มข้อมูล sensor จาก IoT/temperature sensor
