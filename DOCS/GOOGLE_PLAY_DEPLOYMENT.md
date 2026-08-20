# RRPS Student App - Google Play Store Deployment Guide

**App:** RR Public School Student App  
**Package:** `com.doonportal.rrps`  
**Version:** 1.0.5 (versionCode: 7)  
**Firebase Project:** dp-rrps  
**Last Updated:** August 2026

---

## Prerequisites

- Android Studio installed
- Node.js and npm installed
- Ionic CLI: `npm install -g @ionic/cli`
- Java 11+ (JDK)
- Google Play Console access
- A **release signing keystore** (see Step 2)

---

## Project Configuration Summary

| Item | Value |
|------|-------|
| App ID | `com.doonportal.rrps` |
| App Name | RRPS |
| Min SDK | 22 (Android 5.1) |
| Target SDK | 32 (Android 12L) |
| Compile SDK | 32 |
| Firebase Project | dp-rrps |
| google-services.json | `android/app/google-services.json` (already configured) |
| Signing Key | `android/debug.keystore` (currently using debug key) |

---

## Step 1: Update Version Numbers

Before each release, update the version in **two places**:

### 1a. `package.json`
```json
"version": "1.0.6"
```

### 1b. `src/environments/environment.prod.ts`
```typescript
appVersion: '1.0.6'
```

### 1c. `android/app/build.gradle`
```groovy
versionCode 8        // Increment by 1 for each upload
versionName "1.0.6"  // Human-readable version
```

> Google Play requires a unique `versionCode` for every upload. Always increment it.

---

## Step 2: Create a Release Signing Keystore

The project currently uses `debug.keystore` for signing. **For Play Store, you need a proper release keystore.**

### Generate a new release keystore (one-time):

```bash
keytool -genkey -v \
  -keystore android/rrps-release.keystore \
  -alias rrps-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You'll be prompted for:
- Keystore password (remember this!)
- Your name, org, city, state, country
- Key password

### Update `android/app/build.gradle` signing config:

```groovy
signingConfigs {
    release {
        storeFile file("${rootProject.projectDir}/rrps-release.keystore")
        storePassword "YOUR_KEYSTORE_PASSWORD"
        keyAlias "rrps-release"
        keyPassword "YOUR_KEY_PASSWORD"
    }
}
```

> **IMPORTANT:** Keep the keystore file and passwords safe. If you lose them, you cannot update the app on Play Store. Consider using environment variables or `keystore.properties` for passwords.

### Alternative: Use `keystore.properties` (recommended)

Create `android/keystore.properties` (add to .gitignore):
```properties
storeFile=../rrps-release.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=rrps-release
keyPassword=YOUR_KEY_PASSWORD
```

Update `build.gradle`:
```groovy
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

signingConfigs {
    release {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}
```

---

## Step 3: Update Target SDK (Play Store Requirement)

Google Play requires `targetSdkVersion 34` (Android 14) for new apps as of August 2024. Update `android/variables.gradle`:

```groovy
ext {
    minSdkVersion = 22
    compileSdkVersion = 34
    targetSdkVersion = 34
    // ... rest stays the same
}
```

---

## Step 4: Build the Web App

```bash
# From project root
NODE_OPTIONS=--openssl-legacy-provider npx ng build --configuration=production
```

This outputs the built web app to `www/`.

---

## Step 5: Sync to Android

```bash
npx cap sync android
```

This copies the `www/` build into `android/app/src/main/assets/public/` and syncs native plugins.

---

## Step 6: Build the Release APK / AAB

### Option A: Build AAB (Required for Play Store)

Google Play requires Android App Bundle (AAB) format:

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Option B: Build APK (for testing / direct distribution)

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## Step 7: Test the Release Build

Before uploading, install the APK on a device to verify:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

Test these critical flows:
- [ ] Login works
- [ ] Push notifications are received
- [ ] All pages load without errors
- [ ] Back button navigates correctly
- [ ] Side menu opens and navigates
- [ ] Notification badge updates
- [ ] App update check works

---

## Step 8: Google Play Console Setup

### 8a. Create App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in:
   - App name: **RR Public School**
   - Default language: English (India)
   - App type: App
   - Free/Paid: Free
4. Accept declarations

### 8b. Store Listing

- **Short description:** Official student app for RR Public School - homework, exams, fees, attendance & more.
- **Full description:** Stay connected with RR Public School through the official student app. Check homework, view exam results, track attendance, pay fees, see transport details, and receive school notifications - all in one place.
- **Screenshots:** Take at least 2 phone screenshots (required)
- **App icon:** 512x512 PNG
- **Feature graphic:** 1024x500 PNG
- **Category:** Education
- **Contact email:** (your school email)

### 8c. Content Rating

Complete the content rating questionnaire. For a school app:
- No violence, sexual content, or controlled substances
- Likely rated: **Everyone**

### 8d. Target Audience & Content

- Target age: 13+ (if students are above 13) or set appropriate age group
- **If targeting children under 13:** You must comply with COPPA/family policies

### 8e. Data Safety

Fill in the data safety form:
- **Data collected:** Name, email/phone (from login), device ID (for notifications)
- **Data shared:** None shared with third parties
- **Encryption:** Yes (HTTPS)
- **Deletion:** Users can request data deletion via school

---

## Step 9: Upload to Play Store

1. Go to **Release** > **Production** (or Testing track first)
2. Click **Create new release**
3. Upload the `.aab` file from Step 6
4. Add release notes:
   ```
   What's new in v1.0.5:
   - Improved notification system with read/unread tracking
   - Enhanced attendance and syllabus views
   - Better navigation and loading experience
   - Push notification improvements
   - Bug fixes and performance improvements
   ```
5. Click **Review release** > **Start rollout**

---

## Step 10: Play Store Review

Google typically reviews apps within 1-7 days for first submission. Common rejection reasons:

- **Permissions not justified:** Ensure notification permission is used and declared
- **Login required:** Provide test credentials in the review notes
- **Crash on launch:** Test thoroughly on multiple devices
- **Missing privacy policy:** Add a privacy policy URL in Store listing

---

## Quick Deploy Commands (after initial setup)

```bash
# Full deploy pipeline from project root:

# 1. Build web
NODE_OPTIONS=--openssl-legacy-provider npx ng build --configuration=production

# 2. Sync to Android
npx cap sync android

# 3. Build AAB
cd android && ./gradlew bundleRelease && cd ..

# 4. Output location
echo "AAB ready at: android/app/build/outputs/bundle/release/app-release.aab"
```

---

## Firebase & Push Notifications

Already configured:
- `google-services.json` is in `android/app/` with package `com.doonportal.rrps`
- Firebase project: `dp-rrps` (project number: 1000405212335)
- Google Services Gradle plugin applied in `build.gradle`
- FCM registration handled in `PushNotificationService`

No additional Firebase setup needed for Play Store deployment.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with SDK error | Run `sdkmanager "platforms;android-34"` |
| Keystore not found | Check `storeFile` path is relative to `android/app/` |
| Push notifications not working | Verify `google-services.json` matches package name |
| AAB too large | Enable ProGuard: `minifyEnabled true` in build.gradle |
| Version code conflict | Always increment `versionCode` before uploading |
| Gradle permission denied | Run `chmod +x android/gradlew` |

---

## Important Files Reference

```
android/
├── app/
│   ├── build.gradle          ← App version, signing config
│   ├── google-services.json  ← Firebase config (already set up)
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── assets/public/    ← Built web app (auto-synced)
├── build.gradle              ← Root gradle (plugins, repos)
├── variables.gradle          ← SDK versions
├── debug.keystore            ← Current signing key (replace for production)
└── gradle.properties
```

---

## Notes

- The current signing uses `debug.keystore` with default Android debug credentials. This is fine for testing but **must be replaced with a proper release keystore** before the first Play Store upload.
- Once you upload with a specific keystore, that same keystore must be used for all future updates. Back it up securely.
- Consider enrolling in **Google Play App Signing** which lets Google manage your upload key — you can recover if you lose it.
