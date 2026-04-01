# 🚀 วิธี Build APK แบบเร็ว (ไม่ใช้ EAS)

## วิธีที่ 1: ใช้ Appetize.io (ทดสอบออนไลน์)
1. ไปที่: https://appetize.io/demo
2. อัปโหลดโปรเจ็กต์
3. ทดสอบได้ทันที

## วิธีที่ 2: Export และ Build เอง

### ขั้นตอนที่ 1: Export โปรเจ็กต์
```bash
npx expo export
```

### ขั้นตอนที่ 2: Prebuild Android
```bash
npx expo prebuild --platform android
```

### ขั้นตอนที่ 3: Build APK
```bash
cd android
./gradlew assembleRelease
```

APK จะอยู่ที่:
```
android/app/build/outputs/apk/release/app-release.apk
```

## วิธีที่ 3: ใช้ Expo Snack (แชร์ลิงก์)
1. ไปที่: https://snack.expo.dev
2. Copy โค้ดไปวาง
3. กด "Save"
4. แชร์ลิงก์ให้คนอื่นเปิดด้วย Expo Go

## วิธีที่ 4: ใช้ GitHub Actions (Auto Build)
สร้างไฟล์ `.github/workflows/build.yml` แล้วรัน GitHub Actions

---

## ⚡ แนะนำ: ใช้ Expo Go ก่อน
- ดาวน์โหลด Expo Go จาก Play Store
- สแกน QR code
- ใช้งานได้ทันที!

ถ้าต้องการ APK จริงๆ ให้รอ EAS Build เสร็จ (ครั้งแรกอาจนาน 15-20 นาที)
