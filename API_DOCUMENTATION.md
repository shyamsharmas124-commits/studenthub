# StudentHub - API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Signup

Creates a new user account.

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "role": null,
  "bio": null,
  "avatar": null,
  "phone": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `400 Bad Request` - Missing required fields or validation error
- `500 Internal Server Error` - Database error

---

### 2. Login

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400 Bad Request` - User not found or invalid password
- `500 Internal Server Error` - Database error

---

## User Endpoints

### 1. Get User Profile

Fetches the authenticated user's profile.

**Endpoint:** `GET /user/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "bio": "Passionate learner",
  "avatar": "https://...",
  "phone": "+1234567890",
  "role": "STUDENT",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `401 Unauthorized` - No token or invalid token
- `404 Not Found` - User not found

---

### 2. Set User Role

Sets the role for the authenticated user.

**Endpoint:** `PATCH /user/role`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "STUDENT"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "role": "STUDENT",
  ...
}
```

**Errors:**
- `400 Bad Request` - Invalid role
- `401 Unauthorized` - No token or invalid token
- `500 Internal Server Error` - Database error

---

### 3. Update User Profile

Updates the authenticated user's profile information.

**Endpoint:** `PATCH /user/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe2",
  "bio": "Updated bio",
  "avatar": "https://...",
  "phone": "+1234567890"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "username": "johndoe2",
  ...
}
```

**Errors:**
- `400 Bad Request` - Username already taken
- `401 Unauthorized` - No token or invalid token
- `500 Internal Server Error` - Database error

---

## Course Endpoints

### 1. Get All Courses

Fetches all courses with optional filtering.

**Endpoint:** `GET /course`

**Query Parameters:**
- `category` (optional) - Filter by category
- `difficulty` (optional) - Filter by difficulty (BEGINNER, INTERMEDIATE, ADVANCED)

**Example:**
```
GET /course?category=Web Development&difficulty=BEGINNER
```

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "title": "React Basics",
    "description": "Learn React from scratch",
    "link": "https://youtube.com/...",
    "category": "Web Development",
    "difficulty": "BEGINNER",
    "thumbnail": "https://...",
    "views": 150,
    "teacherId": "507f1f77bcf86cd799439011",
    "teacher": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "username": "johndoe",
      "avatar": "https://...",
      "bio": "Passionate learner"
    },
    "_count": {
      "enrollments": 25,
      "reviews": 5
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

**Errors:**
- `500 Internal Server Error` - Database error

---

### 2. Get Course by ID

Fetches a specific course with full details and reviews.

**Endpoint:** `GET /course/:id`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "title": "React Basics",
  "description": "Learn React from scratch",
  "link": "https://youtube.com/...",
  "category": "Web Development",
  "difficulty": "BEGINNER",
  "thumbnail": "https://...",
  "views": 150,
  "teacher": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe",
    "avatar": "https://...",
    "bio": "Passionate learner"
  },
  "reviews": [
    {
      "id": "507f1f77bcf86cd799439013",
      "rating": 5,
      "comment": "Great course!",
      "student": {
        "id": "507f1f77bcf86cd799439014",
        "name": "Jane Smith",
        "avatar": "https://..."
      },
      "createdAt": "2024-01-20T15:45:00Z"
    }
  ],
  "enrollments": [
    {
      "studentId": "507f1f77bcf86cd799439015"
    }
  ]
}
```

**Errors:**
- `404 Not Found` - Course not found
- `500 Internal Server Error` - Database error

---

### 3. Create Course

Creates a new course (teacher only).

**Endpoint:** `POST /course`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "React Basics",
  "description": "Learn React from scratch",
  "link": "https://youtube.com/...",
  "category": "Web Development",
  "difficulty": "BEGINNER",
  "thumbnail": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "title": "React Basics",
  "description": "Learn React from scratch",
  "link": "https://youtube.com/...",
  "category": "Web Development",
  "difficulty": "BEGINNER",
  "thumbnail": "https://...",
  "teacherId": "507f1f77bcf86cd799439011",
  "views": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - No token or invalid token
- `500 Internal Server Error` - Database error

---

### 4. Get Teacher's Courses

Fetches all courses created by the authenticated teacher.

**Endpoint:** `GET /course/teacher/courses`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "title": "React Basics",
    ...
  }
]
```

**Errors:**
- `401 Unauthorized` - No token or invalid token
- `500 Internal Server Error` - Database error

---

### 5. Update Course

Updates an existing course (teacher only).

**Endpoint:** `PATCH /course/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "difficulty": "INTERMEDIATE"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "title": "Updated Title",
  ...
}
```

**Errors:**
- `403 Forbidden` - Not authorized to update this course
- `404 Not Found` - Course not found
- `401 Unauthorized` - No token or invalid token
- `500 Internal Server Error` - Database error

---

### 6. Delete Course

Deletes a course (teacher only).

**Endpoint:** `DELETE /course/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "msg": "Course deleted successfully"
}
```

**Errors:**
- `403 Forbidden` - Not authorized to delete this course
- `404 Not Found` - Course not found
- `401 Unauthorized` - No token or invalid token
- `500 Internal Server Error` - Database error

---

## Data Types

### Role
```
"STUDENT" | "TEACHER"
```

### Difficulty
```
"BEGINNER" | "INTERMEDIATE" | "ADVANCED"
```

### RewardType
```
"BADGE" | "COUPON" | "POINTS"
```

### NotificationType
```
"ENROLLMENT" | "REVIEW" | "COURSE_PUBLISHED" | "ACHIEVEMENT"
```

---

## Error Responses

All error responses follow this format:

```json
{
  "msg": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Not authorized for this action |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

Currently not implemented. Will be added in production.

---

## Versioning

Current API version: `v1`

Future endpoints will be prefixed with `/api/v2`, `/api/v3`, etc.

---

## WebSocket Support

Real-time notifications and updates will be added in Phase 3.

---

## Pagination

Will be added to GET endpoints returning large result sets in Phase 2.

---

## Testing the API

### Using cURL

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Courses
curl -X GET http://localhost:5000/api/course
```

### Using Postman

1. Create a new collection
2. Add requests for each endpoint
3. Use the Bearer token in the Authorization header
4. Test with sample data

---

## Support

For issues or questions about the API, please open an issue on GitHub or contact the development team.
