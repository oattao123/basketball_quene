# 📦 วิธี Build APK สำหรับ Android

## วิธีที่ 1: ใช้ EAS Build (แนะนำ - ฟรี)

### ขั้นตอนที่ 1: ติดตั้ง EAS CLI
```bash
npm install -g eas-cli
```

### ขั้นตอนที่ 2: สร้างบัญชี Expo (ถ้ายังไม่มี)
ไปที่: https://expo.dev/signup

### ขั้นตอนที่ 3: Login
```bash
eas login
```
ใส่ username และ password ที่สร้างไว้

### ขั้นตอนที่ 4: Build APK
```bash
eas build -p android --profile preview
```

**หมายเหตุ:**
- ครั้งแรกจะถามว่าต้องการสร้าง project ใหม่หรือไม่ → กด `Y`
- จะถามว่าต้องการ generate keystore หรือไม่ → กด `Y`
- รอประมาณ 10-15 นาที

### ขั้นตอนที่ 5: ดาวน์โหลด APK
เมื่อ build เสร็จ จะได้:
- ลิงก์ดาวน์โหลด APK
- QR code สำหรับดาวน์โหลดบนมือถือ

**ส่งลิงก์ไปมือถือ Android แล้วติดตั้งได้เลย!**

---

## วิธีที่ 2: Build แบบ Local (ไม่ต้องใช้ EAS)

### ขั้นตอนที่ 1: ติดตั้ง Android Studio
ดาวน์โหลดจาก: https://developer.android.com/studio

### ขั้นตอนที่ 2: ตั้งค่า Environment Variables
เพิ่มใน `~/.zshrc` หรือ `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### ขั้นตอนที่ 3: Build
```bash
npx expo run:android --variant release
```

### ขั้นตอนที่ 4: หา APK
APK จะอยู่ที่:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🎯 แนะนำให้ใช้วิธีที่ 1 (EAS Build)

**ข้อดี:**
- ✅ ไม่ต้องติดตั้ง Android Studio
- ✅ Build บน cloud (ไม่กินทรัพยากรเครื่อง)
- ✅ ได้ลิงก์ดาวน์โหลดทันที
- ✅ ฟรี (500 builds/เดือน)

**เริ่มเลย:**
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

---

## 📱 วิธีติดตั้ง APK บนมือถือ

1. ดาวน์โหลด APK จากลิงก์ที่ได้
2. เปิดไฟล์ APK
3. อนุญาต "ติดตั้งจากแหล่งที่ไม่รู้จัก" (ถ้าถาม)
4. กดติดตั้ง
5. เสร็จแล้ว! 🎉

---

## ⚠️ หมายเหตุสำคัญ

- APK ที่ build จะมีขนาดประมาณ 50-80 MB
- ครั้งแรกอาจใช้เวลานานหน่อย (10-15 นาที)
- ครั้งต่อไปจะเร็วขึ้น (5-10 นาที)
- ถ้า build ล้มเหลว ลองรันใหม่อีกครั้ง
