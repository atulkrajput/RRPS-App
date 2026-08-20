# RRPS Student App - API Documentation

**App:** Student App (IONIC)  
**Features:** Student Activities, Homework, Fees, Exams, Report Card, Attendance, Transport, Notifications, Houses, Complaints  
**Base URL:** `https://rrpublicschool.com/api/`  
**Method:** All endpoints use `POST`  
**Response Format:** JSON  
**Last Updated:** August 2026

---

## Table of Contents
1. [Authentication](#1-student-login)
2. [Dashboard](#2-student-dashboard)
3. [Houses](#houses)
4. [Homework](#homework)
5. [Fees](#fees)
6. [Exams](#exams)
7. [Report Card](#13b-report-card-half-yearly--yearly)
8. [Attendance](#14-student-attendance)
8b. [Attendance Detail (Enhanced)](#14b-student-attendance-detail-enhanced)
8c. [Student Leaves](#14c-student-leaves)
9. [Meetings](#15-meetings)
10. [Transport](#16-transport)
11. [Syllabus / Notes](#syllabus--notes)
12. [Feedback](#19-feedback)
13. [Calendar](#20-calendar)
14. [Account](#account)
15. [Notifications](#notifications)
16. [App Version & Update](#24-app-version-check)
17. [Messages (Broadcast)](#messages-broadcast)
18. [Attendance Alert Messages](#attendance-alert-messages)
19. [Complaints](#complaints)
20. [Response Format & Status Codes](#response-format)
21. [Ionic Integration Examples](#ionic-integration-examples)

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
    "house_color_code": "#28a745",
    "session_token": "abc123xyz..."
  }
}
```

> **Theme Support:** The `house_color` and `house_color_code` fields are provided at the top level of the student data for easy access. Use `house_color_code` (hex) to set the app's primary theme color based on the student's house. If the student has no house assigned, both fields will be `null`.

> **Parent & Guardian Photos:** The login response includes `father_photo`, `mother_photo`, and `guardian_photo` URLs. Guardian photo is only available when a guardian has been explicitly added via the "Add Guardian" section (with name, relation, and photo). Parent photos (father/mother) are uploaded separately. If a photo is not available, the field returns `null`.

> **Session Token:** The `session_token` field is returned on successful login. This token is used for single-device enforcement — logging in from a new device invalidates any existing web session for the same student. Store this token locally and include it in subsequent requests if session validation is required.
```

**Error:**
```json
{ "status": -1, "msg": "Username or password incorrect. Please try again", "data": null }
```

---

## 2. Student Dashboard

**Endpoint:** `POST /api/studentdashboard`

Fetches dashboard data including exam counts, attendance summary, unread messages, and upcoming syllabus.

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
    "attendance": {
      "total_present": 165,
      "total_absent": 15,
      "total_late": 8,
      "total_leaves": 5,
      "total_working_days": 180,
      "percentage": 91.7
    },
    "unread_messages": 3,
    "syllabus": [ ... ]
  }
}
```

> **Attendance Summary (Updated July 2026):**
> - `attendance` object provides session-to-date attendance stats
> - `total_present` includes students marked late (late is still present)
> - `total_late` is a subset of present — gate-app recorded late arrivals
> - `total_leaves` from `student_leaves` table — counted separately from absent
> - `percentage` = (total_present / total_working_days) × 100
> - Use this data to show an attendance ring/progress indicator on the dashboard

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

> **Session Filtering (Updated August 2026):** All homework APIs now filter results to the **current academic session only**. Homework from previous sessions is no longer returned. The session date range (`from_date` to `end_date`) is used as bounds for date queries.

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

**No Homework:**
```json
{ "status": -1, "msg": "No Daily homework found yesterday", "data": null }
```

---

### 6. Homework History

**Endpoint:** `POST /api/dailyhwhistory`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns all past homework for the current academic session, ordered by most recent first.

**Success:** Same response format as Homework Today (returns array of past homework).

**No Homework:**
```json
{ "status": -1, "msg": "No homework history found", "data": null }
```

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

Returns detailed fee breakdown for the student including tuition, admission, registration, old balance, and transport fees (if opted).

**Success:**
```json
{
  "status": 1,
  "msg": "Fee Detail fetched successfully",
  "data": {
    "old_balance": 2000,
    "reg_fee": 500,
    "admission_fee": 1000,
    "tuition_fee": 15000,
    "tuition_fee_till": "May 2026",
    "previous_payment": [
      {
        "id": 1,
        "student_id": 101,
        "amount": 5000,
        "payment_date": "2025-06-15",
        "receipt_no": "REC001"
      }
    ],
    "payment_mode": { "1": "Cash", "2": "Online", "3": "Cheque" },
    "payment_type": { "1": "Tuition", "2": "Transport", "3": "Admission" },
    "has_transport": true,
    "transport_fee_monthly": 1500,
    "transport_route": "Route A",
    "transport_stop": "Main Market",
    "transport_fee_total": 18000,
    "transport_fee_paid": 6000,
    "transport_fee_pending": 12000
  }
}
```

> **Fee Calculation Notes (Updated May 2026):**
> - `tuition_fee` is now calculated **till the current month only** (not the full session end date). For example, in May 2026, it calculates April 2025 to May 2026 = 14 months.
> - `tuition_fee_till` indicates the month up to which the fee has been calculated (e.g., "May 2026").
> - If the student has a custom `tuition_fee_monthly` in `student_fee_balances`, that is used instead of the class-level `tuition_fee`.
> - `has_transport` indicates whether the student has an active transport subscription. If `true`, transport fee fields are populated. If `false`, `transport_fee_monthly` and `transport_fee_pending` are `0`.
> - `transport_fee_monthly` is determined using the same priority as admin panel: `route_locations.route_charges` → `road_route_details.monthly_charge` → overridden by `student_fee_balances.transport_fee_monthly` if set for current session.
> - `transport_fee_total` = months from April to current month × monthly transport charge (also till current month only).
> - `transport_fee_pending` = `transport_fee_total` − `transport_fee_paid`.
> - Fee exemptions and deposits are deducted from the total.

**No Transport (student did not opt for transport):**
```json
{
  "status": 1,
  "msg": "Fee Detail fetched successfully",
  "data": {
    "old_balance": 2000,
    "reg_fee": 500,
    "admission_fee": 1000,
    "tuition_fee": 15000,
    "tuition_fee_till": "May 2026",
    "previous_payment": [],
    "payment_mode": { ... },
    "payment_type": { ... },
    "has_transport": false,
    "transport_fee_monthly": 0,
    "transport_fee_pending": 0
  }
}
```

**Error:**
```json
{ "status": -1, "msg": "No records were found.Please try again later", "data": null }
```

---

### 9. Fee Receipt

**Endpoint:** `POST /api/feereceipt`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns fee receipt details.
## Exams

> **Attempt Questions Feature (Updated April 2026)**
>
> Exam APIs now return `total_questions`, `attempt_questions`, and `question_object` to support the *Attempt Limit* feature. A student may see 10 MCQs but only need to answer 8. Use these fields to:
> - Show **"Attempt any X of Y"** section instructions in the UI
> - Track per-type attempt progress to enable/disable the Submit button
> - Verify marks correctly (server scores the best N answers per type)

---

### 10. Student Exam (Today)

**Endpoint:** `POST /api/studentexam`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns exams scheduled today including full attempt configuration.

**Success:**
```json
{
  "status": 1,
  "msg": "Exams fetched successfully",
  "data": {
    "exam": [
      {
        "id": 101,
        "exam_date": "2026-04-30",
        "exam_duration": 60,
        "max_marks": 50,
        "total_questions": 20,
        "attempt_questions": 16,
        "question_object": {
          "1": { "questions": 5, "marks": 1, "attempt_questions": 4 },
          "4": { "questions": 10, "marks": 2, "attempt_questions": 8 },
          "5": { "questions": 5, "marks": 4, "attempt_questions": 4 }
        },
        "subject": { "subject_name": "Mathematics" },
        "exam_title": { "title": "Unit Test 1" },
        "exam_students": [],
        "exam_student_questions": []
      }
    ],
    "qType": { "1": "Fill In The Blanks", "4": "Objective", "5": "VSA" }
  }
}
```

**No exam today:**
```json
{ "status": -1, "msg": "No exam found today", "data": null }
```

> **Mobile Integration:** Parse `question_object` to display per-section attempt instructions (e.g., *"Section A — Attempt any 4 of 5"*). Track attempted count per type vs `attempt_questions` to control the Submit button state.

---

### 11. Upcoming Exam

**Endpoint:** `POST /api/upcomingexam`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns exams scheduled after today for the **current academic session** with full attempt configuration.

> **Bug Fix (August 2026):** Previously, this endpoint was missing the `academic_session_id` filter, causing it to return exams from all sessions. Also, only exams with `status=3` (published) were shown, which excluded scheduled exams (`status=2`) that had questions set but weren't yet marked as published. Now includes both scheduled (status=2) and published (status=3) exams for the current session only.

**Success:**
```json
{
  "status": 1,
  "msg": "Upcoming exams were fetched successfully",
  "data": {
    "exam": [
      {
        "id": 102,
        "exam_date": "2026-05-05",
        "max_marks": 100,
        "total_questions": 30,
        "attempt_questions": 25,
        "question_object": {
          "1": { "questions": 10, "marks": 1, "attempt_questions": 8 },
          "4": { "questions": 10, "marks": 2, "attempt_questions": 10 },
          "6": { "questions": 5, "marks": 4, "attempt_questions": 4 },
          "7": { "questions": 5, "marks": 6, "attempt_questions": 3 }
        },
        "subject": { "subject_name": "Science" },
        "exam_title": { "title": "Half-Yearly" },
        "exam_students": [],
        "exam_student_questions": []
      }
    ],
    "qType": { "1": "Fill In The Blanks", "4": "Objective", "6": "Short Answer", "7": "Long Answer" }
  }
}
```

**No upcoming exams:**
```json
{ "status": -1, "msg": "No exams were found", "data": null }
```

---

### 12. Exam History

**Endpoint:** `POST /api/examhistory`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |
| exam_title_id | integer | No | Filter by exam title. If omitted, returns all past exams |

Returns past exam papers and results. Now includes `total_questions`, `attempt_questions`, and `max_marks` per exam for complete result context.

**Success:**
```json
{
  "status": 1,
  "msg": "Exam fetched successfully",
  "data": {
    "exam": [
      {
        "exam_date": "2025-09-15",
        "id": 42,
        "exam_held": 1,
        "total_questions": 20,
        "attempt_questions": 16,
        "max_marks": 50,
        "subject": { "subject_name": "Mathematics" },
        "exam_title_id": 2,
        "exam_title": { "title": "Half-Yearly" },
        "staff": { "name": "Teacher Name" },
        "exam_students": [
          {
            "obtained_marks": 38,
            "total_marks": 50,
            "marks_by_type": {
              "1": { "answered": 5, "counted": 4, "marks": 4 },
              "4": { "answered": 10, "counted": 8, "marks": 14 },
              "5": { "answered": 4, "counted": 4, "marks": 20 }
            },
            "percentage": 76.0,
            "status": 2
          }
        ]
      }
    ],
    "examTitles": [
      { "exam_title": { "title": "Half-Yearly" }, "exam_title_id": 2 },
      { "exam_title": { "title": "Yearly" }, "exam_title_id": 3 }
    ]
  }
}
```

**Error:**
```json
{ "status": -1, "msg": "No exams were found", "data": null }
```

> **Mobile Integration:**
> - Use `attempt_questions` / `total_questions` to render a badge like *"Attempted 16 of 20 questions"*
> - `exam_students[0].obtained_marks` is the final score (after top-N scoring). Use `marks_by_type` to show per-section breakdown
> - `marks_by_type` format: `{ "type": { "answered": N, "counted": N, "marks": N } }` where type key maps to question type (1=FIB, 4=MCQ, etc.)

---

### 13. Exam Detail

**Endpoint:** `POST /api/examdetail`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |
| exam_id | integer | Yes | Exam ID (from exam list) |

Returns full exam configuration, syllabus, and student marks.

**Success:**
```json
{
  "status": 1,
  "msg": "Exam Details were fetched successfully",
  "data": {
    "exam": {
      "id": 42,
      "exam_title": { "title": "Half-Yearly" },
      "class_category": { "class": "Class 5" },
      "exam_type": { "type_name": "Half-Yearly" },
      "subject": { "subject_name": "Mathematics" },
      "academic_session": { "session_name": "2025-2026" },
      "max_marks": 50,
      "total_questions": 20,
      "attempt_questions": 16,
      "question_object": {
        "1": { "questions": 5, "marks": 1, "attempt_questions": 4 },
        "4": { "questions": 10, "marks": 2, "attempt_questions": 8 },
        "5": { "questions": 5, "marks": 4, "attempt_questions": 4 }
      },
      "exam_date": "2025-09-15",
      "exam_duration": 60
    },
    "syllabus": {
      "curriculum_title": "Half-Yearly Syllabus",
      "curriculum_desc": "Chapters 1-6",
      "chapters": [
        { "chapter_no": "1", "chapter_name": "Real Numbers", "subject_unit": { "unit_name": "Number System" } }
      ]
    },
    "marks": { "marks_obtained": 38, "status": 1 }
  }
}
```

> **`question_object` key mapping:**
>
> | Key | Question Type |
> |-----|---------------|
> | 1   | Fill In The Blanks |
> | 2   | True or False |
> | 3   | Match the Following |
> | 4   | Objective (MCQ) |
> | 5   | Very Short Answer (VSA) |
> | 6   | Short Answer |
> | 7   | Long Answer |
>
> If `attempt_questions == questions` for a type, show *"Attempt all questions"*. Otherwise show *"Attempt any {attempt_questions} of {questions}"*.

---

### 13b. Report Card (Half-Yearly / Yearly)

**Endpoint:** `POST /api/reportcard`

Returns subject-wise marks for Half-Yearly and Yearly exams with totals, percentage, attempt info, and teacher feedback.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Report card fetched successfully",
  "data": {
    "student": {
      "id": 101,
      "reg_id": "RRPS2025001",
      "sname": "Student Name",
      "father_name": "Father Name",
      "class": "Class 5",
      "section": "A",
      "session": "2025-2026"
    },
    "report_card": [
      {
        "exam_title": "Half-Yearly",
        "exam_type": "Half-Yearly",
        "subjects": [
          {
            "subject_name": "English",
            "max_marks": 100,
            "total_questions": 25,
            "attempt_questions": 20,
            "marks_obtained": 82,
            "marks_by_type": {
              "1": { "answered": 5, "counted": 4, "marks": 4 },
              "4": { "answered": 10, "counted": 8, "marks": 16 },
              "6": { "answered": 5, "counted": 5, "marks": 30 },
              "7": { "answered": 3, "counted": 3, "marks": 32 }
            },
            "exam_date": "2025-09-15",
            "is_absent": false
          },
          {
            "subject_name": "Science",
            "max_marks": 100,
            "total_questions": 20,
            "attempt_questions": 20,
            "marks_obtained": "AB",
            "marks_by_type": null,
            "exam_date": "2025-09-18",
            "is_absent": true
          }
        ],
        "total_marks_obtained": 251,
        "total_max_marks": 400,
        "percentage": 62.75
      },
      {
        "exam_title": "Yearly",
        "exam_type": "Yearly",
        "subjects": [
          {
            "subject_name": "English",
            "max_marks": 100,
            "total_questions": 30,
            "attempt_questions": 25,
            "marks_obtained": 88,
            "marks_by_type": {
              "1": { "answered": 8, "counted": 8, "marks": 8 },
              "4": { "answered": 10, "counted": 10, "marks": 30 },
              "6": { "answered": 4, "counted": 4, "marks": 20 },
              "7": { "answered": 3, "counted": 3, "marks": 30 }
            },
            "exam_date": "2026-03-10",
            "is_absent": false
          }
        ],
        "total_marks_obtained": 88,
        "total_max_marks": 100,
        "percentage": 88.0
      }
    ],
    "feedback": {
      "discipline": 4,
      "responsibility": 5,
      "att_studies": 4,
      "att_teachers": 5,
      "att_peers": 4,
      "teacher_remarks": "Good performance",
      "principal_remarks": "Keep it up"
    }
  }
}
```

> **Notes:**
> - Only completed exams (status=3) for the current session are included.
> - Exam types filtered: Half-Yearly (exam_type_id=2) and Yearly (exam_type_id=3).
> - If absent, `marks_obtained` returns `"AB"` and `is_absent` is `true`. Absent marks excluded from totals.
> - `marks_by_type`: per-section score breakdown — `{ type_key: { answered, counted, marks } }`. Will be `null` if the student was absent or the exam predates the feature. Use this to show a section-wise marks table.
> - `total_questions` and `attempt_questions` are per-subject exam-level values. When `attempt_questions < total_questions`, marks are calculated from the **best N answers** (server-side top-N logic).
> - `feedback` is `null` if no teacher feedback exists for the session.

**Error:**
```json
{ "status": -1, "msg": "No report card data available for current session", "data": null }
```

---

## 14. Student Attendance

**Endpoint:** `POST /api/studentattendance`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

Returns month-wise attendance summary for the current academic session.

> **Note (Updated July 2026):** Holidays are class-aware — school-wide holidays (event_category 1,3,4) apply to all students, while class-specific holidays (event_category 2) only apply to students in that class. The attendance system now supports leaves (via `student_leaves` table), late arrivals (via gate app `late_arrival_passes` table), and holiday-aware calculations.

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

### 14b. Student Attendance Detail (Enhanced)

**Endpoint:** `POST /api/studentattendancedetail`

Returns detailed month-wise attendance with working days, leaves, late arrivals, absent count, and percentage. Also includes cumulative (session till-date) totals.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Attendance details fetched successfully",
  "data": {
    "monthly": [
      {
        "month_name": "Apr",
        "year": "2025",
        "total_days": 30,
        "working_days": 24,
        "holidays": 6,
        "present": 22,
        "late": 2,
        "leaves": 1,
        "absent": 2,
        "percentage": 91.7
      },
      {
        "month_name": "May",
        "year": "2025",
        "total_days": 31,
        "working_days": 25,
        "holidays": 6,
        "present": 23,
        "late": 1,
        "leaves": 0,
        "absent": 2,
        "percentage": 92.0
      }
    ],
    "cumulative": {
      "total_working_days": 180,
      "total_present": 165,
      "total_late": 8,
      "total_leaves": 5,
      "total_absent": 15,
      "percentage": 91.7
    },
    "session": "2025-2026"
  }
}
```

**Errors:**
```json
{ "status": -1, "msg": "Student ID is required", "data": null }
{ "status": -1, "msg": "Student not found", "data": null }
```

> **Notes:**
> - `working_days` = total days − Sundays − holidays (events with `bg-cal-red`)
> - **Holidays are class-aware**: School-wide holidays (event_category 1,3,4) apply to all classes. Class-specific holidays (event_category 2 with class_category_id) only apply to the student's class.
> - `present` includes students marked as Late (late arrivals are counted as present)
> - `late` is a subset of present — students who arrived late via gate app
> - `leaves` are stored separately but counted as absent in percentage calculation
> - `percentage` = (present / working_days) × 100
> - `cumulative` provides session-to-date totals across all months
> - The old `/api/studentattendance` endpoint continues to work for backward compatibility
> - Holiday calculation uses `GeneralComponent::getHolidayDates()` which caches results per request for performance

---

### 14c. Student Leaves

**Endpoint:** `POST /api/studentleaves`

Returns all leaves recorded for a student in the current academic session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Leaves fetched successfully",
  "count": 3,
  "data": [
    {
      "id": 1,
      "student_id": 101,
      "class_category_id": 5,
      "class_section_id": 12,
      "leave_date": "2025-06-15",
      "leave_type": "medical",
      "reason": "Fever",
      "applied_by": "teacher",
      "staff_id": 5,
      "status": 1,
      "created": "2025-06-15 08:30:00",
      "modified": "2025-06-15 08:30:00"
    },
    {
      "id": 2,
      "student_id": 101,
      "class_category_id": 5,
      "class_section_id": 12,
      "leave_date": "2025-07-20",
      "leave_type": "family",
      "reason": "Family function",
      "applied_by": "teacher",
      "staff_id": 5,
      "status": 1,
      "created": "2025-07-20 09:00:00",
      "modified": "2025-07-20 09:00:00"
    }
  ]
}
```

**Errors:**
```json
{ "status": -1, "msg": "Student ID is required", "data": null }
{ "status": -1, "msg": "Student not found", "data": null }
```

> **Notes:**
> - Returns leaves for the current academic session only
> - `leave_type`: general, medical, family, other
> - `applied_by`: teacher, parent, student
> - All leaves are counted as absent in attendance percentage
> - Sorted by leave_date descending (most recent first)

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

Returns school events and holidays for the calendar view. Only returns events relevant to the student's class (school-wide events + class-specific events for the student's class).

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
      "event_end_date": "2026-04-15",
      "event_category": 1,
      "event_color": "bg-cal-green",
      "description": "Annual Day celebration"
    },
    {
      "id": 5,
      "event_name": "Summer Vacation",
      "event_date": "2026-05-15",
      "event_end_date": "2026-06-30",
      "event_category": 1,
      "event_color": "bg-cal-red",
      "description": "Summer break"
    }
  ]
}
```

> **Notes (Updated July 2026):**
> - `event_date` and `event_end_date` are returned as clean `YYYY-MM-DD` strings (IST date)
> - For single-day events, `event_end_date` equals `event_date`
> - For multi-day events, both dates define the inclusive range
> - `event_category`: 1 = General/Holiday (all classes), 2 = Class-specific, 3 = School event (all), 4 = Special (all)
> - `event_color` values: `bg-cal-red` (Holiday), `bg-cal-purple` (Activity), `bg-cal-blue` (Event), `bg-cal-yellow` (Competition), `bg-cal-green` (Exams), `bg-cal-gray` (Special)
> - Class-specific events (category 2) are only returned for the student's class

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

> **Play Store Update (August 2026):** The notification API has been completely overhauled. It now supports pagination, read/unread tracking, mark-as-read, and badge count — all required for Google Play Store compliance and a proper notification center UX.

### 22. Get Notifications

**Endpoint:** `POST /api/notification`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |
| page | integer | No | Page number (default: 1) |
| per_page | integer | No | Items per page (default: 20, max: 50) |

**Success:**
```json
{
  "status": 1,
  "msg": "Notifications were fetched successfully",
  "data": [
    {
      "id": 15,
      "title": "Fee Reminder",
      "description": "Please deposit pending fees for April 2026",
      "image": "https://rrpublicschool.com/uploads/notification/fee_reminder.jpg",
      "status": 1,
      "is_read": 0,
      "created": "2026-04-20 09:30:00"
    },
    {
      "id": 12,
      "title": "Annual Day Invitation",
      "description": "You are invited to the Annual Day celebration",
      "image": null,
      "status": 2,
      "is_read": 1,
      "created": "2026-04-15 14:00:00"
    }
  ],
  "count": 25,
  "total_pages": 2,
  "current_page": 1,
  "per_page": 20
}
```

**No Notifications:**
```json
{
  "status": 1,
  "msg": "No notifications were found.",
  "data": [],
  "count": 0,
  "total_pages": 0,
  "current_page": 1,
  "per_page": 20
}
```

**Error:**
```json
{ "status": -1, "msg": "Student ID is required", "data": null }
```

> **Notes:**
> - Results ordered by `created` DESC (most recent first)
> - `is_read`: 0 = unread, 1 = read
> - `image` returns full URL when present, `null` when no image
> - `status` field: 1 = unread, 2 = read (internal status used for tracking)
> - Pagination metadata (`count`, `total_pages`, `current_page`, `per_page`) always returned
> - Returns empty array `[]` instead of `null` when no notifications (Play Store friendly)

---

### 22b. Mark Notification Read

**Endpoint:** `POST /api/marknotificationread`

Marks a single notification or all notifications as read for a student.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |
| notification_id | integer | No* | Notification ID (required if not marking all) |
| mark_all | integer | No* | Pass `1` to mark all notifications as read |

*Either `notification_id` or `mark_all=1` must be provided.

**Success (single):**
```json
{ "status": 1, "msg": "Notification marked as read" }
```

**Success (mark all):**
```json
{ "status": 1, "msg": "All notifications marked as read" }
```

**Error (missing ID):**
```json
{ "status": -1, "msg": "Notification ID is required" }
```

**Error (not found):**
```json
{ "status": -1, "msg": "Notification not found" }
```

> **Usage:**
> - Call with `notification_id` when user taps a notification to view it
> - Call with `mark_all=1` for "Mark all as read" button in notification center
> - After marking, refresh the notification list and badge count

---

### 22c. Notification Unread Count

**Endpoint:** `POST /api/notificationunreadcount`

Returns the count of unread notifications. Use for badge display on the Notifications tab/icon.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Unread count fetched successfully",
  "data": {
    "unread_count": 5
  }
}
```

**No Unread:**
```json
{
  "status": 1,
  "msg": "Unread count fetched successfully",
  "data": {
    "unread_count": 0
  }
}
```

**Error:**
```json
{ "status": -1, "msg": "Student ID is required", "data": null }
```

> **Usage:** Call on app launch, after returning from background, and after viewing/marking notifications to keep the badge count updated.

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

## Messages (Broadcast)

The Messages feature allows students to receive broadcast messages from teachers (class teacher, subject teacher), reception, and principal. Messages are delivered via push notification and stored for in-app viewing.

### 26. Messages List

**Endpoint:** `POST /api/broadcastmessages`

Returns all broadcast messages for a student, ordered by most recent first.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Broadcast messages fetched successfully",
  "data": [
    {
      "id": 5,
      "sender_type": "class_teacher",
      "sender_display_name": "GAURAV KUMAR (Class Teacher)",
      "title": "Parent Teacher Meeting",
      "message": "PTM scheduled for 25th April. Please attend.",
      "system_category": null,
      "is_read": 0,
      "created": "2026-04-20 10:30:00"
    },
    {
      "id": 3,
      "sender_type": "subject_teacher",
      "sender_display_name": "PRIYA SHARMA (Mathematics)",
      "title": "Homework Reminder",
      "message": "Complete exercise 5.3 by tomorrow.",
      "system_category": null,
      "is_read": 1,
      "created": "2026-04-18 14:15:00"
    },
    {
      "id": 1,
      "sender_type": "system",
      "sender_display_name": "School",
      "title": "Absent Notification",
      "message": "Dear Student, you have been marked absent on 17-Apr-2026.",
      "system_category": "absent_notification",
      "is_read": 1,
      "created": "2026-04-17 09:00:00"
    }
  ]
}
```

**No Messages:**
```json
{ "status": 1, "msg": "Broadcast messages fetched successfully", "data": [] }
```

**Error:**
```json
{ "status": -1, "msg": "Student not found", "data": null }
```

> **Sender Types:**
> - `class_teacher` — Sent by the class teacher for the student's section
> - `subject_teacher` — Sent by a subject teacher for a specific class/section
> - `reception` — Sent by school reception
> - `principal` — Sent by the principal (can target all classes)
> - `system` — Auto-generated (absent notifications, fee reminders, birthday wishes)
>
> **System Categories** (when `sender_type` = `system`):
> - `absent_notification` — Student marked absent
> - `fee_reminder` — Fee payment reminder
> - `fee_receipt` — Fee receipt confirmation
> - `birthday_wish` — Birthday greeting

---

### 27. Message Detail

**Endpoint:** `POST /api/broadcastmessagedetail`

Returns full message detail and **automatically marks it as read**.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |
| message_id | integer | Yes | Broadcast message ID (from messages list) |

**Success:**
```json
{
  "status": 1,
  "msg": "Broadcast message detail fetched successfully",
  "data": {
    "id": 5,
    "sender_type": "class_teacher",
    "sender_display_name": "GAURAV KUMAR (Class Teacher)",
    "title": "Parent Teacher Meeting",
    "message": "PTM scheduled for 25th April. Please attend with your ward's report card.",
    "system_category": null,
    "is_read": 1,
    "read_at": "2026-04-21 08:45:00",
    "created": "2026-04-20 10:30:00"
  }
}
```

**Error (message not found):**
```json
{ "status": -1, "msg": "Message not found", "data": null }
```

> **Note:** Calling this endpoint marks the message as read (`is_read = 1`) and records the `read_at` timestamp. Subsequent calls return the same data with the already-set `read_at`.

---

### 28. Unread Message Count

**Endpoint:** `POST /api/broadcastunreadcount`

Returns the count of unread messages. Use this to show a badge on the Messages tab/icon.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Unread count fetched successfully",
  "data": {
    "unread_count": 3
  }
}
```

**No Unread:**
```json
{
  "status": 1,
  "msg": "Unread count fetched successfully",
  "data": {
    "unread_count": 0
  }
}
```

**Error:**
```json
{ "status": -1, "msg": "Student not found", "data": null }
```

> **Usage:** Call this on app launch and after returning from background to update the badge count. Also call after viewing a message to refresh the count.

---

### Attendance Alert Messages

When a student has short attendance, the class teacher can send an attendance alert message from the Monthly Attendance Register. These messages appear in the broadcast messages list with:
- `sender_type`: `class_teacher`
- `title`: "Attendance Alert - Student Name"
- `message`: A predefined or custom message about the student's attendance status

Common message templates used by teachers:
1. Telephonic conversation held with father/mother/guardian regarding short attendance
2. Parents informed and requested to meet the Principal
3. Phone call not answered
4. Mobile number switched off/not reachable

These messages are delivered via push notification and appear in the Messages section of the app alongside other broadcast messages.

---

## Complaints

### 29. Student Complaints

**Endpoint:** `POST /api/complaint`

Returns active complaints and complaint history for a student. Active complaints are those with status 1 (New), 2 (In Progress), or 3 (Under Review). History includes resolved (4) and closed (5) complaints.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student ID |

**Success:**
```json
{
  "status": 1,
  "msg": "Complaints were fetched successfully",
  "data": {
    "activeComplaint": [
      {
        "complaint_title": "Bus Route Issue",
        "complaint_desc": "Bus is not arriving on time for route A",
        "complaint_reply": "We are looking into it",
        "closure_msg": null,
        "status": 2,
        "staff": { "name": "Admin Name" }
      }
    ],
    "complaintHistory": [
      {
        "complaint_title": "Fee Query",
        "complaint_desc": "Discrepancy in fee receipt",
        "complaint_reply": "Issue has been resolved",
        "closure_msg": "Verified and corrected",
        "status": 4,
        "staff": { "name": "Admin Name" }
      }
    ],
    "complaintType": { "1": "Academic", "2": "Transport", "3": "Fees", "4": "General" },
    "complaintFor": { "1": "Student", "2": "Teachers", "3": "Others" }
  }
}
```

> **Complaint Status Codes:**
> | Status | Meaning |
> |--------|---------|
> | 1 | New |
> | 2 | In Progress |
> | 3 | Under Review |
> | 4 | Resolved |
> | 5 | Closed |
>
> **Notes:**
> - `activeComplaint` contains complaints with status 1, 2, or 3
> - `complaintHistory` contains complaints with status 4 or 5
> - `complaintType` and `complaintFor` are lookup maps for rendering dropdowns
> - Staff name is the assigned handler for the complaint
> - This endpoint is accessible via CakePHP fallback routing (no explicit route definition)

---

## Feedback Detail

### 30. Feedback Detail

**Endpoint:** `POST /api/feedbackdetail`

> **⚠️ WARNING (August 2026):** This endpoint has a route defined in `config/routes.php` but the corresponding `feedbackDetail()` method is **NOT implemented** in `ApiController.php`. Calling this endpoint will result in a "Missing Method" error. This needs to be implemented or the route should be removed.

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
  getReportCard(studentId: number) {
    return this.postForm('reportcard', { student_id: studentId });
  }

  // Attendance & Meetings
  getAttendance(studentId: number) {
    return this.postForm('studentattendance', { student_id: studentId });
  }
  getAttendanceDetail(studentId: number) {
    return this.postForm('studentattendancedetail', { student_id: studentId });
  }
  getLeaves(studentId: number) {
    return this.postForm('studentleaves', { student_id: studentId });
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
  getNotifications(studentId: number, page: number = 1, perPage: number = 20) {
    return this.postForm('notification', { student_id: studentId, page, per_page: perPage });
  }
  markNotificationRead(studentId: number, notificationId: number) {
    return this.postForm('marknotificationread', { student_id: studentId, notification_id: notificationId });
  }
  markAllNotificationsRead(studentId: number) {
    return this.postForm('marknotificationread', { student_id: studentId, mark_all: 1 });
  }
  getNotificationUnreadCount(studentId: number) {
    return this.postForm('notificationunreadcount', { student_id: studentId });
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

  // Messages (Broadcast)
  getMessages(studentId: number) {
    return this.postForm('broadcastmessages', { student_id: studentId });
  }
  getMessageDetail(studentId: number, messageId: number) {
    return this.postForm('broadcastmessagedetail', { student_id: studentId, message_id: messageId });
  }
  getUnreadCount(studentId: number) {
    return this.postForm('broadcastunreadcount', { student_id: studentId });
  }

  // Complaints
  getComplaints(studentId: number) {
    return this.postForm('complaint', { student_id: studentId });
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
| 13 | Exam Detail | `/api/examdetail` | student_id, exam_id |
| 13b | Report Card | `/api/reportcard` | student_id |
| 14 | Attendance | `/api/studentattendance` | student_id |
| 14b | Attendance Detail | `/api/studentattendancedetail` | student_id |
| 14c | Student Leaves | `/api/studentleaves` | student_id |
| 15 | Meetings | `/api/meetings` | class_section_id |
| 16 | Transport | `/api/transport` | student_id |
| 17 | Syllabus | `/api/syllabus` | student_id |
| 18 | Syllabus Detail | `/api/syllabusdetail` | student_id, subject_id |
| 19 | Feedback | `/api/feedback` | student_id |
| 20 | Calendar | `/api/calendar` | student_id |
| 21 | Change Password | `/api/changepassword` | student_id, oldPassword, newPassword, confirmPassword |
| 22 | Notifications | `/api/notification` | student_id, page, per_page |
| 22b | Mark Notification Read | `/api/marknotificationread` | student_id, notification_id OR mark_all |
| 22c | Notification Unread Count | `/api/notificationunreadcount` | student_id |
| 23 | Update FCM | `/api/updateFCMDetails` | student_id, fcm_token, uid, app_version, os, model |
| 23b | Register Device | `/api/registerDevice` | uid, fcm_token, student_id (optional) |
| 24 | App Version | `/api/appversioncheck` | current_version, app_type=student, platform |
| 25 | Download APK | `/api/downloadapk` | app_type (query param, GET) |
| 26 | Messages List | `/api/broadcastmessages` | student_id |
| 27 | Message Detail | `/api/broadcastmessagedetail` | student_id, message_id |
| 28 | Unread Count | `/api/broadcastunreadcount` | student_id |
| 29 | Complaints | `/api/complaint` | student_id |
| 30 | Feedback Detail | `/api/feedbackdetail` | ⚠️ NOT IMPLEMENTED |

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
- [ ] Verify session_token is returned on successful login
- [ ] Verify father_photo, mother_photo, guardian_photo URLs are present (or null)

### 2. Student Dashboard (`/api/studentdashboard`)
- [ ] Valid student_id → status 1, returns consents, todayExam, upcomingExam, paperHistory, examAttend, attendance, unread_messages, syllabus
- [ ] Non-existent student_id → status -1, "No such student exists"
- [ ] Verify todayExam count matches exams scheduled for today
- [ ] Verify upcomingExam count matches future exams
- [ ] Verify paperHistory count matches past exams in current session
- [ ] Verify syllabus array contains exam details with curriculum
- [ ] Verify attendance object has total_present, total_absent, total_late, total_leaves, total_working_days, percentage
- [ ] Verify attendance.percentage = (total_present / total_working_days) × 100
- [ ] Verify unread_messages count matches unread broadcast messages

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
- [ ] Verify homework only returns records within current academic session date range

### 5. Homework Yesterday (`/api/dailyhwyesterday`)
- [ ] Valid student_id with homework yesterday → status 1, returns homework array
- [ ] No homework yesterday → status -1, "No Daily homework found yesterday"
- [ ] Verify homework only returns records within current academic session date range

### 6. Homework History (`/api/dailyhwhistory`)
- [ ] Valid student_id → status 1, returns past homework
- [ ] No history → status -1, "No homework history found"
- [ ] Verify results ordered by start_date DESC (most recent first)
- [ ] Verify homework only from current academic session (not previous sessions)
- [ ] Verify no future homework is included

### 7. Fee History (`/api/feehistory`)
- [ ] Valid student_id with fee records → status 1, returns fee array + months list
- [ ] Valid student_id with no fee records → status -1, "No records were found"
- [ ] Verify fee records are for current academic session
- [ ] Verify months map is returned (1=January, 2=February, etc.)

### 8. Fee Detail (`/api/feedetail`)
- [ ] Valid student_id → status 1, returns detailed fee breakdown
- [ ] Verify tuition_fee calculates from April to current month only (not session end)
- [ ] Verify tuition_fee_till field shows current month and year (e.g., "May 2026")
- [ ] Verify tuition_fee accounts for custom monthly fee from student_fee_balances
- [ ] Verify tuition_fee deducts fee exemptions (fee_type=1, fees_deposited=0)
- [ ] Verify tuition_fee deducts already deposited amounts
- [ ] Student with transport → has_transport=true, transport_fee_monthly > 0
- [ ] Verify transport_fee_total = months from April to current month × monthly_charge
- [ ] Verify transport_fee_pending = transport_fee_total − transport_fee_paid
- [ ] Verify transport_route and transport_stop are populated
- [ ] Student without transport → has_transport=false, transport_fee_monthly=0, transport_fee_pending=0
- [ ] No fee data → verify error response

### 9. Fee Receipt (`/api/feereceipt`)
- [ ] Valid student_id → status 1, returns receipt data
- [ ] No receipts → verify error response

### 10. Student Exam (`/api/studentexam`)
- [ ] Valid student_id → status 1, returns exam list for student's class
- [ ] No exams → verify error response

### 11. Upcoming Exam (`/api/upcomingexam`)
- [ ] Valid student_id → status 1, returns future exams for current session only
- [ ] Verify only exams with status 2 (scheduled) or 3 (published) are returned
- [ ] Verify exams are filtered by current academic_session_id
- [ ] Verify exams from previous sessions are NOT included
- [ ] Verify exams are ordered by exam_date ASC (nearest first)
- [ ] No upcoming exams → status -1, "No exams were found"

### 12. Exam History (`/api/examhistory`)
- [ ] Valid student_id → status 1, returns past exam papers
- [ ] No exam history → verify response

### 13. Exam Detail (`/api/examdetail`)
- [ ] Valid student_id + exam_id → status 1, returns exam details with syllabus and marks
- [ ] Verify syllabus chapters are returned when available
- [ ] Verify student marks (marks_obtained) are returned
- [ ] No exam data → verify response

### 13b. Report Card (`/api/reportcard`)
- [ ] Valid student_id with completed Half-Yearly exams → status 1, report_card contains Half-Yearly entry
- [ ] Valid student_id with completed Yearly exams → report_card contains Yearly entry
- [ ] Verify each exam entry has subjects array with subject_name, max_marks, marks_obtained, exam_date
- [ ] Verify absent student shows marks_obtained="AB" and is_absent=true
- [ ] Verify total_marks_obtained excludes absent subjects
- [ ] Verify percentage = (total_marks_obtained / total_max_marks) × 100
- [ ] Verify report_card is ordered: Half-Yearly first, then Yearly
- [ ] Verify student info (reg_id, sname, class, section, session) is returned
- [ ] Verify feedback/remarks are included when available
- [ ] No completed exams for current session → status -1, "No report card data available"
- [ ] Non-existent student_id → status -1, "No such student exists"

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
- [ ] Verify events have id, event_name, event_date, event_end_date, event_category, event_color, description
- [ ] Verify event_date and event_end_date are YYYY-MM-DD format strings (not objects)
- [ ] Verify single-day events have event_end_date == event_date
- [ ] Verify multi-day events have correct date range
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
- [ ] Valid student_id with notifications → status 1, returns paginated notification array
- [ ] Verify each notification has id, title, description, image, is_read, created, status
- [ ] No notifications → status 1, empty data array `[]` (NOT null or status -1)
- [ ] Verify notifications ordered by created DESC (newest first)
- [ ] Verify `is_read` = 0 for unread, 1 for read
- [ ] Verify `image` returns full URL (with domain prefix) or null
- [ ] Verify pagination: page=1, per_page=20 default
- [ ] Verify page=2 returns next set of notifications
- [ ] Verify per_page max cap at 50
- [ ] Verify count, total_pages, current_page, per_page in response
- [ ] Missing student_id → status -1, "Student ID is required"

### 22b. Mark Notification Read (`/api/marknotificationread`)
- [ ] Valid student_id + notification_id (unread) → status 1, "Notification marked as read"
- [ ] Verify notification status changes to 2 in DB after marking
- [ ] Valid student_id + mark_all=1 → status 1, "All notifications marked as read"
- [ ] Verify all notifications for student now have status=2
- [ ] Invalid notification_id → status -1, "Notification not found"
- [ ] Notification belongs to different student → status -1, "Notification not found"
- [ ] Missing student_id → status -1, "Student ID is required"
- [ ] Missing both notification_id and mark_all → status -1, "Notification ID is required"

### 22c. Notification Unread Count (`/api/notificationunreadcount`)
- [ ] Valid student_id with unread notifications → status 1, unread_count > 0
- [ ] Valid student_id with all read → status 1, unread_count = 0
- [ ] Missing student_id → status -1, "Student ID is required"
- [ ] Verify count decreases after marking a notification as read

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

### 26. Messages List (`/api/broadcastmessages`)
- [ ] Valid student_id with messages → status 1, returns array of messages
- [ ] Valid student_id with no messages → status 1, returns empty array
- [ ] Invalid student_id → status -1, "Student not found"
- [ ] Missing student_id → status -1, "Student ID is required"
- [ ] Verify messages ordered by created DESC (newest first)
- [ ] Verify each message has id, sender_type, sender_display_name, title, message, is_read, created
- [ ] Verify is_read = 0 for unread, 1 for read messages
- [ ] Verify system messages have system_category field populated

### 27. Message Detail (`/api/broadcastmessagedetail`)
- [ ] Valid student_id + message_id (unread) → status 1, marks as read, returns detail with read_at
- [ ] Valid student_id + message_id (already read) → status 1, returns detail with existing read_at
- [ ] Invalid message_id → status -1, "Message not found"
- [ ] Message belongs to different student → status -1, "Message not found"
- [ ] Missing student_id → status -1, "Student ID is required"
- [ ] Missing message_id → status -1, "Message ID is required"
- [ ] Verify read_at timestamp is set after first view

### 28. Unread Count (`/api/broadcastunreadcount`)
- [ ] Valid student_id with unread messages → status 1, unread_count > 0
- [ ] Valid student_id with all read → status 1, unread_count = 0
- [ ] Invalid student_id → status -1, "Student not found"
- [ ] Missing student_id → status -1, "Student ID is required"
- [ ] Verify count decreases after reading a message via detail API

### 29. Complaints (`/api/complaint`)
- [ ] Valid student_id with active complaints → status 1, activeComplaint array populated
- [ ] Valid student_id with resolved complaints → status 1, complaintHistory array populated
- [ ] Verify activeComplaint contains only status 1, 2, 3
- [ ] Verify complaintHistory contains only status 4, 5
- [ ] Verify complaintType and complaintFor lookup maps are returned
- [ ] Verify staff name is included for each complaint
- [ ] Verify complaint_reply and closure_msg fields present

### 30. Feedback Detail (`/api/feedbackdetail`)
- [ ] ⚠️ BLOCKED: Method not implemented — calling returns "Missing Method" error
- [ ] TODO: Implement method or remove route from config/routes.php

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

**Version:** 2.7 | **Last Updated:** August 2026