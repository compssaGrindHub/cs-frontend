# API Endpoints Documentation

This document provides comprehensive documentation for all API endpoints in the backend, with accurate request body and response structures based on the actual implementation.

---

## Authentication & Authorization

- **Most endpoints require authentication.**
- For protected endpoints, include the following HTTP header:
  
  `Authorization: Bearer <accessToken>`

- Public endpoints (registration, login, forgot/reset password, refresh token) do not require a token.
- Admin-only endpoints require the user to have the `ADMIN` role.

---

## Base URL

All endpoints are prefixed with `/api`

---

## USER ENDPOINTS

### Authentication (`/api/auth`)

#### Register
- **POST** `/api/auth/register` (No auth required)
- **Body:**
```json
{
  "username": "string (3-20 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 8 chars, must contain uppercase, lowercase, and number)",
  "firstName": "string (optional)",
  "lastName": "string (optional)"
}
```
- **Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "string (uuid)",
      "username": "string",
      "email": "string",
      "role": "USER",
      "firstName": "string | null",
      "lastName": "string | null",
      "profilePicture": "string | null",
      "codeforcesHandle": "string | null",
      "leetcodeUsername": "string | null",
      "githubUsername": "string | null",
      "githubRepo": "string | null",
      "totalRating": 0,
      "globalRank": "number | null",
      "currentStreak": 0,
      "longestStreak": 0,
      "lastActiveDate": "DateTime | null",
      "createdAt": "DateTime",
      "updatedAt": "DateTime"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
}
```

#### Login
- **POST** `/api/auth/login` (No auth required)
- **Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "string (uuid)",
      "username": "string",
      "email": "string",
      "role": "USER | ADMIN | INSTRUCTOR",
      "firstName": "string | null",
      "lastName": "string | null",
      "profilePicture": "string | null",
      "codeforcesHandle": "string | null",
      "leetcodeUsername": "string | null",
      "githubUsername": "string | null",
      "githubRepo": "string | null",
      "totalRating": "number",
      "globalRank": "number | null",
      "currentStreak": "number",
      "longestStreak": "number",
      "lastActiveDate": "DateTime | null",
      "createdAt": "DateTime",
      "updatedAt": "DateTime"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
}
```

#### Refresh Token
- **POST** `/api/auth/refresh-token` (No auth required)
- **Body:**
```json
{
  "refreshToken": "string"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

#### Forgot Password
- **POST** `/api/auth/forgot-password` (No auth required)
- **Body:**
```json
{
  "email": "string"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent if account exists"
}
```

#### Reset Password
- **POST** `/api/auth/reset-password` (No auth required)
- **Body:**
```json
{
  "token": "string",
  "newPassword": "string (min 8 chars, must contain uppercase, lowercase, and number)"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

#### Get Current User
- **GET** `/api/auth/me` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "username": "string",
    "email": "string",
    "role": "USER | ADMIN | INSTRUCTOR",
    "firstName": "string | null",
    "lastName": "string | null",
    "profilePicture": "string | null",
    "codeforcesHandle": "string | null",
    "leetcodeUsername": "string | null",
    "githubUsername": "string | null",
    "githubRepo": "string | null",
    "totalRating": "number",
    "globalRank": "number | null",
    "currentStreak": "number",
    "longestStreak": "number",
    "lastActiveDate": "DateTime | null",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
}
```

#### Change Password
- **POST** `/api/auth/change-password` (**Requires auth token**)
- **Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string (min 8 chars, must contain uppercase, lowercase, and number)"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Logout
- **POST** `/api/auth/logout` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Users (`/api/users`)

> **All endpoints below require authentication unless otherwise noted.**

#### Get All Users
- **GET** `/api/users?page=1&limit=20&search=abc&sortBy=rating&order=desc` (**Requires auth token**)
- **Query Parameters:**
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
  - `search` (optional): Search by username, email, or codeforces handle
  - `sortBy` (optional, default: createdAt): Sort field (`rating`, `rank`, `streak`, `createdAt`)
  - `order` (optional, default: desc): Sort order (`asc`, `desc`)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "username": "string",
      "email": "string",
      "role": "USER | ADMIN | INSTRUCTOR",
      "firstName": "string | null",
      "lastName": "string | null",
      "profilePicture": "string | null",
      "codeforcesHandle": "string | null",
      "leetcodeUsername": "string | null",
      "githubUsername": "string | null",
      "totalRating": "number",
      "globalRank": "number | null",
      "currentStreak": "number",
      "longestStreak": "number",
      "createdAt": "DateTime",
      "updatedAt": "DateTime"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

#### Get User by ID
- **GET** `/api/users/:id` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "username": "string",
    "email": "string",
    "role": "USER | ADMIN | INSTRUCTOR",
    "firstName": "string | null",
    "lastName": "string | null",
    "profilePicture": "string | null",
    "codeforcesHandle": "string | null",
    "leetcodeUsername": "string | null",
    "githubUsername": "string | null",
    "githubRepo": "string | null",
    "totalRating": "number",
    "globalRank": "number | null",
    "currentStreak": "number",
    "longestStreak": "number",
    "lastActiveDate": "DateTime | null",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
}
```

#### Update User
- **PUT** `/api/users/:id` (**Requires auth token** - user can only update own profile unless admin/instructor)
- **Body:** (all fields optional)
```json
{
  "firstName": "string",
  "lastName": "string",
  "profilePicture": "string (URL)",
  "codeforcesHandle": "string",
  "leetcodeUsername": "string",
  "githubUsername": "string",
  "githubRepo": "string"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "username": "string",
    "email": "string",
    "role": "USER | ADMIN | INSTRUCTOR",
    "firstName": "string | null",
    "lastName": "string | null",
    "profilePicture": "string | null",
    "codeforcesHandle": "string | null",
    "leetcodeUsername": "string | null",
    "githubUsername": "string | null",
    "githubRepo": "string | null",
    "totalRating": "number",
    "globalRank": "number | null",
    "currentStreak": "number",
    "longestStreak": "number",
    "lastActiveDate": "DateTime | null",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
}
```

#### Delete User
- **DELETE** `/api/users/:id` (**Requires auth token, admin only**)
- **Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Get User Stats
- **GET** `/api/users/:id/stats` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProblems": "number",
    "solvedProblems": "number",
    "contestsParticipated": "number",
    "averageRank": "number | null",
    "topicBreakdown": [
      {
        "topic": "string",
        "count": "number"
      }
    ],
    "recentSubmissions": [
      {
        "id": "string (uuid)",
        "problemTitle": "string",
        "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
        "language": "string",
        "submissionTime": "DateTime"
      }
    ],
    "ratingHistory": [
      {
        "contestName": "string",
        "date": "DateTime",
        "ratingChange": "number",
        "newRating": "number"
      }
    ]
  }
}
```

#### Get User Progress
- **GET** `/api/users/:id/progress` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "topics": [
      {
        "name": "string",
        "solved": "number",
        "total": "number",
        "percentage": "number",
        "difficulty": {
          "easy": "number",
          "medium": "number",
          "hard": "number"
        }
      }
    ]
  }
}
```

#### Get User Activity
- **GET** `/api/users/:id/activity?limit=20` (**Requires auth token**)
- **Query Parameters:**
  - `limit` (optional, default: 20): Number of activities to return
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "type": "submission",
      "date": "DateTime",
      "description": "string",
      "metadata": {
        "id": "string (uuid)",
        "problemTitle": "string",
        "status": "string",
        "language": "string",
        "submissionTime": "DateTime"
      }
    }
  ]
}
```

---

### Problems (`/api/problems`)

> **All endpoints below require authentication.**

#### Get All Problems
- **GET** `/api/problems?page=1&limit=20&difficulty=EASY&topics=Array,String&platform=LEETCODE&status=solved&search=two&sortBy=title` (**Requires auth token**)
- **Query Parameters:**
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
  - `difficulty` (optional): Filter by difficulty (`EASY`, `MEDIUM`, `HARD`)
  - `topics` (optional): Comma-separated list of topics
  - `platform` (optional): Filter by platform (`LEETCODE`, `CODEFORCES`, `CUSTOM`)
  - `status` (optional): Filter by user's status (`solved`, `attempted`, `unsolved`)
  - `search` (optional): Search by title or slug
  - `sortBy` (optional, default: title): Sort field (`difficulty`, `title`, `acceptanceRate`)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "title": "string",
      "slug": "string",
      "platform": "LEETCODE | CODEFORCES | CUSTOM",
      "problemLink": "string (URL)",
      "difficulty": "EASY | MEDIUM | HARD",
      "topics": ["string"],
      "isDailyQuestion": "boolean",
      "dailyDate": "DateTime | null",
      "acceptanceRate": "number | null",
      "totalSubmissions": "number",
      "createdAt": "DateTime",
      "updatedAt": "DateTime",
      "userStatus": "solved | attempted | unsolved (only if status query param provided)"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

#### Get Daily Question
- **GET** `/api/problems/daily/current` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "title": "string",
    "slug": "string",
    "description": "string",
    "platform": "LEETCODE | CODEFORCES | CUSTOM",
    "problemLink": "string (URL)",
    "difficulty": "EASY | MEDIUM | HARD",
    "topics": ["string"],
    "isDailyQuestion": true,
    "dailyDate": "DateTime",
    "acceptanceRate": "number | null",
    "totalSubmissions": "number",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  } | null,
  "message": "No daily question set (if data is null)"
}
```

#### Get Problem by Slug
- **GET** `/api/problems/slug/:slug` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "title": "string",
    "slug": "string",
    "description": "string",
    "platform": "LEETCODE | CODEFORCES | CUSTOM",
    "problemLink": "string (URL)",
    "difficulty": "EASY | MEDIUM | HARD",
    "topics": ["string"],
    "isDailyQuestion": "boolean",
    "dailyDate": "DateTime | null",
    "acceptanceRate": "number | null",
    "totalSubmissions": "number",
    "createdAt": "DateTime",
    "updatedAt": "DateTime",
    "submissions": [
      {
        "id": "string (uuid)",
        "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
        "language": "string",
        "submissionTime": "DateTime",
        "user": {
          "id": "string (uuid)",
          "username": "string"
        }
      }
    ]
  }
}
```

#### Get Problem by ID
- **GET** `/api/problems/:id` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "title": "string",
    "slug": "string",
    "description": "string",
    "platform": "LEETCODE | CODEFORCES | CUSTOM",
    "problemLink": "string (URL)",
    "difficulty": "EASY | MEDIUM | HARD",
    "topics": ["string"],
    "isDailyQuestion": "boolean",
    "dailyDate": "DateTime | null",
    "acceptanceRate": "number | null",
    "totalSubmissions": "number",
    "createdAt": "DateTime",
    "updatedAt": "DateTime",
    "submissions": [
      {
        "id": "string (uuid)",
        "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
        "language": "string",
        "submissionTime": "DateTime",
        "user": {
          "id": "string (uuid)",
          "username": "string"
        }
      }
    ]
  }
}
```

#### Get Problem Submissions
- **GET** `/api/problems/:id/submissions` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
      "language": "string",
      "submissionTime": "DateTime",
      "user": {
        "id": "string (uuid)",
        "username": "string",
        "profilePicture": "string | null"
      }
    }
  ]
}
```

#### Get Problem Stats
- **GET** `/api/problems/:id/stats` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSubmissions": "number",
    "acceptedSubmissions": "number",
    "acceptanceRate": "number",
    "totalUsers": "number",
    "languageBreakdown": [
      {
        "language": "string",
        "count": "number"
      }
    ]
  }
}
```

#### Create Problem
- **POST** `/api/problems` (**Requires auth token, admin only**)
- **Body:**
```json
{
  "title": "string",
  "slug": "string",
  "description": "string",
  "platform": "LEETCODE | CODEFORCES | CUSTOM",
  "problemLink": "string (URL)",
  "difficulty": "EASY | MEDIUM | HARD",
  "topics": ["string"],
  "acceptanceRate": "number (0-100, optional)"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "title": "string",
    "slug": "string",
    "description": "string",
    "platform": "LEETCODE | CODEFORCES | CUSTOM",
    "problemLink": "string (URL)",
    "difficulty": "EASY | MEDIUM | HARD",
    "topics": ["string"],
    "isDailyQuestion": false,
    "dailyDate": "DateTime | null",
    "acceptanceRate": "number | null",
    "totalSubmissions": 0,
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
}
```

#### Bulk Import Problems
- **POST** `/api/problems/bulk-import` (**Requires auth token, admin only**)
- **Body:**
```json
{
  "problems": [
    {
      "title": "string",
      "description": "string",
      "platform": "LEETCODE | CODEFORCES | CUSTOM",
      "problemLink": "string (URL)",
      "difficulty": "EASY | MEDIUM | HARD",
      "topics": ["string"]
    }
  ]
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "imported": "number",
    "skipped": "number",
    "errors": ["string"]
  }
}
```

#### Update Problem
- **PUT** `/api/problems/:id` (**Requires auth token, admin only**)
- **Body:** (all fields optional)
```json
{
  "title": "string",
  "slug": "string",
  "description": "string",
  "platform": "LEETCODE | CODEFORCES | CUSTOM",
  "problemLink": "string (URL)",
  "difficulty": "EASY | MEDIUM | HARD",
  "topics": ["string"],
  "acceptanceRate": "number (0-100)"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "title": "string",
    "slug": "string",
    "description": "string",
    "platform": "LEETCODE | CODEFORCES | CUSTOM",
    "problemLink": "string (URL)",
    "difficulty": "EASY | MEDIUM | HARD",
    "topics": ["string"],
    "isDailyQuestion": "boolean",
    "dailyDate": "DateTime | null",
    "acceptanceRate": "number | null",
    "totalSubmissions": "number",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
}
```

#### Delete Problem
- **DELETE** `/api/problems/:id` (**Requires auth token, admin only**)
- **Response (200):**
```json
{
  "success": true,
  "message": "Problem deleted successfully"
}
```

---

### Contests (`/api/contests`)

> **All endpoints below require authentication.**

#### Get All Contests
- **GET** `/api/contests?page=1&limit=20&status=UPCOMING&platform=CODEFORCES` (**Requires auth token**)
- **Query Parameters:**
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
  - `status` (optional): Filter by status (`UPCOMING`, `LIVE`, `COMPLETED`)
  - `platform` (optional): Filter by platform (`LEETCODE`, `CODEFORCES`, `CUSTOM`)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "name": "string",
      "platform": "LEETCODE | CODEFORCES | CUSTOM",
      "externalId": "string | null",
      "startTime": "DateTime",
      "duration": "number (minutes)",
      "isRated": "boolean",
      "status": "UPCOMING | LIVE | COMPLETED",
      "participantCount": "number",
      "createdAt": "DateTime",
      "updatedAt": "DateTime"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

#### Get Upcoming Contests
- **GET** `/api/contests/upcoming?limit=10` (**Requires auth token**)
- **Query Parameters:**
  - `limit` (optional, default: 10): Number of contests to return
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "name": "string",
      "platform": "LEETCODE | CODEFORCES | CUSTOM",
      "externalId": "string | null",
      "startTime": "DateTime",
      "duration": "number (minutes)",
      "isRated": "boolean",
      "status": "UPCOMING",
      "participantCount": "number",
      "createdAt": "DateTime",
      "updatedAt": "DateTime"
    }
  ]
}
```

#### Get User Contests
- **GET** `/api/contests/user/:userId` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "name": "string",
      "platform": "LEETCODE | CODEFORCES | CUSTOM",
      "externalId": "string | null",
      "startTime": "DateTime",
      "duration": "number (minutes)",
      "isRated": "boolean",
      "status": "UPCOMING | LIVE | COMPLETED",
      "participantCount": "number",
      "createdAt": "DateTime",
      "updatedAt": "DateTime"
    }
  ]
}
```

#### Get Contest by ID
- **GET** `/api/contests/:id` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "name": "string",
    "platform": "LEETCODE | CODEFORCES | CUSTOM",
    "externalId": "string | null",
    "startTime": "DateTime",
    "duration": "number (minutes)",
    "isRated": "boolean",
    "status": "UPCOMING | LIVE | COMPLETED",
    "participantCount": "number",
    "createdAt": "DateTime",
    "updatedAt": "DateTime",
    "_count": {
      "participations": "number"
    }
  }
}
```

#### Get Contest Standings
- **GET** `/api/contests/:id/standings` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "userId": "string (uuid)",
      "contestId": "string (uuid)",
      "rank": "number",
      "ratingChange": "number",
      "problemsSolved": "number",
      "totalPoints": "number",
      "createdAt": "DateTime",
      "user": {
        "id": "string (uuid)",
        "username": "string",
        "profilePicture": "string | null",
        "codeforcesHandle": "string | null"
      }
    }
  ]
}
```

#### Register for Contest
- **POST** `/api/contests/:id/register` (**Requires auth token**)
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "userId": "string (uuid)",
    "contestId": "string (uuid)",
    "rank": 0,
    "ratingChange": 0,
    "problemsSolved": 0,
    "totalPoints": 0,
    "createdAt": "DateTime"
  }
}
```

#### Create Contest
- **POST** `/api/contests` (**Requires auth token, admin only**)
- **Body:**
```json
{
  "name": "string",
  "platform": "LEETCODE | CODEFORCES | CUSTOM",
  "externalId": "string (optional)",
  "startTime": "string (ISO datetime)",
  "duration": "number (minutes, min 1)",
  "isRated": "boolean (default: true)",
  "description": "string (optional)"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "name": "string",
    "platform": "LEETCODE | CODEFORCES | CUSTOM",
    "externalId": "string | null",
    "startTime": "DateTime",
    "duration": "number (minutes)",
    "isRated": "boolean",
    "status": "UPCOMING",
    "participantCount": 0,
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
}
```

#### Sync Contest Standings
- **POST** `/api/contests/:id/sync` (**Requires auth token, admin only**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "synced": "number",
    "message": "string"
  }
}
```

#### Update Contest
- **PUT** `/api/contests/:id` (**Requires auth token, admin only**)
- **Body:** (all fields optional)
```json
{
  "name": "string",
  "platform": "LEETCODE | CODEFORCES | CUSTOM",
  "externalId": "string",
  "startTime": "string (ISO datetime)",
  "duration": "number (minutes)",
  "isRated": "boolean",
  "description": "string"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "name": "string",
    "platform": "LEETCODE | CODEFORCES | CUSTOM",
    "externalId": "string | null",
    "startTime": "DateTime",
    "duration": "number (minutes)",
    "isRated": "boolean",
    "status": "UPCOMING | LIVE | COMPLETED",
    "participantCount": "number",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
}
```

#### Delete Contest
- **DELETE** `/api/contests/:id` (**Requires auth token, admin only**)
- **Response (200):**
```json
{
  "success": true,
  "message": "Contest deleted successfully"
}
```

---

### Submissions (`/api/submissions`)

> **All endpoints below require authentication.**

#### Create Submission
- **POST** `/api/submissions` (**Requires auth token**)
- **Body:**
```json
{
  "problemId": "string (uuid)",
  "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
  "language": "string",
  "code": "string",
  "submissionTime": "string (ISO datetime, optional)"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "userId": "string (uuid)",
    "problemId": "string (uuid)",
    "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
    "language": "string",
    "code": "string",
    "submissionTime": "DateTime",
    "githubPushed": false,
    "githubUrl": "string | null",
    "createdAt": "DateTime"
  }
}
```

#### Create Submission from Extension
- **POST** `/api/submissions/from-extension` (**Requires auth token**)
- **Body:**
```json
{
  "problemTitle": "string",
  "problemLink": "string (URL)",
  "platform": "LEETCODE | CODEFORCES",
  "difficulty": "EASY | MEDIUM | HARD (optional)",
  "topics": ["string"] (optional),
  "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
  "language": "string",
  "code": "string",
  "submissionTime": "string (ISO datetime)"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "problem": {
      "id": "string (uuid)",
      "title": "string",
      "slug": "string",
      "topics": ["string"],
      "difficulty": "EASY | MEDIUM | HARD",
      "platform": "LEETCODE | CODEFORCES | CUSTOM"
    },
    "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
    "githubPushed": "boolean",
    "githubUrl": "string | null"
  }
}
```

#### Get User Submissions
- **GET** `/api/submissions/user/:userId?page=1&limit=20&status=ACCEPTED&problemId=uuid` (**Requires auth token**)
- **Query Parameters:**
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
  - `status` (optional): Filter by status
  - `problemId` (optional): Filter by problem ID
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "userId": "string (uuid)",
      "problemId": "string (uuid)",
      "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
      "language": "string",
      "code": "string",
      "submissionTime": "DateTime",
      "githubPushed": "boolean",
      "githubUrl": "string | null",
      "createdAt": "DateTime",
      "problem": {
        "id": "string (uuid)",
        "title": "string",
        "slug": "string",
        "difficulty": "EASY | MEDIUM | HARD",
        "platform": "LEETCODE | CODEFORCES | CUSTOM"
      }
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

#### Get Problem Submissions
- **GET** `/api/submissions/problem/:problemId?limit=50` (**Requires auth token**)
- **Query Parameters:**
  - `limit` (optional, default: 50): Number of submissions to return
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
      "language": "string",
      "submissionTime": "DateTime",
      "user": {
        "id": "string (uuid)",
        "username": "string",
        "profilePicture": "string | null"
      }
    }
  ]
}
```

#### Get Submission by ID
- **GET** `/api/submissions/:id` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "userId": "string (uuid)",
    "problemId": "string (uuid)",
    "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
    "language": "string",
    "code": "string",
    "submissionTime": "DateTime",
    "githubPushed": "boolean",
    "githubUrl": "string | null",
    "createdAt": "DateTime"
  }
}
```

#### Update Submission
- **PUT** `/api/submissions/:id` (**Requires auth token** - user can only update own submissions unless admin)
- **Body:** (partial submission object)
```json
{
  "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
  "language": "string",
  "code": "string"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "userId": "string (uuid)",
    "problemId": "string (uuid)",
    "status": "ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR",
    "language": "string",
    "code": "string",
    "submissionTime": "DateTime",
    "githubPushed": "boolean",
    "githubUrl": "string | null",
    "createdAt": "DateTime"
  }
}
```

#### Delete Submission
- **DELETE** `/api/submissions/:id` (**Requires auth token** - user can only delete own submissions unless admin)
- **Response (200):**
```json
{
  "success": true,
  "message": "Submission deleted successfully"
}
```

#### Push Submission to GitHub
- **POST** `/api/submissions/:id/push-github` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "commitUrl": "string (URL)"
  }
}
```

---

### Leaderboard (`/api/leaderboard`)

> **All endpoints below require authentication.**

#### Get Global Leaderboard
- **GET** `/api/leaderboard?page=1&limit=20&timeframe=all-time&topic=Array` (**Requires auth token**)
- **Query Parameters:**
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
  - `timeframe` (optional, default: all-time): Time period (`all-time`, `monthly`, `weekly`)
  - `topic` (optional): Filter by topic
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rank": "number",
      "user": {
        "id": "string (uuid)",
        "username": "string",
        "profilePicture": "string | null"
      },
      "rating": "number",
      "contestsParticipated": "number",
      "problemsSolved": "number",
      "currentStreak": "number",
      "rankChange": "number"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean",
    "userRank": "number | undefined (if userId provided)"
  }
}
```

#### Get Contest Leaderboard
- **GET** `/api/leaderboard/contest/:contestId?page=1&limit=20` (**Requires auth token**)
- **Query Parameters:**
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "rank": "number",
      "ratingChange": "number",
      "problemsSolved": "number",
      "totalPoints": "number",
      "user": {
        "id": "string (uuid)",
        "username": "string",
        "profilePicture": "string | null"
      }
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

#### Get Topic Leaderboard
- **GET** `/api/leaderboard/topic/:topic?limit=50` (**Requires auth token**)
- **Query Parameters:**
  - `limit` (optional, default: 50): Number of entries to return
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rank": "number",
      "user": {
        "id": "string (uuid)",
        "username": "string",
        "profilePicture": "string | null"
      },
      "problemsSolved": "number",
      "rating": "number"
    }
  ]
}
```

#### Get User Rank
- **GET** `/api/leaderboard/user/:userId/rank` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "rank": "number"
  }
}
```

---

### Achievements (`/api/achievements`)

> **All endpoints below require authentication.**

#### Get All Achievements
- **GET** `/api/achievements` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "name": "string",
      "description": "string",
      "icon": "string",
      "type": "CONTEST_FIRST | CONTEST_SECOND | CONTEST_THIRD | STREAK_7 | STREAK_30 | STREAK_100 | TOPIC_MASTER | EARLY_BIRD | NIGHT_OWL | PERFECT_WEEK",
      "requirement": {},
      "createdAt": "DateTime"
    }
  ]
}
```

#### Get User Achievements
- **GET** `/api/achievements/user/:userId` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "userId": "string (uuid)",
      "achievementId": "string (uuid)",
      "earnedAt": "DateTime",
      "metadata": {} | null,
      "achievement": {
        "id": "string (uuid)",
        "name": "string",
        "description": "string",
        "icon": "string",
        "type": "string",
        "requirement": {}
      }
    }
  ]
}
```

#### Get Achievement Progress
- **GET** `/api/achievements/progress` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "achievement": {
        "id": "string (uuid)",
        "name": "string",
        "description": "string",
        "icon": "string",
        "type": "string"
      },
      "earned": "boolean",
      "currentProgress": "number",
      "totalRequired": "number",
      "percentage": "number"
    }
  ]
}
```

#### Create Achievement
- **POST** `/api/achievements` (**Requires auth token, admin only**)
- **Body:**
```json
{
  "name": "string",
  "description": "string",
  "icon": "string",
  "type": "CONTEST_FIRST | CONTEST_SECOND | CONTEST_THIRD | STREAK_7 | STREAK_30 | STREAK_100 | TOPIC_MASTER | EARLY_BIRD | NIGHT_OWL | PERFECT_WEEK",
  "requirement": {}
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "name": "string",
    "description": "string",
    "icon": "string",
    "type": "string",
    "requirement": {},
    "createdAt": "DateTime"
  }
}
```

---

### Notifications (`/api/notifications`)

> **All endpoints below require authentication.**

#### Get Notifications
- **GET** `/api/notifications?page=1&limit=20&unreadOnly=true` (**Requires auth token**)
- **Query Parameters:**
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
  - `unreadOnly` (optional, default: false): Filter only unread notifications
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "userId": "string (uuid)",
      "type": "CONTEST_REMINDER | DAILY_QUESTION | ACHIEVEMENT_UNLOCKED | RANK_CHANGE | STREAK_WARNING | SYSTEM_ANNOUNCEMENT",
      "title": "string",
      "message": "string",
      "metadata": {} | null,
      "read": "boolean",
      "createdAt": "DateTime"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

#### Get Unread Count
- **GET** `/api/notifications/unread-count` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": "number"
  }
}
```

#### Mark Notification as Read
- **PUT** `/api/notifications/:id/read` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### Mark All Notifications as Read
- **PUT** `/api/notifications/read-all` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### Delete Notification
- **DELETE** `/api/notifications/:id` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### Attendance (`/api/attendance`)

> **All endpoints below require authentication.**

#### Mark Attendance
- **POST** `/api/attendance` (**Requires auth token, admin only**)
- **Body:**
```json
{
  "userId": "string (uuid)",
  "sessionId": "string (uuid)",
  "present": "boolean"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "userId": "string (uuid)",
    "sessionId": "string (uuid)",
    "present": "boolean",
    "createdAt": "DateTime"
  }
}
```

#### Mark Bulk Attendance
- **POST** `/api/attendance/bulk` (**Requires auth token, admin only**)
- **Body:**
```json
{
  "userIds": ["string (uuid)"],
  "sessionId": "string (uuid)",
  "present": "boolean"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "count": "number",
    "message": "Attendance marked for {count} users"
  }
}
```

#### Get User Attendance
- **GET** `/api/attendance/user/:userId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` (**Requires auth token**)
- **Query Parameters:**
  - `startDate` (optional): Start date filter (YYYY-MM-DD)
  - `endDate` (optional): End date filter (YYYY-MM-DD)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "userId": "string (uuid)",
      "sessionId": "string (uuid)",
      "present": "boolean",
      "createdAt": "DateTime",
      "session": {
        "id": "string (uuid)",
        "name": "string",
        "type": "LECTURE | PRACTICE | CONTEST | WORKSHOP | OTHER",
        "date": "DateTime",
        "startTime": "DateTime",
        "endTime": "DateTime"
      }
    }
  ]
}
```

#### Get Attendance Stats
- **GET** `/api/attendance/stats/:userId` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "totalDays": "number",
    "presentDays": "number",
    "absentDays": "number",
    "percentage": "number",
    "recentStreak": "number"
  }
}
```

#### Get Session Attendance
- **GET** `/api/attendance/session/:sessionId` (**Requires auth token, admin only**)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "userId": "string (uuid)",
      "sessionId": "string (uuid)",
      "present": "boolean",
      "createdAt": "DateTime",
      "user": {
        "id": "string (uuid)",
        "username": "string",
        "email": "string"
      }
    }
  ]
}
```

---

### Sessions (`/api/sessions`)

> **All endpoints below require authentication.**

#### Create Session
- **POST** `/api/sessions` (**Requires auth token, admin only**)
- **Body:**
```json
{
  "name": "string",
  "type": "LECTURE | PRACTICE | CONTEST | WORKSHOP | OTHER",
  "date": "string (ISO datetime)",
  "startTime": "string (ISO datetime)",
  "endTime": "string (ISO datetime)",
  "instructor": "string (optional)",
  "description": "string (optional)",
  "location": "string (optional)",
  "capacity": "number (optional, positive integer)"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "name": "string",
    "type": "LECTURE | PRACTICE | CONTEST | WORKSHOP | OTHER",
    "date": "DateTime",
    "startTime": "DateTime",
    "endTime": "DateTime",
    "instructor": "string | null",
    "description": "string | null",
    "location": "string | null",
    "capacity": "number | null",
    "createdBy": "string (uuid)",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
}
```

#### Get Sessions
- **GET** `/api/sessions?page=1&limit=20&type=LECTURE&date=YYYY-MM-DD&upcoming=true` (**Requires auth token**)
- **Query Parameters:**
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
  - `type` (optional): Filter by session type
  - `date` (optional): Filter by date (YYYY-MM-DD)
  - `upcoming` (optional): Filter upcoming sessions only
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "name": "string",
      "type": "LECTURE | PRACTICE | CONTEST | WORKSHOP | OTHER",
      "date": "DateTime",
      "startTime": "DateTime",
      "endTime": "DateTime",
      "instructor": "string | null",
      "description": "string | null",
      "location": "string | null",
      "capacity": "number | null",
      "createdBy": "string (uuid)",
      "createdAt": "DateTime",
      "updatedAt": "DateTime",
      "attendances": [
        {
          "userId": "string (uuid)",
          "present": "boolean"
        }
      ]
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

#### Get Session by ID
- **GET** `/api/sessions/:id` (**Requires auth token**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "name": "string",
    "type": "LECTURE | PRACTICE | CONTEST | WORKSHOP | OTHER",
    "date": "DateTime",
    "startTime": "DateTime",
    "endTime": "DateTime",
    "instructor": "string | null",
    "description": "string | null",
    "location": "string | null",
    "capacity": "number | null",
    "createdBy": "string (uuid)",
    "createdAt": "DateTime",
    "updatedAt": "DateTime",
    "attendances": [
      {
        "id": "string (uuid)",
        "userId": "string (uuid)",
        "sessionId": "string (uuid)",
        "present": "boolean",
        "createdAt": "DateTime",
        "user": {
          "id": "string (uuid)",
          "username": "string",
          "profilePicture": "string | null"
        }
      }
    ]
  }
}
```

#### Update Session
- **PUT** `/api/sessions/:id` (**Requires auth token, admin only**)
- **Body:** (all fields optional)
```json
{
  "name": "string",
  "type": "LECTURE | PRACTICE | CONTEST | WORKSHOP | OTHER",
  "date": "string (ISO datetime)",
  "startTime": "string (ISO datetime)",
  "endTime": "string (ISO datetime)",
  "instructor": "string",
  "description": "string",
  "location": "string",
  "capacity": "number (positive integer)"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "name": "string",
    "type": "LECTURE | PRACTICE | CONTEST | WORKSHOP | OTHER",
    "date": "DateTime",
    "startTime": "DateTime",
    "endTime": "DateTime",
    "instructor": "string | null",
    "description": "string | null",
    "location": "string | null",
    "capacity": "number | null",
    "createdBy": "string (uuid)",
    "createdAt": "DateTime",
    "updatedAt"



### Activity (`/api/activity`)

> **All endpoints below require authentication unless otherwise noted.**

#### Start Activity Session
- **POST** `/api/activity/start` (**Requires auth token**)
- **Body:**
```json
{
  "userId": "string (uuid)"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "userId": "string (uuid)",
    "startedAt": "DateTime",
    "endedAt": "DateTime | null",
    "lastPingAt": "DateTime",
    "totalMinutes": 0,
    "createdAt": "DateTime"
  }
}
```

#### Ping Activity Session
- **POST** `/api/activity/ping` (**Requires auth token**)
- **Body:**
```json
{
  "userId": "string (uuid)"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "ok": true
  }
}
```

#### End Activity Session
- **POST** `/api/activity/end` (**Requires auth token**)
- **Body:**
```json
{
  "userId": "string (uuid)"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string (uuid)",
    "userId": "string (uuid)",
    "startedAt": "DateTime",
    "endedAt": "DateTime",
    "lastPingAt": "DateTime",
    "totalMinutes": "number",
    "createdAt": "DateTime"
  }
}
```

#### Get User Time Logs (Admin only)
- **GET** `/api/activity/minutes/:userId?from=DATE&to=DATE` (**Requires auth token, admin only**)
- **Query Parameters:**
  - `from` (optional): Start date filter
  - `to` (optional): End date filter
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "minutes": "number"
  }
}
```

---

### GitHub (`/api/github`)

> **All endpoints below require authentication.**

#### Connect GitHub Account
- **POST** `/api/github/connect` (**Requires auth token**)
- **Body:**
```json
{
  "token": "string (GitHub Personal Access Token, min 10 chars)",
  "repo": "string (optional, default: cs-hub-solutions)"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "GitHub account connected successfully",
  "data": {
    "repo": "string (full repo name: owner/repo)",
    "owner": "string"
  }
}
```

---

### Admin Analytics (`/api/admin`)

> **All endpoints below require authentication and admin privileges.**

#### System Overview
- **GET** `/api/admin/overview` (**Requires auth token, admin only**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "users": "number",
    "problems": "number",
    "submissions": "number",
    "contests": "number",
    "sessions": "number",
    "attendance": "number",
    "notifications": "number",
    "achievements": "number",
    "userAchievements": "number"
  }
}
```

#### User Growth
- **GET** `/api/admin/users/growth?from=DATE&to=DATE&bucket=day|month` (**Requires auth token, admin only**)
- **Query Parameters:**
  - `from` (optional): Start date filter
  - `to` (optional): End date filter
  - `bucket` (optional, default: day): Time bucket (`day`, `month`)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "bucket": "day | month",
    "points": [
      {
        "key": "string (date key: YYYY-MM-DD or YYYY-MM)",
        "count": "number"
      }
    ]
  }
}
```

#### Engagement
- **GET** `/api/admin/engagement?from=DATE&to=DATE` (**Requires auth token, admin only**)
- **Query Parameters:**
  - `from` (optional): Start date filter
  - `to` (optional): End date filter
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "activeUsers": "number",
    "bySource": {
      "submissions": "number",
      "contests": "number",
      "attendance": "number"
    },
    "time": "number"
  }
}
```

#### Attendance Analytics
- **GET** `/api/admin/attendance/stats?from=DATE&to=DATE` (**Requires auth token, admin only**)
- **Query Parameters:**
  - `from` (optional): Start date filter
  - `to` (optional): End date filter
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "type": "LECTURE | PRACTICE | CONTEST | WORKSHOP | OTHER",
        "total": "number",
        "present": "number",
        "percentage": "number"
      }
    ]
  }
}
```

#### Notifications Usage
- **GET** `/api/admin/notifications/usage?from=DATE&to=DATE` (**Requires auth token, admin only**)
- **Query Parameters:**
  - `from` (optional): Start date filter
  - `to` (optional): End date filter
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "total": "number",
    "read": "number",
    "unread": "number",
    "readRate": "number"
  }
}
```

#### Achievements Stats
- **GET** `/api/admin/achievements/stats` (**Requires auth token, admin only**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "achievementsTotal": "number",
    "unlockedTotal": "number",
    "byAchievement": [
      {
        "achievementId": "string (uuid)",
        "_count": {
          "_all": "number"
        }
      }
    ]
  }
}
```

#### Contest Participation
- **GET** `/api/admin/contests/:contestId/participation` (**Requires auth token, admin only**)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "total": "number",
    "avgRank": "number"
  }
}
```

#### Submissions Stats
- **GET** `/api/admin/submissions/stats?from=DATE&to=DATE` (**Requires auth token, admin only**)
- **Query Parameters:**
  - `from` (optional): Start date filter
  - `to` (optional): End date filter
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "total": "number",
    "uniqueUsers": "number",
    "daily": [
      {
        "key": "string (YYYY-MM-DD)",
        "count": "number"
      }
    ]
  }
}
```

#### Usage Time Stats
- **GET** `/api/admin/usage/time?from=DATE&to=DATE` (**Requires auth token, admin only**)
- **Query Parameters:**
  - `from` (optional): Start date filter
  - `to` (optional): End date filter
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "overall": "number (total minutes)",
    "average": "number (average minutes per user)",
    "users": [
      {
        "userId": "string (uuid)",
        "minutes": "number"
      }
    ]
  }
}
```

---

## Response Format

All endpoints return a standard response format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "string (optional)"
}
```

### Error Response
```json
{
  "success": false,
  "error": "string"
}
```

### Paginated Response
For endpoints that return paginated data:
```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

---

## HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource not found)
- `409` - Conflict (Resource already exists)
- `500` - Internal Server Error

---

## Notes

- All datetime fields are returned in ISO 8601 format (e.g., `2025-12-25T10:00:00.000Z`)
- UUIDs are used for all ID fields
- Pagination defaults: `page=1`, `limit=20`
- Rate limiting applies to authentication endpoints
- Some endpoints require specific roles (ADMIN, INSTRUCTOR) as noted


