# Admin Endpoints Guide

Base URL: `http://localhost:5000/api`

All admin endpoints require authentication via `Authorization: Bearer <token>` and role `ADMIN` or `INSTRUCTOR`.

---

## Access Control

- Middleware: `authenticate` + `requireAdmin`
- Allowed roles: `ADMIN`, `INSTRUCTOR`
- Frontend should hide admin UI for non-admins and handle `403 Forbidden` gracefully.

---

## 1) Admin Dashboard & Analytics (`/admin`)

### System Overview
- `GET /admin/overview`
  - Returns platform-wide statistics: total users, active users, submissions, contests, sessions, etc.

### User Growth
- `GET /admin/users/growth?from=DATE&to=DATE&bucket=day|month`
  - Time-series of registrations. `bucket`: `day` or `month`.

### Engagement
- `GET /admin/engagement?from=DATE&to=DATE`
  - User activity metrics: active users, submission rates, streak data.

### Attendance Analytics
- `GET /admin/attendance/stats?from=DATE&to=DATE`
  - Attendance trends: average rate, participation.

### Notifications Usage
- `GET /admin/notifications/usage?from=DATE&to=DATE`
  - Delivery/read rates per notification type.

### Achievements Stats
- `GET /admin/achievements/stats`
  - Unlock statistics: most earned, distribution.

### Contest Participation
- `GET /admin/contests/:contestId/participation`
  - Detailed participation: rankings, score distribution.

### Submissions Stats
- `GET /admin/submissions/stats?from=DATE&to=DATE`
  - Patterns: success rates, languages, platforms.

### Usage Time
- `GET /admin/usage/time?from=DATE&to=DATE`
  - Time spent on platform: peak usage times, durations.

---

## 2) Session Management (`/sessions`)

### Create Session (Admin Only)
- `POST /sessions`
- Body:
```json
{
  "name": "Advanced Algorithms Workshop",
  "type": "LECTURE",
  "date": "2025-12-25",
  "startTime": "2025-12-25T10:00:00Z",
  "endTime": "2025-12-25T12:00:00Z",
  "instructor": "Dr. Smith",
  "description": "Graph algorithms deep dive",
  "location": "Room 101",
  "capacity": 50
}
```

### Update Session (Admin Only)
- `PUT /sessions/:id`
- Body: Partial session object (fields to update)

### Delete Session (Admin Only)
- `DELETE /sessions/:id`

### Additional (All Users)
- `GET /sessions?page=1&limit=20&type=LECTURE&date=2025-12-25&upcoming=true`
- `GET /sessions/:id`
- `GET /sessions/:id/stats`

---

## 3) Attendance Management (`/attendance`)

### Mark Single Attendance (Admin Only)
- `POST /attendance`
- Body:
```json
{
  "userId": "uuid",
  "sessionId": "uuid",
  "present": true
}
```

### Mark Bulk Attendance (Admin Only)
- `POST /attendance/bulk`
- Body:
```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "sessionId": "uuid",
  "present": true
}
```
- Returns: `{ "count": number, "message": string }`

### Get Session Attendance (Admin Only)
- `GET /attendance/session/:sessionId`
- Returns: Users and attendance status for a session

### Additional (All Users)
- `GET /attendance/user/:userId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /attendance/stats/:userId`

---

## 4) Problem Management (`/problems`)

### Create Problem (Admin Only)
- `POST /problems`
- Body:
```json
{
  "title": "Two Sum",
  "slug": "two-sum",
  "description": "Find two numbers that add up to target",
  "platform": "LEETCODE",
  "problemLink": "https://leetcode.com/problems/two-sum",
  "difficulty": "EASY",
  "topics": ["Array", "Hash Table"],
  "isDailyQuestion": false,
  "acceptanceRate": 47.5
}
```

### Bulk Import (Admin Only)
- `POST /problems/bulk-import`
- Body: Array of problem objects

### Update Problem (Admin Only)
- `PUT /problems/:id`

### Delete Problem (Admin Only)
- `DELETE /problems/:id`

### Additional (All Users)
- `GET /problems`
- `GET /problems/daily/current`
- `GET /problems/slug/:slug`
- `GET /problems/:id`
- `GET /problems/:id/submissions`
- `GET /problems/:id/stats`

---

## 5) Contest Management (`/contests`)

### Create Contest (Admin Only)
- `POST /contests`
- Body:
```json
{
  "name": "Weekly Contest 123",
  "platform": "CODEFORCES",
  "externalId": "1234",
  "startTime": "2025-12-30T14:00:00Z",
  "duration": 120,
  "isRated": true
}
```

### Sync Standings (Admin Only)
- `POST /contests/:id/sync`
- Sync from external platform (e.g., Codeforces)

### Update Contest (Admin Only)
- `PUT /contests/:id`

### Delete Contest (Admin Only)
- `DELETE /contests/:id`

### Additional (All Users)
- `GET /contests`
- `GET /contests/upcoming`
- `GET /contests/user/:userId`
- `GET /contests/:id`
- `GET /contests/:id/standings`
- `POST /contests/:id/register`

---

## 6) Achievement Management (`/achievements`)

### Create Achievement (Admin Only)
- `POST /achievements`
- Body:
```json
{
  "name": "Week Warrior",
  "description": "Maintain a 7-day streak",
  "icon": "🔥",
  "type": "STREAK_7",
  "requirement": { "streakDays": 7 }
}
```

### Additional (All Users)
- `GET /achievements`
- `GET /achievements/user/:userId`
- `GET /achievements/progress`

---

## 7) User Management (`/users`)

### Delete User (Admin Only)
- `DELETE /users/:id`
- Irreversible; removes user and related data

### Additional (All Users / Self or Admin)
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `GET /users/:id/stats`
- `GET /users/:id/progress`
- `GET /users/:id/activity`

---

## 8) Activity Tracking (`/activity`)

### User Time Logs (Admin Only)
- `GET /activity/minutes/:userId`
- Detailed time tracking for a specific user

---

## Response Format

All endpoints return:
```json
{
  "success": true,
  "data": {},
  "error": "string",
  "message": "string",
  "total": 0,
  "page": 1,
  "totalPages": 1
}
```

---

## Frontend Guidance (Admin UI)

- **Dashboard**: Overview cards, growth and engagement charts, recent activity, quick actions.
- **Sessions**: Calendar/list, create/edit forms, filters, stats, delete.
- **Attendance**: Session selector, user table with toggles, bulk actions, save feedback.
- **Problems**: CRUD, bulk import (CSV/JSON), filters, daily question.
- **Contests**: CRUD, calendar, standings sync, participants, status updates.
- **Achievements**: Create form, list, unlock stats, icon picker.
- **Analytics**: Time range selector, charts (line, bar, pie, heatmap), export CSV/PDF.
- **Users**: List/search, detail view (stats, activity, submissions), delete, role management.

Recommended stack: React + TypeScript, TanStack Query, React Hook Form + Zod, shadcn/ui or MUI/AntD, Recharts/Chart.js, TanStack Table, date-fns, react-big-calendar/FullCalendar.
