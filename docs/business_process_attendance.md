# School Attendance & Credit Score System — Business Process Instructions

> Purpose: This document defines the business logic and process flows for Claude Code to implement.
> Data schema is already created. This document does NOT redefine schema — it defines behavior, rules, sequencing, and edge cases that must be built on top of it.
> If the existing schema does not support a rule below (e.g. no polymorphic owner_type for CreditScore), flag it before implementing rather than guessing.

---

## 0. Actors / Roles

| Role                          | Access                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| Siswa (Student)               | Scan QR, view own attendance & credit score, submit izin/sakit                      |
| Orang Tua (Parent)            | View child's attendance & credit score, receive notifications                       |
| Guru Mapel (Subject Teacher)  | Open/close class session, view/confirm attendance, manual credit entry for students |
| Wali Kelas (Homeroom Teacher) | View class-wide recap, approve izin/sakit, reverse deductions, receive escalations  |
| BK (Counselor)                | Manage all students' credit scores, handle low-score case follow-up                 |
| Admin/TU                      | Manage schedule, input teacher absence, assign substitute teachers                  |
| Kepala Sekolah / Wakasek      | View teacher credit scores, receive teacher-related escalations                     |

---

## 1. Master Rules (must be configurable, not hardcoded)

Store these as system settings, editable by Admin — do not hardcode values in logic:

- `SESSION_GRACE_PERIOD_MINUTES` — minutes after session start still counted as "Terlambat" not "Alpa" (default: 10)
- `QR_TOKEN_TTL_SECONDS` — if using dynamic QR, refresh interval (default: 45)
- `GPS_RADIUS_METERS` — allowed radius from school coordinates (default: 100)
- `CREDIT_POINTS`:
  - `alpa_student`: -10
  - `terlambat_student`: -3
  - `alpa_teacher`: -15
  - `terlambat_teacher`: -5
- `CREDIT_SCORE_THRESHOLD_WARNING` — e.g. 70 (triggers notification)
- `CREDIT_SCORE_THRESHOLD_CRITICAL` — e.g. 40 (triggers escalation to BK/Wakasek)
- `IZIN_SAKIT_APPROVAL_REQUIRED` — boolean, whether Wali Kelas must approve before deduction is skipped
- `ATTENDANCE_SCAN_MODE` — which direction scanning runs in (default: `BOTH`):
  - `STUDENT_SCAN` — students scan the session QR from their own phones (Process 2)
  - `TEACHER_SCAN` — the teacher scans each student's ID card (Process 2b)
  - `BOTH` — either is accepted; each student is recorded by whichever happens first

Admin edits the whole table through `GET/PUT /api/attendance/settings`. The mobile and web clients
read only the subset they must render against — `scanMode`, `qrMode`, `qrTokenTtlSeconds`, the grace
period and the GPS fence — from `GET /api/me/attendance/settings`, which any signed-in user may call.
Credit points and thresholds stay admin-only: no client branches on them.

---

## 2. Process 0 — Schedule Mapping (Teacher × Mata Pelajaran × Class × Classroom × Time)

**Purpose:** Establish and validate the master timetable that everything else depends on.

**Trigger:** Admin creates/edits a `Schedule` entry (per term, or ad-hoc correction).

1. **Inputs required per entry:** `teacher_id`, `mata_pelajaran_id`, `class_id` (rombel), `classroom_id`, `day_of_week`, `jam_ke`/`start_time`/`end_time`, `term_id`.

2. **Validation rules — reject with specific error if violated:**
   - Teacher-subject qualification: teacher must be listed in `TeacherSubject` mapping as qualified for this `mata_pelajaran_id`. Reject: "Guru tidak terdaftar untuk mata pelajaran ini".
   - Teacher clash: same teacher cannot have two overlapping entries, even across classes. Reject: "Guru bentrok jadwal".
   - Class clash: same class cannot have two subjects overlapping in time. Reject: "Kelas bentrok jadwal".
   - Classroom clash: same room cannot be double-booked in overlapping time (confirm with Admin whether school model is "students stay, teachers move" or "rotating rooms" — affects whether this check applies).
   - Subject load (soft warning): flag if teacher's total weekly hours exceed `MAX_WEEKLY_HOURS`; does not block save.

3. **Supporting master data required before Schedule entries can be created:** `TeacherSubject` mapping (which subjects each teacher is qualified for), `Classroom` master (room id, name, capacity), `Class/Rombel` master (class id, wali kelas, student roster).

4. **Term rollover:** new term clones or rebuilds schedule; old term's entries stay read-only, versioned by `term_id` so past records remain traceable to the schedule active at the time.

5. **Mid-term changes:** changing a Schedule entry mid-term must not retroactively alter past Session/Attendance/CreditScore records — create a new effective-dated version instead.

**Output:** A validated `Schedule` table Process 1 can query by `day_of_week + current_time` with exactly one teacher, one subject, one class, one room per slot.

---

## 3. Process 1 — Class Session Lifecycle

**Trigger:** Scheduled start time reached, or teacher manually opens session.

1. System resolves the active `Schedule` entry for current day + time slot.
2. Create a `Session` record: `schedule_id`, `date`, `status = open`, `opened_at`.
3. Generate QR token:
   - Static mode: one token per session, valid for full session duration.
   - Dynamic mode: token regenerates every `QR_TOKEN_TTL_SECONDS`; store latest token + issued_at.
4. Session accepts scans from `opened_at` until `scheduled_end_time + SESSION_GRACE_PERIOD_MINUTES`.
5. Session auto-closes at that cutoff (background job/cron), or teacher can close manually early.
6. On close:
   - Set `status = closed`, `closed_at = now()`.
   - Trigger **Process 3** (student credit deduction) for all roster students without an attendance record.
   - Trigger teacher-side check: if teacher never opened/confirmed session → flag for **Process 4**.

**Edge case:** If `TeacherAttendance` for this schedule/date = Alpa/Izin/Sakit (see Process 4) and no substitute assigned, session should not open for scanning — mark as `Kelas Kosong` and skip student deduction entirely (do not penalize students for teacher absence).

---

## 4. Process 2 — Student Attendance Capture (QR + GPS)

**Trigger:** Student scans QR code via mobile app.

Validate in this exact order — stop and return specific error at first failure:

1. **Token check:** QR token exists and not expired → else `"QR expired, ask teacher to refresh"`.
2. **Session check:** token maps to a `Session` with `status = open` → else `"No active session"`.
3. **Enrollment check:** student belongs to the class in this session's `Schedule` → else `"Not enrolled in this class"`.
4. **Duplicate check:** student has no existing `StudentAttendance` record for this session → else `"Already recorded"` (idempotent, no error thrown to user, just no-op).
5. **Time evaluation:**
   - scan_time ≤ scheduled_start + grace period → `status = Hadir`
   - scan_time > grace period but session still open → `status = Terlambat`
6. **GPS evaluation (soft check, does not block):**
   - Compute distance between scan GPS and school coordinates.
   - If within `GPS_RADIUS_METERS` → `gps_valid = true`.
   - If outside radius → `gps_valid = false`, attendance still recorded with computed status, but flagged `needs_review = true` for teacher confirmation. Do NOT auto-reject — indoor GPS drift is expected.
7. Write `StudentAttendance` record: `session_id, student_id, status, scan_time, gps_lat, gps_lng, gps_valid, needs_review, method`.

**Teacher-side reconciliation:** Teacher's live session view lists all scans in real time, with `needs_review` entries highlighted. Teacher can manually override any status (e.g. confirm a flagged GPS scan as valid, or mark a non-scanner as Izin if verbally informed).

---

## 4b. Process 2b — Student Attendance Capture (Teacher Scans ID Card)

**Trigger:** Teacher scans a student's ID card from the live session view. Available when `ATTENDANCE_SCAN_MODE` is `TEACHER_SCAN` or `BOTH`.

**Why it exists:** Process 2 assumes every student has a phone in class, and its session QR can be screenshotted and forwarded to an absent student — GPS is the only defense and it is deliberately soft. Here the teacher holds the only device and is looking at the student while scanning, so presence is verified by a human rather than by coordinates.

Same validation order as Process 2, minus GPS:

1. **Session check:** session exists and `status = open` → else `"Tidak ada sesi aktif"`.
2. **Mode check:** `ATTENDANCE_SCAN_MODE ≠ STUDENT_SCAN` → else `"Mode presensi saat ini tidak mengizinkan scan kartu"`.
3. **Card lookup:** `Student.cardToken` matches the scanned QR — or `nis` when the teacher types it in because the card is missing → else `"Kartu tidak dikenal"` / `"NIS tidak ditemukan"`.
4. **Enrollment check:** student is `ACTIVE` and belongs to this session's class → else `"Tidak terdaftar di kelas ini"`.
5. **Duplicate check:** idempotent — reported back as "sudah tercatat", no second record, not an error.
6. **Time evaluation:** identical grace-period rule as Process 2 (`Hadir` / `Terlambat`).
7. Write `StudentAttendance` with `method = CARD`, `scan_time`, and **no GPS fields**; `needs_review` is never set, so nothing lands in the teacher's confirmation queue.

**Student side:** when the mode is `TEACHER_SCAN` or `BOTH`, the student dashboard shows "Kartu Presensi Saya" — the same `cardToken` rendered on screen, so a student who left the printed card at home can still be scanned. The token is minted on first view if Admin has not printed the class yet. Under `TEACHER_SCAN` the student's own scanner is hidden, since the API would reject it anyway (step 2).

**Card lifecycle:**

- **Mint** — `Student.cardToken` is an opaque random token (same generator as the session QR), created per class from Admin → Kartu Siswa. Idempotent: students who already hold a card keep their token when a class is reprinted.
- **Print** — Admin → Kartu Siswa renders an ID-1 (85.6 × 54 mm) sheet per class with photo (`User.avatar`), name, NIS, class and the QR.
- **Revoke** — "Terbitkan Ulang Kartu" regenerates the token, so a lost card stops working immediately; the student's identity, NIS and history are untouched.

---

## 5. Process 3 — Student Credit Score Auto-Deduction

**Trigger:** Session closes (Process 1, step 6).

For each student on the class roster:

1. If student has `StudentAttendance` with `status = Hadir` → no action.
2. If `status = Terlambat` → create `CreditScore` entry: `type = pelanggaran`, `category = kedisiplinan`, `points = CREDIT_POINTS.terlambat_student`, `source = auto`, `ref_session_id`.
3. If student has **no** attendance record at all:
   - Check for a pre-approved Izin/Sakit covering this session (see Process 5) → if exists, set `status = Izin`/`Sakit`, no deduction.
   - Else → `status = Alpa`, create `CreditScore` entry: `points = CREDIT_POINTS.alpa_student`, `category = kedisiplinan`, `source = auto`.
4. After writing any deduction, recalculate student's running total score.
5. Compare against `CREDIT_SCORE_THRESHOLD_WARNING` / `_CRITICAL` → trigger **Process 7** if crossed.

**Reversal rule:** If an Izin/Sakit is approved _after_ an Alpa deduction was already applied (late submission), reverse it: create an offsetting `CreditScore` entry of type `koreksi` (+points equal to the original deduction) rather than deleting the original record — preserve full audit trail.

---

## 6. Process 4 — Teacher Attendance & Substitute Handling

**Trigger:** Teacher self-reports absence, or Admin inputs it, or teacher fails to open a scheduled session with no report filed.

1. Record `TeacherAttendance`: `schedule_id, date, status (Izin/Sakit/Tugas Luar/Alpa), reported_by, reason`.
2. If status = Alpa (unreported, detected retroactively) or Terlambat beyond grace period:
   - Create `CreditScore` entry for the teacher: `points = CREDIT_POINTS.alpa_teacher` or `terlambat_teacher`, `category = kedisiplinan`, `source = auto`.
3. System flags all `Schedule` entries for that teacher on that date.
4. Admin assigns substitute teacher (optional) → set `substitute_teacher_id` on `TeacherAttendance`.
   - If assigned → session opens normally under substitute's name; substitute can open QR session as if it were their own.
   - If not assigned → session marked `Kelas Kosong`, no QR generated, no student attendance possible, no student deductions (see Process 1 edge case).
5. Notify: affected students (in-app), Wali Kelas of affected class, Admin (if unresolved 15 min before session start).

---

## 7. Process 5 — Izin / Sakit Submission

**Trigger:** Student or parent submits a request, before or during a session.

1. Submission includes: `student_id`, `date`, `session_id or schedule_id (if pre-submitted for a future date)`, `reason`, optional attachment (surat dokter, etc.).
2. Status = `pending`.
3. Routed to Wali Kelas (or Admin, per `IZIN_SAKIT_APPROVAL_REQUIRED` setting) for approval.
4. If approved **before** session closes → attendance pre-set to `Izin`/`Sakit`, Process 3 skips deduction.
5. If approved **after** session already closed and Alpa was deducted → apply reversal rule (Process 3, reversal rule).
6. If rejected → status stays as originally recorded (Alpa stands), notify submitter with reason.

---

## 8. Process 6 — Manual Credit Score Entry (Students & Teachers)

**Trigger:** Teacher/BK (for students) or Kepala Sekolah/Wakasek (for teachers) logs an entry outside the absence system.

1. Form fields: `owner_id`, `owner_type (student/teacher)`, `type (prestasi/pelanggaran)`, `category`, `points`, `note`, `evidence (optional)`, `reported_by`.
2. Save as `CreditScore` entry with `source = manual`.
3. Recalculate running total for that owner.
4. Trigger threshold check → **Process 7** if applicable.

**Category lists (configurable, seed with these defaults):**

_Student:_

- Pelanggaran: Kedisiplinan, Akademik, Etika/Perilaku, Seragam/Atribut
- Prestasi: Akademik, Non-akademik/Lomba, Ekstrakurikuler, Kepemimpinan

_Teacher:_

- Pelanggaran: Kedisiplinan, Administrasi (jurnal/RPP), Komplain
- Prestasi: Kehadiran Sempurna, Pembinaan Siswa Berprestasi, Sertifikasi/Pelatihan, Inovasi Pengajaran

---

## 9. Process 7 — Notification & Escalation

**Trigger:** Any of — credit score crosses threshold, GPS-flagged attendance pending review, teacher absence with no substitute assigned, new manual credit entry.

| Trigger                                            | Recipients             | Channel                             |
| -------------------------------------------------- | ---------------------- | ----------------------------------- |
| Student score ≤ WARNING                            | Wali Kelas             | In-app                              |
| Student score ≤ CRITICAL                           | Wali Kelas, BK, Parent | In-app + WhatsApp/email             |
| Teacher score ≤ WARNING                            | Kepala Sekolah/Wakasek | In-app                              |
| Teacher score ≤ CRITICAL                           | Kepala Sekolah/Wakasek | In-app + email                      |
| GPS flagged, needs_review                          | Session's teacher      | In-app, real-time on session screen |
| Teacher absence, no substitute 15 min before class | Admin                  | In-app + push                       |

Notifications must be logged (who, when, what triggered it) for audit purposes — do not fire-and-forget.

---

## 10. Cross-Cutting Rules

- **Audit trail:** Every `CreditScore` entry is immutable once created. Corrections are new offsetting entries (`type = koreksi`), never edits or deletes.
- **Idempotency:** Re-running Process 3 for an already-closed session must not create duplicate deductions — check for existing `source = auto, ref_session_id` before inserting.
- **Timezone:** All scheduling/session time comparisons use school's local timezone (WIB/WITA/WIT as applicable), stored consistently (recommend UTC in DB, convert at display/comparison layer).
- **No double penalty:** A student marked Alpa should never simultaneously receive both a raw "Alpa" status AND a separate manual pelanggaran entry for the same absence unless explicitly logged as a distinct incident (e.g. repeated pattern review by BK).
- **Teacher absence ≠ student penalty:** Reinforced from Process 1 — students are never penalized for a class that didn't run due to teacher absence.

---

## 11. Out of Scope for v1 (explicitly excluded — do not build)

- Face recognition attendance
- BLE beacon / NFC hardware integration
- Multi-school / multi-tenant support
- Automated substitute-teacher recommendation (AI-suggested); v1 is manual admin assignment only

---

## 12. Open Decisions Needed Before/During Build

Flag these to the user if not yet answered — do not assume defaults silently for production values:

- Exact point values per category (defaults above are placeholders)
- Static vs dynamic QR for v1 (recommend dynamic if projector available in all rooms, else static)
- Whether `IZIN_SAKIT_APPROVAL_REQUIRED` defaults to true or false
- Notification channel integration specifics (WhatsApp API provider, email service)
- Whether CreditScore table is polymorphic (`owner_type` + `owner_id`) or split into separate student/teacher tables — confirm against existing schema before implementing Process 6/7 logic
