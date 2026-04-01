# 🚀 วิธีง่ายๆ ในการได้ APK

## วิธีที่ 1: ใช้ Expo Snack + Expo Go (แนะนำที่สุด)

### ขั้นตอน:
1. ไปที่: https://snack.expo.dev
2. Copy โค้ดจาก App.js ไปวาง
3. กด "Save" และสร้างบัญชี (ฟรี)
4. แชร์ลิงก์ให้คนอื่น
5. เปิดด้วยแอป Expo Go (ดาวน์โหลดจาก Play Store)

**ข้อดี:**
- ✅ ไม่ต้อง build
- ✅ ใช้งานได้ทันที
- ✅ แชร์ได้ง่าย
- ✅ อัปเดตโค้ดได้ทันที

---

## วิธีที่ 2: ใช้ AppGyver / Thunkable (No-Code Platform)

### ขั้นตอน:
1. ไปที่: https://www.appgyver.com หรือ https://thunkable.com
2. สร้างแอปใหม่
3. ออกแบบ UI ตามที่ต้องการ
4. Export เป็น APK

**ข้อดี:**
- ✅ ไม่ต้องเขียนโค้ด
- ✅ Build APK ได้ทันที
- ✅ มี Template สำเร็จรูป

---

## วิธีที่ 3: ใช้ Expo Application Services (EAS) - รอให้เสร็จ

### ขั้นตอน:
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

**รอ 15-20 นาที** (ครั้งแรกอาจนาน แต่ครั้งต่อไปจะเร็วขึ้น)

**ข้อดี:**
- ✅ ได้ APK จริง
- ✅ ติดตั้งถาวร
- ✅ ไม่ต้องใช้ Expo Go

---

## วิธีที่ 4: ใช้ Appetize.io (ทดสอบออนไลน์)

### ขั้นตอน:
1. ไปที่: https://appetize.io
2. อัปโหลดโปรเจ็กต์
3. ได้ลิงก์ทดสอบแอปบนเบราว์เซอร์

**ข้อดี:**
- ✅ ทดสอบได้ทันที
- ✅ ไม่ต้องติดตั้งอะไร
- ✅ แชร์ลิงก์ได้

---

## วิธีที่ 5: ใช้ GitHub + Expo EAS (Auto Build)

### ขั้นตอน:
1. Push โค้ดขึ้น GitHub
2. ตั้งค่า GitHub Actions
3. Auto build ทุกครั้งที่ push

**ข้อดี:**
- ✅ Auto build
- ✅ Version control
- ✅ CI/CD

---

## วิธีที่ 6: ใช้ Expo Go + QR Code (ใช้งานได้เลย)

### ขั้นตอน:
1. ดาวน์โหลด Expo Go จาก Play Store
2. รัน `npx expo start --tunnel`
3. สแกน QR code
4. ใช้งานได้ทันที!

**URL ของคุณ:**
```
exp://idbtlpg-oattao123-8081.exp.direct
```

**ข้อดี:**
- ✅ ใช้เวลาแค่ 2 นาที
- ✅ ไม่ต้องรอ build
- ✅ Hot reload (แก้โค้ดอัปเดตทันที)

---

## 🎯 แนะนำ: ใช้วิธีที่ 6 ก่อน

เพราะ:
- เร็วที่สุด (2 นาที)
- ใช้งานได้ทันที
- ไม่ต้องรอ build
- ทดสอบได้ง่าย

**ถ้าต้องการ APK จริงๆ:**
- ใช้วิธีที่ 3 (EAS Build) แล้วรอให้เสร็จ
- หรือใช้วิธีที่ 2 (No-Code Platform) ถ้าไม่อยากรอ
