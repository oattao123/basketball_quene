# 🚀 Build APK พร้อม Icon

## ✅ Icon ตั้งค่าเรียบร้อยแล้ว
- ไฟล์: `/Users/oattao/Desktop/ball/icon.png`
- ตั้งค่าใน `app.json` แล้ว

## 📦 Build APK ตอนนี้เลย:

### ขั้นตอนที่ 1: Build ด้วย EAS
```bash
eas build -p android --profile preview
```

### ขั้นตอนที่ 2: รอ Build เสร็จ (10-15 นาที)
- จะได้ลิงก์ดาวน์โหลด APK
- จะได้ QR code สำหรับดาวน์โหลด

### ขั้นตอนที่ 3: ดาวน์โหลด APK
- เปิดลิงก์บนมือถือ
- ดาวน์โหลด APK
- ติดตั้งได้เลย!

---

## 🎨 Icon ที่ตั้งค่าไว้:
- **App Icon**: icon.png (1024x1024)
- **Adaptive Icon**: icon.png (สำหรับ Android)
- **Splash Screen**: icon.png (พื้นหลังสีส้ม #FF6B35)

---

## ⚡ หรือใช้วิธีเร็ว: Expo Go
ถ้าต้องการทดสอบก่อน:
```bash
npx expo start
```
แล้วสแกน QR code ด้วย Expo Go

---

## 📱 APK จะมี:
- ✅ Icon จาก icon.png
- ✅ ชื่อแอป: Basketball Queue
- ✅ Package: com.basketballqueueapp
- ✅ Version: 1.0.0
