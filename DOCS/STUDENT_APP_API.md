# RRPS Student App - API Documentation

**App:** Student App (IONIC)  
**Features:** Student Activities, Homework, Fees, Exams, Attendance, Transport, Notifications, Houses  
**Base URL:** `https://rrpublicschool.com/api/`  
**Method:** All endpoints use `POST`  
**Response Format:** JSON  
**Last Updated:** April 2026

---

## Table of Contents
1. [Authentication](#1-student-login)
2. [Dashboard](#2-student-dashboard)
3. [Houses](#houses)
4. [Homework](#homework)
5. [Fees](#fees)
6. [Exams](#exams)
7. [Attendance](#14-student-attendance)
8. [Meetings](#15-meetings)
9. [Transport](#16-transport)
10. [Syllabus / Notes](#syllabus--notes)
11. [Feedback](#19-feedback)
12. [Calendar](#20-calendar)
13. [Account](#account)
14. [Notifications](#notifications)
15. [App Version & Update](#24-app-version-check)
16. [Response Format & Status Codes](#response-format)
17. [Ionic Integration Examples](#ionic-integration-examples)

---

## 1. Student Login

**Endpoint:** `POST /api/studentlogin`

Authenticates a student to access the Student App.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| regid | string | Yes | Student registration ID |
| password | string | Yes | Student password |

**Success:**
```json
{
  "status": 1,
  "msg": "Student information fetched successfully",
  "data": {
    "id": 1,
    "reg_id": "RRPS2025001",
    "sname": "Student Name",
    "father_name": "Father Name",
    "mobile": "9876543210",
    "class_category_id": 2,
    "class_section_id": 3,
    "academic_session_id": 1,
    "house_id": 1,
    "class_category": { "id": 2, "class": "Class 5" },
    "class_section": { "id": 3, "section_type": "A" },
    "academic_session": { "id": 1, "session_name": "2025-2026" },
    "house": { "id": 1, "name": "Kalam", "color": "Green", "color_code": "#28a745" },
    "defaulter": true,
    "house_color": "Green",
    "house_color_code": "#28a745"
  }
}
```

> **Theme Support:** The `house_color` and `house_color_code` fields are provided at the top level of the student data for easy access. Use `house_color_code` (hex) to set the app's primary theme color based on the student's house. If the student has no house assigned, both fields will be `null`.
```

**Error:**
```json
{ "status": -1, "msg": "Username or password incorrect. Please try again", "data": null }
```

---

## 2. Student Dashboard

**Endpoint:** `POST /api/studentdashboard`

Fetches dashboard data including exam counts, consents, and upcoming syllabus.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Student information fetched successfully",
  "data": {
    "consents": { "id": 1, "main_consent": { "consent_name": "..." } },
    "todayExam": 0,
    "upcomingExam": 2,
    "paperHistory": 5,
    "examAttend": 3,
    "syllabus": [ ... ]
  }
}
```

**Error:**
```json
{ "status": -1, "msg": "No such student exists in this database.Please try again", "data": null }
```

---

## Houses

The `houses` table stores school house information (name, color, color code). Students are assigned to a house via `house_id` foreign key instead of a plain text field.

### Houses Table Structure

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR(100) | House name (e.g. Kalam, Nanak, Tagore, Teresa) |
| color | VARCHAR(50) | Color name (e.g. Green, Red, Yellow, Blue) |
| color_code | VARCHAR(10) | Hex color code (e.g. #28a745) |
| status | TINYINT | 1=Active, 0=Inactive |

### 3. Get Houses List

**Endpoint:** `POST /api/houses`

Returns list of all active houses. Used in student profile and house-wise reports.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| — | — | — | No parameters required |

**Success:**
```json
{
  "status": 1,
  "msg": "Houses fetched successfully",
  "data": [
    { "id": 1, "name": "Kalam", "color": "Green", "color_code": "#28a745" },
    { "id": 2, "name": "Nanak", "color": "Red", "color_code": "#dc3545" },
    { "id": 3, "name": "Tagore", "color": "Yellow", "color_code": "#ffc107" },
    { "id": 4, "name": "Teresa", "color": "Blue", "color_code": "#007bff" }
  ]
}
```

**No Houses:**
```json
{ "status": -1, "msg": "No houses found", "data": null }
```

> **Note:** The student login response now includes a `house` object with `id`, `name`, `color`, and `color_code` fields fetched from this table. The old plain-text `house` field in the students table is replaced by `house_id` referencing this table.

---

## Homework

### 4. Daily Homework (Today)

**Endpoint:** `POST /api/dailyhwtoday`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Daily Homework Today fetched successfully",
  "data": [
    {
      "subject": { "subject_name": "Mathematics" },
      "staff": { "name": "Teacher Name" },
      "start_date": "2026-03-30",
      "end_date": "2026-03-31",
      "homework": "Complete exercise 5.2",
      "status": 1,
      "subject_chapter": { "chapter_no": "5" },
      "subject_topic": { "topic_name": "Algebra" }
    }
  ]
}
```

**No Homework:**
```json
{ "status": -1, "msg": "No Daily homework found today", "data": null }
```

---

### 5. Daily Homework (Yesterday)

**Endpoint:** `POST /api/dailyhwyesterday`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Same response format as Homework Today.

---

### 6. Homework History

**Endpoint:** `POST /api/dailyhwhistory`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Same response format as Homework Today (returns array of past homework).

---

## Fees

### 7. Fee History

**Endpoint:** `POST /api/feehistory`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Fee History fetched successfully",
  "data": {
    "fee": [
      {
        "id": 1,
        "student_id": 1,
        "month": 4,
        "year": 2025,
        "fees_deposited": 5000,
        "academic_session": { "session_name": "2025-2026" }
      }
    ],
    "months": { "1": "January", "2": "February", ... }
  }
}
```

**Error:**
```json
{ "status": -1, "msg": "No records were found.Please try again later", "data": null }
```

---

### 8. Fee Detail

**Endpoint:** `POST /api/feedetail`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns detailed fee breakdown for the student.

---

### 9. Fee Receipt

**Endpoint:** `POST /api/feereceipt`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns fee receipt details.

---

## Exams

### 10. Student Exam

**Endpoint:** `POST /api/studentexam`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns list of exams for the student's class.

---

### 11. Upcoming Exam

**Endpoint:** `POST /api/upcomingexam`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns upcoming exams scheduled after today.

---

### 12. Exam History

**Endpoint:** `POST /api/examhistory`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns past exam papers and results.

---

### 13. Exam Detail

**Endpoint:** `POST /api/examdetail`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns detailed exam information.

---

## 14. Student Attendance

**Endpoint:** `POST /api/studentattendance`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns month-wise attendance summary for the current academic session.

**Success:**
```json
{
  "status": 1,
  "msg": "Calendar fetched successfully",
  "data": [
    {
      "month_name": "Apr",
      "year": "2025",
      "total": 30,
      "present": 25,
      "holidays": 5
    },
    {
      "month_name": "May",
      "year": "2025",
      "total": 31,
      "present": 27,
      "holidays": 4
    }
  ]
}
```

---

## 15. Meetings

**Endpoint:** `POST /api/meetings`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| class_section_id | integer | Yes | Class section ID (from student login data) |

**Success:**
```json
{
  "status": 1,
  "msg": "Meetings were fetched successfully",
  "data": {
    "upcomingmeeting": [
      {
        "meeting_date": "2026-04-05",
        "class_teacher": { "staff": { "name": "Teacher Name" } }
      }
    ],
    "meetinghistory": [ ... ]
  }
}
```

---

## 16. Transport

**Endpoint:** `POST /api/transport`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Student transport were fetched successfully",
  "data": {
    "road_route": { "route_name": "Route A" },
    "vehicle": {
      "driver_name": "Driver Name",
      "vehicle_type": "Bus",
      "vehicle_regt_no": "UK07AB1234"
    },
    "road_route_detail": {
      "stop_point": "Main Market",
      "monthly_charge": 1500
    }
  }
}
```

**Error:**
```json
{ "status": -1, "msg": "No student transport detail were found", "data": null }
```

---

## Syllabus / Notes

### 17. Syllabus (Subject List)

**Endpoint:** `POST /api/syllabus`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Notes were fetched successfully",
  "data": [
    {
      "subject": { "subject_name": "Mathematics" },
      "subject_id": 1,
      "units": 5,
      "chapters": 12
    }
  ]
}
```

---

### 18. Syllabus Detail (Subject Notes)

**Endpoint:** `POST /api/syllabusdetail`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |
| subject_id | integer | Yes | Subject ID (from syllabus list) |

**Success:**
```json
{
  "status": 1,
  "msg": "Subject Note were fetched successfully",
  "data": [
    {
      "subject": { "subject_name": "Mathematics" },
      "subject_unit": { "unit_no": "1", "unit_name": "Number System" },
      "noteURL": "https://rrpublicschool.com/uploads/notes/",
      "chapter_notes": [
        {
          "subject_chapter": { "chapter_no": "1", "chapter_name": "Real Numbers" },
          "notes": "filename.pdf"
        }
      ]
    }
  ]
}
```

---

## 19. Feedback

**Endpoint:** `POST /api/feedback`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns student report cards / feedback from teachers.

**Success:**
```json
{
  "status": 1,
  "msg": "Feedbacks were fetched successfully",
  "data": [
    {
      "id": 1,
      "discipline": 4,
      "responsibility": 5,
      "att_studies": 4,
      "att_teachers": 5,
      "att_peers": 4,
      "teacher_remarks": "Good performance",
      "principal_remarks": "Keep it up",
      "created": "2026-03-15"
    }
  ]
}
```

---

## 20. Calendar

**Endpoint:** `POST /api/calendar`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns school events and holidays for the calendar view.

**Success:**
```json
{
  "status": 1,
  "msg": "Events for calendar fetched successfully",
  "data": [
    {
      "id": 1,
      "event_name": "Annual Day",
      "event_date": "2026-04-15",
      "event_category": 1,
      "event_color": "bg-cal-green"
    }
  ]
}
```

---

## Account

### 21. Change Password

**Endpoint:** `POST /api/changepassword`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |
| oldPassword | string | Yes | Current password |
| newPassword | string | Yes | New password |
| confirmPassword | string | Yes | Confirm new password |

**Success:**
```json
{ "status": 1, "msg": "Your password has been successfully updated.", "data": { ... } }
```

**Errors:**
```json
{ "status": -1, "msg": "Please enter correct old password", "data": null }
{ "status": -1, "msg": "Entered new password and confirmation is not same", "data": null }
```

---

## Notifications

### 22. Get Notifications

**Endpoint:** `POST /api/notification`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Notifications were fetched successfully",
  "data": [
    {
      "title": "Fee Reminder",
      "description": "Please deposit pending fees",
      "image": "notification_image.jpg",
      "status": 1
    }
  ]
}
```

---

### 23. Update FCM Details

**Endpoint:** `POST /api/updateFCMDetails`

Registers or updates the device FCM token for push notifications. Requires a logged-in student.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |
| fcm_token | string | Yes | Firebase Cloud Messaging token |
| uid | string | Yes | Device unique ID (UUID) |
| app_version | string | Yes | Current app version |
| os | string | Yes | Device OS (android/ios) |
| model | string | Yes | Device model name |

**Success:**
```json
{ "status": 1, "msg": "FCM Token Updated Successfully." }
```

**Error:**
```json
{ "status": -1, "msg": "Unable To Update FCM Token. Please Try Again Later." }
```

> **Note:** This API upserts based on `student_id`. If a record exists for the student, it updates; otherwise creates a new one. Use this after login to link the device to the student.

---

### 23b. Register Device (Pre-Login)

**Endpoint:** `POST /api/registerDevice`

Registers a device for push notifications. Can be called **before or after login**. If `student_id` is not provided, the device is registered without linking to a student (useful for sending broadcast notifications to all installed apps). Once the student logs in, call this again with `student_id` to link the device.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| uid | string | Yes | Device unique ID (UUID) |
| fcm_token | string | Yes | Firebase Cloud Messaging token |
| student_id | integer | No | Student ID (pass after login to link device to student) |
| app_version | string | No | Current app version |
| os | string | No | Device OS (android/ios) |
| model | string | No | Device model name |

**Success:**
```json
{ "status": 1, "msg": "Device registered successfully.", "data": { "id": 5, "uid": "device-uuid-here" } }
```

**Error (missing required fields):**
```json
{ "status": -1, "msg": "uid and fcm_token are required." }
```

**Error (save failed):**
```json
{ "status": -1, "msg": "Unable to register device. Please try again." }
```

> **Flow:**  
> 1. On app install/open → call `registerDevice` with `uid` + `fcm_token` (no student_id)  
> 2. After student login → call `registerDevice` again with `uid` + `fcm_token` + `student_id` to link device  
> 3. On FCM token refresh → call `registerDevice` with updated `fcm_token`

---

### 24. App Version Check

**Endpoint:** `POST /api/appversioncheck`

Checks if the Student App needs an update. When an APK is uploaded to the server, the `download_url` will point to the server-hosted APK file for direct download (no Play Store needed).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| current_version | string | Yes | Current app version (e.g. "1.0.0") |
| app_type | string | No | `student` |
| platform | string | No | `android` (default) or `ios` |

**Update Available (Server-hosted APK):**
```json
{
  "status": 1,
  "msg": "Update available",
  "data": {
    "current_version": "1.0.0",
    "latest_version": "1.2.0",
    "needs_update": true,
    "force_update": false,
    "download_url": "https://rrpublicschool.com/uploads/apk/student_v1_2_0_1711900000.apk",
    "changelog": "Bug fixes and new features"
  }
}
```

**Up to Date:**
```json
{
  "status": 1,
  "msg": "App is up to date",
  "data": {
    "current_version": "1.2.0",
    "latest_version": "1.2.0",
    "needs_update": false,
    "force_update": false
  }
}
```

> **Note:** The `download_url` is automatically set to the server-hosted APK URL when an APK is uploaded via the admin panel. If no APK is uploaded, it falls back to the manually configured URL.

---

### 25. Download APK

**Endpoint:** `GET /api/downloadapk`

Downloads the latest APK file directly from the server. This endpoint serves the APK as a file download.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| app_type | query string | No | `visitor` (default) or `student` |

**Example URL:** `https://rrpublicschool.com/api/downloadapk?app_type=student`

**Success:** Returns the APK file as a binary download with appropriate headers.

**Error (no APK uploaded):**
```json
{ "status": -1, "msg": "No APK file available for student" }
```

**Error (file missing on server):**
```json
{ "status": -1, "msg": "APK file not found on server" }
```

> **Note:** This is the only API endpoint that uses `GET` method and returns a file instead of JSON on success.

---

## Response Format

All APIs return JSON:

```json
{ "status": 1, "msg": "Success message", "data": {} }
```

| Status | Meaning | Description |
|--------|---------|-------------|
| 1 | Success | Operation completed |
| 0 | No Data | Success but no records found |
| -1 | Error | Validation or system error |

---

## Ionic Integration Examples

### Service: Student API Service
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StudentApiService {
  private baseUrl = 'https://rrpublicschool.com/api';

  constructor(private http: HttpClient) {}

  private postForm(endpoint: string, params: any) {
    const body = new FormData();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        body.append(key, params[key].toString());
      }
    });
    return this.http.post(`${this.baseUrl}/${endpoint}`, body);
  }

  // Auth
  login(regid: string, password: string) {
    return this.postForm('studentlogin', { regid, password });
  }

  // Dashboard
  getDashboard(studentId: number) {
    return this.postForm('studentdashboard', { student_id: studentId });
  }

  // Houses
  getHouses() {
    return this.postForm('houses', {});
  }

  // Homework
  getHomeworkToday(studentId: number) {
    return this.postForm('dailyhwtoday', { student_id: studentId });
  }
  getHomeworkYesterday(studentId: number) {
    return this.postForm('dailyhwyesterday', { student_id: studentId });
  }
  getHomeworkHistory(studentId: number) {
    return this.postForm('dailyhwhistory', { student_id: studentId });
  }

  // Fees
  getFeeHistory(studentId: number) {
    return this.postForm('feehistory', { student_id: studentId });
  }
  getFeeDetail(studentId: number) {
    return this.postForm('feedetail', { student_id: studentId });
  }
  getFeeReceipt(studentId: number) {
    return this.postForm('feereceipt', { student_id: studentId });
  }

  // Exams
  getExams(studentId: number) {
    return this.postForm('studentexam', { student_id: studentId });
  }
  getUpcomingExams(studentId: number) {
    return this.postForm('upcomingexam', { student_id: studentId });
  }
  getExamHistory(studentId: number) {
    return this.postForm('examhistory', { student_id: studentId });
  }
  getExamDetail(studentId: number) {
    return this.postForm('examdetail', { student_id: studentId });
  }

  // Attendance & Meetings
  getAttendance(studentId: number) {
    return this.postForm('studentattendance', { student_id: studentId });
  }
  getMeetings(classSectionId: number) {
    return this.postForm('meetings', { class_section_id: classSectionId });
  }

  // Transport
  getTransport(studentId: number) {
    return this.postForm('transport', { student_id: studentId });
  }

  // Syllabus
  getSyllabus(studentId: number) {
    return this.postForm('syllabus', { student_id: studentId });
  }
  getSyllabusDetail(studentId: number, subjectId: number) {
    return this.postForm('syllabusdetail', { student_id: studentId, subject_id: subjectId });
  }

  // Feedback & Calendar
  getFeedback(studentId: number) {
    return this.postForm('feedback', { student_id: studentId });
  }
  getCalendar(studentId: number) {
    return this.postForm('calendar', { student_id: studentId });
  }

  // Account
  changePassword(studentId: number, oldPwd: string, newPwd: string, confirmPwd: string) {
    return this.postForm('changepassword', {
      student_id: studentId,
      oldPassword: oldPwd,
      newPassword: newPwd,
      confirmPassword: confirmPwd
    });
  }

  // Notifications
  getNotifications(studentId: number) {
    return this.postForm('notification', { student_id: studentId });
  }
  updateFCM(studentId: number, fcmToken: string, uid?: string, appVersion?: string, os?: string, model?: string) {
    return this.postForm('updateFCMDetails', {
      student_id: studentId, fcm_token: fcmToken,
      uid, app_version: appVersion, os, model
    });
  }
  registerDevice(uid: string, fcmToken: string, studentId?: number, appVersion?: string, os?: string, model?: string) {
    const params: any = { uid, fcm_token: fcmToken, app_version: appVersion, os, model };
    if (studentId) params.student_id = studentId;
    return this.postForm('registerDevice', params);
  }

  // Version Check
  checkAppVersion(currentVersion: string, platform: string = 'android') {
    return this.postForm('appversioncheck', {
      current_version: currentVersion, app_type: 'student', platform
    });
  }

  getApkDownloadUrl(appType: string = 'student') {
    return `${this.baseUrl}/downloadapk?app_type=${appType}`;
  }
}
```

### Usage: Login Flow
```typescript
// On app init (before login) — register device for broadcast notifications
this.api.registerDevice(this.deviceUuid, this.fcmToken, undefined, '1.0.0', 'android', 'Samsung')
  .subscribe();

// On login
this.api.login('RRPS2025001', 'password123').subscribe((res: any) => {
  if (res.status === 1) {
    this.student = res.data;
    localStorage.setItem('student', JSON.stringify(res.data));
    // Link device to student after login
    this.api.registerDevice(this.deviceUuid, this.fcmToken, res.data.id, '1.0.0', 'android', 'Samsung')
      .subscribe();
    // Check app version
    this.api.checkAppVersion('1.0.0').subscribe((v: any) => {
      if (v.status === 1 && v.data.needs_update && v.data.force_update) {
        // Force update dialog — download APK from server
        this.showForceUpdateDialog(v.data.download_url, v.data.changelog);
      } else if (v.status === 1 && v.data.needs_update) {
        // Optional update — user can skip
        this.showOptionalUpdateDialog(v.data.download_url, v.data.changelog);
      }
    });
    this.router.navigate(['/dashboard']);
  } else {
    this.showError(res.msg);
  }
});
```

### Usage: Dashboard
```typescript
this.api.getDashboard(this.student.id).subscribe((res: any) => {
  if (res.status === 1) {
    this.todayExams = res.data.todayExam;
    this.upcomingExams = res.data.upcomingExam;
    this.consent = res.data.consents;
  }
});
```

---

## API Endpoint Summary

| # | API | Endpoint | Key Params |
|---|-----|----------|------------|
| 1 | Student Login | `/api/studentlogin` | regid, password |
| 2 | Dashboard | `/api/studentdashboard` | student_id |
| 3 | Houses List | `/api/houses` | — |
| 4 | Homework Today | `/api/dailyhwtoday` | student_id |
| 5 | Homework Yesterday | `/api/dailyhwyesterday` | student_id |
| 6 | Homework History | `/api/dailyhwhistory` | student_id |
| 7 | Fee History | `/api/feehistory` | student_id |
| 8 | Fee Detail | `/api/feedetail` | student_id |
| 9 | Fee Receipt | `/api/feereceipt` | student_id |
| 10 | Student Exam | `/api/studentexam` | student_id |
| 11 | Upcoming Exam | `/api/upcomingexam` | student_id |
| 12 | Exam History | `/api/examhistory` | student_id |
| 13 | Exam Detail | `/api/examdetail` | student_id |
| 14 | Attendance | `/api/studentattendance` | student_id |
| 15 | Meetings | `/api/meetings` | class_section_id |
| 16 | Transport | `/api/transport` | student_id |
| 17 | Syllabus | `/api/syllabus` | student_id |
| 18 | Syllabus Detail | `/api/syllabusdetail` | student_id, subject_id |
| 19 | Feedback | `/api/feedback` | student_id |
| 20 | Calendar | `/api/calendar` | student_id |
| 21 | Change Password | `/api/changepassword` | student_id, oldPassword, newPassword, confirmPassword |
| 22 | Notifications | `/api/notification` | student_id |
| 23 | Update FCM | `/api/updateFCMDetails` | student_id, fcm_token, uid, app_version, os, model |
| 23b | Register Device | `/api/registerDevice` | uid, fcm_token, student_id (optional) |
| 24 | App Version | `/api/appversioncheck` | current_version, app_type=student, platform |
| 25 | Download APK | `/api/downloadapk` | app_type (query param, GET) |

---

## Testing Checklist

**Test URL:** `https://rrpublicschool.com/api/`

### 1. Student Login (`/api/studentlogin`)
- [ ] Valid regid + valid password → status 1, returns student data with class/section/session
- [ ] Valid regid + wrong password → status -1, "Username or password incorrect"
- [ ] Non-existent regid → status -1, "Username or password incorrect"
- [ ] Inactive student (status=0 or publish=0) → should not login
- [ ] Verify response contains class_category, class_section, academic_session objects
- [ ] Verify response contains house object with id, name, color, color_code
- [ ] Verify defaulter field is returned

### 2. Student Dashboard (`/api/studentdashboard`)
- [ ] Valid student_id → status 1, returns consents, todayExam, upcomingExam, paperHistory, examAttend, syllabus
- [ ] Non-existent student_id → status -1, "No such student exists"
- [ ] Verify todayExam count matches exams scheduled for today
- [ ] Verify upcomingExam count matches future exams
- [ ] Verify paperHistory count matches past exams in current session
- [ ] Verify syllabus array contains exam details with curriculum

### 3. Houses (`/api/houses`)
- [ ] Returns status 1 with array of active houses
- [ ] Each house has id, name, color, color_code fields
- [ ] Only active houses (status=1) are returned
- [ ] No houses in DB → status -1, "No houses found"
- [ ] Verify color_code is valid hex format

### 4. Homework Today (`/api/dailyhwtoday`)
- [ ] Valid student_id with homework today → status 1, returns homework array
- [ ] Valid student_id with no homework today → status -1, "No Daily homework found today"
- [ ] Verify each record has subject_name, staff name, homework text, chapter, topic
- [ ] Verify homework is filtered by student's class_category_id and class_section_id

### 5. Homework Yesterday (`/api/dailyhwyesterday`)
- [ ] Valid student_id with homework yesterday → status 1, returns homework array
- [ ] No homework yesterday → status -1

### 6. Homework History (`/api/dailyhwhistory`)
- [ ] Valid student_id → status 1, returns past homework
- [ ] No history → status -1

### 7. Fee History (`/api/feehistory`)
- [ ] Valid student_id with fee records → status 1, returns fee array + months list
- [ ] Valid student_id with no fee records → status -1, "No records were found"
- [ ] Verify fee records are for current academic session
- [ ] Verify months map is returned (1=January, 2=February, etc.)

### 8. Fee Detail (`/api/feedetail`)
- [ ] Valid student_id → status 1, returns detailed fee breakdown
- [ ] No fee data → verify error response

### 9. Fee Receipt (`/api/feereceipt`)
- [ ] Valid student_id → status 1, returns receipt data
- [ ] No receipts → verify error response

### 10. Student Exam (`/api/studentexam`)
- [ ] Valid student_id → status 1, returns exam list for student's class
- [ ] No exams → verify error response

### 11. Upcoming Exam (`/api/upcomingexam`)
- [ ] Valid student_id → status 1, returns future exams
- [ ] No upcoming exams → verify response

### 12. Exam History (`/api/examhistory`)
- [ ] Valid student_id → status 1, returns past exam papers
- [ ] No exam history → verify response

### 13. Exam Detail (`/api/examdetail`)
- [ ] Valid student_id → status 1, returns exam details
- [ ] No exam data → verify response

### 14. Student Attendance (`/api/studentattendance`)
- [ ] Valid student_id → status 1, returns month-wise attendance array
- [ ] Verify each month has month_name, year, total, present, holidays
- [ ] Verify holidays include Sundays + school holidays (event_color=bg-cal-red)
- [ ] Verify months span from session start to current month
- [ ] Current month total = today's date (not full month days)

### 15. Meetings (`/api/meetings`)
- [ ] Valid class_section_id → status 1, returns upcomingmeeting + meetinghistory
- [ ] Verify upcoming meetings have meeting_date >= today
- [ ] Verify meeting history has meeting_date <= today
- [ ] Verify class_teacher and staff name in response
- [ ] Invalid class_section_id → verify response (empty arrays)

### 16. Transport (`/api/transport`)
- [ ] Student with transport assigned → status 1, returns route, vehicle, stop details
- [ ] Verify route_name, driver_name, vehicle_type, vehicle_regt_no, stop_point, monthly_charge
- [ ] Student without transport → status -1, "No student transport detail were found"

### 17. Syllabus (`/api/syllabus`)
- [ ] Valid student_id with notes → status 1, returns subject list with units/chapters count
- [ ] Verify each subject has subject_name, subject_id, units count, chapters count
- [ ] No notes for class → status -1, "No Notes added for this class"

### 18. Syllabus Detail (`/api/syllabusdetail`)
- [ ] Valid student_id + subject_id → status 1, returns unit-wise chapter notes
- [ ] Verify noteURL path is correct (uploads/notes/)
- [ ] Verify chapter_notes array has chapter_no, chapter_name, notes filename
- [ ] Invalid subject_id → status -1, "No Notes added for this subject"

### 19. Feedback (`/api/feedback`)
- [ ] Valid student_id with reports → status 1, returns feedback array + assessment list
- [ ] Verify discipline, responsibility, att_studies, att_teachers, att_peers fields
- [ ] Verify teacher_remarks and principal_remarks
- [ ] No feedback → status -1, "No feedbacks were found"

### 20. Calendar (`/api/calendar`)
- [ ] Valid student_id → status 1, returns events array
- [ ] Verify events have event_name, event_date, event_category, event_color
- [ ] Verify class-specific events (category=2) filtered by student's class
- [ ] Verify general events (category 1,3,4) included for all students
- [ ] No events → status -1, "No Events found"

### 21. Change Password (`/api/changepassword`)
- [ ] Correct oldPassword + matching newPassword/confirmPassword → status 1, password updated
- [ ] Wrong oldPassword → status -1, "Please enter correct old password"
- [ ] newPassword != confirmPassword → status -1, "Entered new password and confirmation is not same"
- [ ] Verify can login with new password after change
- [ ] Verify cannot login with old password after change

### 22. Notifications (`/api/notification`)
- [ ] Valid student_id with notifications → status 1, returns notification array
- [ ] Verify each notification has title, description, image, status
- [ ] No notifications → status -1, "No notifications were found"

### 23. Update FCM Details (`/api/updateFCMDetails`)
- [ ] New student (no existing token) → status 1, "FCM Token Updated Successfully", creates new record
- [ ] Existing student (token exists) → status 1, updates existing record
- [ ] Verify fcm_token, uid, app_version, os, model saved correctly
- [ ] Missing student_id → verify error handling
- [ ] Missing fcm_token → verify error handling

### 23b. Register Device (`/api/registerDevice`)
- [ ] uid + fcm_token only (no student_id) → status 1, "Device registered successfully", student_id=0 in DB
- [ ] uid + fcm_token + student_id → status 1, device linked to student
- [ ] Same uid called again → updates existing record (upsert)
- [ ] Same uid + different student_id → updates student_id linkage
- [ ] Missing uid → status -1, "uid and fcm_token are required."
- [ ] Missing fcm_token → status -1, "uid and fcm_token are required."
- [ ] Verify app_version, os, model saved correctly
- [ ] Verify response contains `data.id` and `data.uid`
- [ ] FCM token refresh scenario: same uid, new fcm_token → updates token

### 24. App Version Check (`/api/appversioncheck`)
- [ ] current_version older than latest → status 1, needs_update = true
- [ ] current_version equal to latest → status 1, needs_update = false
- [ ] current_version newer than latest → status 1, needs_update = false
- [ ] Missing current_version → status -1, "Current version is required"
- [ ] app_type = student → checks student version config
- [ ] platform = android → checks android-specific version
- [ ] platform = ios → checks ios-specific version
- [ ] force_update = true in config → force_update = true in response
- [ ] Verify download_url and changelog returned
- [ ] No version config in DB → status 0, "Version configuration not found"
- [ ] Upload APK via admin panel → download_url points to server-hosted APK
- [ ] Verify download_url is accessible and downloads the APK file

### 25. Download APK (`/api/downloadapk?app_type=student`)
- [ ] APK uploaded for student → returns APK file download
- [ ] No APK uploaded → status -1, "No APK file available for student"
- [ ] APK config exists but file deleted from server → status -1, "APK file not found on server"
- [ ] Verify downloaded file is a valid APK
- [ ] Verify file can be installed on Android device

### General
- [ ] All endpoints return JSON with status, msg, data fields
- [ ] All endpoints only accept POST method
- [ ] GET request to any endpoint → no data / method error
- [ ] CORS headers present (Access-Control-Allow-Origin: *)
- [ ] Test from Ionic app on Android device
- [ ] Test from Ionic app on iOS device
- [ ] Test with slow network / timeout handling
- [ ] Verify no sensitive data (passwords) leaked in responses
- [ ] Verify student password is never returned in plain text

---

**Version:** 2.1 | **Last Updated:** April 2026
