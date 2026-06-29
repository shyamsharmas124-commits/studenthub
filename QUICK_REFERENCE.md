# StudentHub - Quick Reference Guide

## 🚀 Quick Start (30 seconds)

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev

# Visit http://localhost:5173
```

---

## 📁 File Structure Quick Lookup

| What | Where |
|------|-------|
| API Endpoints | `server/src/routes/` |
| Business Logic | `server/src/controllers/` |
| Database Schema | `server/prisma/schema.prisma` |
| Auth State | `client/src/contexts/AuthContext.jsx` |
| Pages | `client/src/pages/` |
| UI Components | `client/src/components/` |
| API Config | `client/src/api/axios.js` |

---

## 🔧 Common Commands

### Backend
```bash
npm run dev              # Start dev server
npm install             # Install dependencies
npx prisma generate     # Generate Prisma client
npx prisma studio      # Open Prisma Studio (GUI)
npx prisma db seed     # Seed database
```

### Frontend
```bash
npm run dev            # Start dev server
npm run build          # Build for production
npm run lint           # Run ESLint
npm run preview        # Preview production build
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend
No `.env` needed (API URL is in `axios.js`)

---

## 🌐 API Endpoints at a Glance

```
POST   /api/auth/signup              Create account
POST   /api/auth/login               Login & get token

GET    /api/user/profile             Get profile (protected)
PATCH  /api/user/role                Set role (protected)
PATCH  /api/user/profile             Update profile (protected)

GET    /api/course                   Get all courses
GET    /api/course/:id               Get course details
POST   /api/course                   Create course (protected)
GET    /api/course/teacher/courses   Get my courses (protected)
PATCH  /api/course/:id               Update course (protected)
DELETE /api/course/:id               Delete course (protected)
```

---

## 📝 Component Usage

### Button
```jsx
<Button 
  variant="primary"        // primary, secondary, danger, outline
  size="lg"               // sm, md, lg
  onClick={handleClick}
  loading={isLoading}
  disabled={false}
>
  Click Me
</Button>
```

### Input
```jsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  value={formData.email}
  onChange={handleChange}
  error={errors.email}
  required
  icon={Mail}           // Lucide icon
/>
```

### FormContainer
```jsx
<FormContainer
  title="Login"
  subtitle="Welcome back"
  onSubmit={handleSubmit}
>
  {/* Your form fields */}
</FormContainer>
```

---

## 🔐 Authentication Flow

### 1. Get Auth Context
```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, token, login, logout, isAuthenticated } = useAuth();
}
```

### 2. Check Authentication
```jsx
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

### 3. Make Protected Request
```jsx
// Token is automatically added to headers
const response = await axios.get('/api/user/profile');
```

---

## 🎨 Styling Classes (Tailwind)

### Common Tailwind Classes Used
```
Spacing: p-4, m-2, px-6, py-3
Colors: text-blue-600, bg-gradient-to-r
Sizing: w-full, h-screen, max-w-md
Layout: flex, grid, grid-cols-4
Shadows: shadow-lg, shadow-2xl
Rounded: rounded-lg, rounded-2xl
```

---

## ✅ Testing Quick Checklist

### Signup Test
```
1. Go to /signup
2. Fill all fields
3. Verify duplicate email error
4. Verify password mismatch error
5. Submit with valid data
6. Should redirect to /login
```

### Login Test
```
1. Go to /login
2. Enter wrong password → error
3. Enter correct credentials
4. Should redirect to /role
5. Select role
6. Should redirect to /dashboard
```

### API Test (cURL)
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","username":"john","email":"john@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Get Courses (with token)
curl -X GET http://localhost:5000/api/course \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🐛 Debugging Tips

### Frontend Debugging
```jsx
// Log auth state
console.log('Auth Context:', useAuth());

// Check localStorage
console.log('Token:', localStorage.getItem('token'));

// Check network requests
// Open DevTools → Network tab
```

### Backend Debugging
```javascript
// Log inside controllers
console.log("DEBUG:", req.body);
console.log("ERROR:", err);

// Check database directly
// Use Prisma Studio: npx prisma studio
```

### MongoDB Atlas
- Check collections: mongoDB Atlas dashboard
- View data: Collections tab
- Create indexes: Indexes tab

---

## 🔄 Workflow for Adding Features

### To Add New Endpoint:
1. Create controller function in `server/src/controllers/`
2. Add route in `server/src/routes/`
3. Import route in `server/src/index.js`
4. Test with cURL/Postman
5. Use in frontend

### To Add New Page:
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.jsx`
3. Add navigation link
4. Wrap with `<ProtectedRoutes>` if needed
5. Import required components

### To Add New Component:
1. Create file in `client/src/components/`
2. Build component with props
3. Export as named export
4. Import and use in pages
5. Document props

---

## 📊 Database Relationships

```
User (1) ──→ (Many) Course
User (1) ──→ (Many) Enrollment
User (1) ──→ (Many) Progress
User (1) ──→ (Many) Review

Course (1) ──→ (Many) Enrollment
Course (1) ──→ (Many) Progress
Course (1) ──→ (Many) Review

Enrollment (1) ──→ (1) User
Enrollment (1) ──→ (1) Course
```

---

## 🎯 Phase 2 Tasks

Priority order for next development:

1. Create Student Dashboard
2. Create Teacher Dashboard
3. Build Course Listing Page
4. Build Course Details Page
5. Add Enrollment Feature
6. Add Review System

See [CHECKLIST.md](./CHECKLIST.md) for full Phase 2 checklist.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Project overview |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Setup guide |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Full API reference |
| [CHECKLIST.md](./CHECKLIST.md) | Development progress |
| [PHASE_1_REPORT.md](./PHASE_1_REPORT.md) | Phase 1 completion |

---

## 🆘 When Something Breaks

### "Module not found" error
```bash
npm install
npx prisma generate
```

### "Cannot connect to MongoDB"
- Check DATABASE_URL in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure database is created

### "Port already in use"
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# or change PORT in .env
```

### "CORS error"
- Check CLIENT_URL in .env
- Ensure cors() middleware in index.js

### "Token expired"
- Clear localStorage
- Re-login
- Token expires after 7 days

---

## 💡 Pro Tips

1. **Use Prisma Studio**: `npx prisma studio` for GUI database exploration
2. **Keep console open**: Helps catch errors early
3. **Test API first**: Before building UI for it
4. **Commit frequently**: Easier to rollback if needed
5. **Read error messages**: They're usually helpful!

---

## 🚀 Next Steps

1. ✅ Read this file
2. ✅ Start servers with Quick Start commands
3. ✅ Create test account at /signup
4. 📖 Read [GETTING_STARTED.md](./GETTING_STARTED.md) for deeper understanding
5. 🎯 Follow [CHECKLIST.md](./CHECKLIST.md) for Phase 2 tasks

---

**Happy Coding! 🎉**

For detailed information, check the full documentation files.
