# StudentHub - Getting Started Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Setup Instructions

#### 1. **Backend Setup**

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/studenthub?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-here-change-in-production
PORT=5000
CLIENT_URL=http://localhost:5173
```

Generate Prisma client:

```bash
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

#### 2. **Frontend Setup**

```bash
cd client
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 📁 Project Structure

### Backend (`server/`)

```
src/
├── controllers/       # Business logic
│   ├── authControllers.js
│   ├── courseController.js
│   └── userController.js
├── routes/           # API endpoints
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   └── userRoutes.js
├── middleware/       # Express middleware
│   └── authMiddleware.js
├── utils/           # Utility functions
│   └── prisma.js
└── index.js         # Entry point

prisma/
└── schema.prisma    # Database schema
```

### Frontend (`client/`)

```
src/
├── components/      # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── FormContainer.jsx
│   ├── LoadingSpinner.jsx
│   ├── Card.jsx
│   ├── Navbar.jsx
│   ├── ProtectedRoutes.jsx
│   └── Sidebar.jsx
├── pages/          # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── RoleSelect.jsx
│   ├── Dashboard.jsx
│   └── AddCourse.jsx
├── contexts/       # React Context
│   └── AuthContext.jsx
├── api/           # API integration
│   └── axios.js
├── styles/        # CSS files
│   └── global.css
├── App.jsx        # Main app component
└── main.jsx       # Entry point
```

---

## 🗄️ Database Models

### User
- `id`: MongoDB ObjectId
- `name`: String
- `username`: String (unique)
- `email`: String (unique)
- `password`: String (hashed)
- `role`: STUDENT | TEACHER
- `bio`: String (optional)
- `avatar`: String (optional)
- `phone`: String (optional)
- Timestamps

### Course
- `id`: MongoDB ObjectId
- `title`: String
- `description`: String (optional)
- `link`: String
- `category`: String
- `difficulty`: BEGINNER | INTERMEDIATE | ADVANCED
- `thumbnail`: String (optional)
- `teacherId`: Reference to User
- `views`: Number
- Timestamps

### Enrollment
- `id`: MongoDB ObjectId
- `studentId`: Reference to User
- `courseId`: Reference to Course
- `bookmarked`: Boolean
- `enrolledAt`: DateTime

### Progress
- `id`: MongoDB ObjectId
- `studentId`: Reference to User
- `courseId`: Reference to Course
- `completionPercentage`: Number
- `lessonsCompleted`: Number
- `lastAccessedAt`: DateTime

### Review
- `id`: MongoDB ObjectId
- `rating`: Number (1-5)
- `comment`: String (optional)
- `studentId`: Reference to User
- `courseId`: Reference to Course
- Timestamps

### Reward
- `id`: MongoDB ObjectId
- `userId`: Reference to User
- `type`: BADGE | COUPON | POINTS
- `badge`: String (optional)
- `coupon`: String (optional)
- `points`: Number
- `earnedAt`: DateTime

### Notification
- `id`: MongoDB ObjectId
- `userId`: Reference to User
- `message`: String
- `type`: ENROLLMENT | REVIEW | COURSE_PUBLISHED | ACHIEVEMENT
- `read`: Boolean
- `createdAt`: DateTime

---

## 🔐 Authentication Flow

1. **User Signup**
   - POST `/api/auth/signup`
   - Body: `{ name, username, email, password }`
   - Returns: User object

2. **User Login**
   - POST `/api/auth/login`
   - Body: `{ email, password }`
   - Returns: `{ token }`
   - Token stored in localStorage

3. **Role Selection**
   - PATCH `/api/user/role`
   - Body: `{ role: "STUDENT" | "TEACHER" }`
   - Requires: JWT token in Authorization header

---

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### User Management
- `GET /api/user/profile` - Get user profile (protected)
- `PATCH /api/user/role` - Set user role (protected)
- `PATCH /api/user/profile` - Update profile (protected)

### Courses
- `GET /api/course` - Get all courses
- `GET /api/course/:id` - Get course details
- `POST /api/course` - Create course (protected)
- `GET /api/course/teacher/courses` - Get teacher's courses (protected)
- `PATCH /api/course/:id` - Update course (protected)
- `DELETE /api/course/:id` - Delete course (protected)

---

## 🎨 UI Components

### Button
Props: `variant`, `size`, `disabled`, `loading`, `onClick`

```jsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

### Input
Props: `label`, `type`, `error`, `required`, `icon`, `onChange`

```jsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  onChange={handleChange}
/>
```

### FormContainer
Props: `title`, `subtitle`, `onSubmit`

```jsx
<FormContainer title="Login" subtitle="Welcome back">
  {/* Form content */}
</FormContainer>
```

---

## 📝 Common Development Tasks

### Add a New Endpoint

1. Create controller function in `controllers/`
2. Add route in `routes/`
3. Include route in `index.js`

### Add a New Page

1. Create component in `pages/`
2. Add route in `App.jsx`
3. Wrap with `<ProtectedRoutes>` if needed

### Add a New Component

1. Create component in `components/`
2. Export from component file
3. Import and use in pages

---

## 🚨 Troubleshooting

### CORS Error
- Ensure backend has CORS enabled
- Check `CLIENT_URL` in backend `.env`

### Database Connection Error
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas
- Ensure `.env` variables are set

### Token Expiration
- Tokens expire after 7 days
- User needs to login again after expiration

### 404 on Course Route
- Ensure course ID is correct
- Use MongoDB ObjectId format

---

## 🔄 Development Workflow

1. Start backend: `npm run dev` (in `server/`)
2. Start frontend: `npm run dev` (in `client/`)
3. Make changes and test
4. Check browser console for errors
5. Check backend terminal for server errors

---

## 📦 Environment Variables

### Backend (.env)
```env
DATABASE_URL=           # MongoDB Atlas connection
JWT_SECRET=             # Secret for JWT signing
PORT=5000              # Backend port
CLIENT_URL=            # Frontend URL
```

### Frontend
No `.env` needed - API URL is configured in `api/axios.js`

---

## 🎯 Next Steps

1. ✅ Database schema created
2. ✅ Authentication setup
3. ✅ UI components built
4. 🔄 **NEXT**: Create Dashboard pages
5. 🔄 **NEXT**: Implement course management
6. 🔄 **NEXT**: Add enrollment system
7. 🔄 **NEXT**: Build analytics
8. 🔄 **NEXT**: Deploy to production

---

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)

---

**Happy coding! 🚀**
