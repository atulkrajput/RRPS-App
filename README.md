# RRPS Student App

Mobile application for **RR Public School** students built with Ionic 5 and Angular 12, packaged for Android using Capacitor.

## Features

- **Dashboard** — Student profile with house-themed UI, exam stats, quick navigation
- **Homework** — Today's, yesterday's, and full homework history
- **Exams** — Upcoming exams, exam history with title filters, and Report Card (Half-Yearly / Yearly)
- **Fees** — Pending fee breakdown (tuition, transport, old balance), payment history
- **Attendance** — Month-wise attendance summary
- **Transport** — Route, vehicle, driver, and stop details with monthly charges
- **Syllabus** — Subject-wise notes and chapter downloads
- **Calendar** — School events and holidays
- **Meetings** — Upcoming and past PTM schedules
- **Feedback** — Teacher and principal remarks
- **Notifications** — Push notifications via Firebase Cloud Messaging
- **Settings** — Change password, check for updates, social media links, app rating

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Ionic 5 + Angular 12 |
| Native Runtime | Capacitor 3 |
| Push Notifications | Firebase Cloud Messaging |
| Platform | Android (primary) |
| API | REST (POST), Base URL: `https://rrpublicschool.com/api/` |

## Prerequisites

- Node.js 14+
- npm or yarn
- Android Studio (for APK builds)
- Java JDK (bundled with Android Studio)

## Setup

```bash
# Install dependencies
npm install

# Serve locally
npm start

# Build for production
npx cross-env NODE_OPTIONS=--openssl-legacy-provider ng build --configuration production

# Sync to Android
npx cap sync android

# Build APK (from project root)
cd android
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
.\gradlew.bat assembleRelease
```

The release APK is generated at `android/app/build/outputs/apk/release/app-release.apk`.

## Project Structure

```
src/
├── app/
│   ├── components/        # Shared components (sidemenu)
│   ├── guards/            # Auth guard
│   ├── interfaces/        # TypeScript interfaces
│   ├── login/             # Login page
│   ├── services/          # API service, constants, push notifications
│   └── student/           # Feature pages
│       ├── attendances/
│       ├── calendar/
│       ├── complaints/
│       ├── dashboard/
│       ├── exams/         # Exams + Report Card
│       ├── feedbacks/
│       ├── fees/          # Fees + Transport fee breakdown
│       ├── homeworks/
│       ├── meetings/
│       ├── notifications/
│       ├── profile/
│       ├── settings/
│       ├── syllabus/
│       └── transports/
├── environments/          # Dev and prod config (includes appVersion)
└── assets/
```

## Version Management

App version is defined in `src/environments/environment.ts` (`appVersion` field) and used across the app for update checks and display. Keep these in sync when releasing:

- `src/environments/environment.ts` / `environment.prod.ts` — `appVersion`
- `package.json` — `version`
- `android/app/build.gradle` — `versionName` and `versionCode`

## API Documentation

Full API docs with endpoints, parameters, response formats, and testing checklist are in [`DOCS/STUDENT_APP_API.md`](DOCS/STUDENT_APP_API.md).

## Current Version

**1.0.4** (versionCode 6)
