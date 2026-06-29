# 🎓 StudentHub - A Platform by Students, for Students

<div align="center">

![StudentHub](https://img.shields.io/badge/StudentHub-v1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-v16+-green)
![React](https://img.shields.io/badge/React-v19+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v5+-green)

**Learn. Teach. Grow.**

[🚀 Get Started](#-quick-start) • [📖 Documentation](#-documentation) • [🛠️ Tech Stack](#-tech-stack) • [🤝 Contributing](#-contributing)

</div>

---

## 📋 Project Overview

**StudentHub** is an innovative student-exclusive learning platform inspired by Udemy. Unlike traditional platforms, StudentHub doesn't host original content. Instead, students curate and share free educational resources from YouTube, documentation sites, blogs, and open educational platforms.

### Core Mission

Create a platform where:
- ✅ Students learn from curated free resources
- ✅ Students can become teachers and share knowledge
- ✅ Learning progress is tracked and visualized
- ✅ Teachers receive analytics and recognition
- ✅ Students receive personalized recommendations and quizzes
- ✅ Active contributors are rewarded with badges, coupons, and recognition

---

## 🎯 Key Features

### 👥 Dual Role System
- **Student**: Browse, learn, bookmark, review, and track progress
- **Teacher**: Create courses, manage resources, view analytics

### 📚 Course Management
- Create and manage course entries
- Share external learning links
- Categorize courses (Web Dev, Programming, Data Science, AI & ML)
- Add descriptions and difficulty levels
- Track course views and engagement

### 📊 Analytics & Progress
- Weekly learning progress tracking
- Lessons completed counter
- Learning streaks
- Completion statistics
- Teacher engagement metrics

### 🏆 Rewards System
- Achievement badges
- Contribution points
- Sponsored coupon distribution
- Teacher ranking leaderboard

### 🔍 Discovery Features
- Search courses by keyword
- Filter by category and difficulty
- Trending courses
- Personalized recommendations

### 💬 Community Features
- Course reviews and ratings
- Student engagement
- Personalized quizzes
- Notifications

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router DOM** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Framework
- **Prisma ORM** - Database ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Database
- **MongoDB Atlas** - Cloud database

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway / Render
- **Database**: MongoDB Atlas

---

## 📁 Project Structure

```
studenthub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React Context (Auth)
│   │   ├── api/           # Axios configuration
│   │   ├── styles/        # CSS files
│   │   ├── App.jsx        # Main component
│   │   └── main.jsx       # Entry point
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utilities
│   │   └── index.js       # Entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── .env               # Environment variables
│   └── package.json
│
├── GETTING_STARTED.md     # Setup guide
├── API_DOCUMENTATION.md   # API reference
└── README.md             # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/studenthub.git
cd studenthub
```

2. **Setup Backend**
```bash
cd server
npm install

# Create .env file with your MongoDB URI
echo "DATABASE_URL=your_mongodb_uri" > .env
echo "JWT_SECRET=your-secret-key" >> .env
echo "PORT=5000" >> .env

# Start backend
npm run dev
```

3. **Setup Frontend**
```bash
cd client
npm install

# Start frontend
npm run dev
```

4. **Visit the app**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

For detailed setup, see [GETTING_STARTED.md](./GETTING_STARTED.md)

---

## 📖 Documentation

- **[Getting Started Guide](./GETTING_STARTED.md)** - Complete setup instructions
- **[API Documentation](./API_DOCUMENTATION.md)** - Full API reference with examples
- **[Database Schema](./server/prisma/schema.prisma)** - Prisma schema

---

## 🗄️ Database Models

| Model | Purpose |
|-------|---------|
| **User** | Student/Teacher profiles |
| **Course** | Learning resources |
| **Enrollment** | Student course enrollment |
| **Progress** | Learning progress tracking |
| **Review** | Course reviews and ratings |
| **Quiz** | Interactive quizzes |
| **Reward** | Badges, coupons, points |
| **Notification** | User notifications |

---

## 🔐 Authentication

### Signup Flow
1. User creates account with name, username, email, password
2. Password is hashed with bcrypt
3. User is created in database

### Login Flow
1. User enters email and password
2. Password verified with bcrypt
3. JWT token generated (7-day expiration)
4. Token stored in localStorage
5. Token sent with all authenticated requests

### Role Selection
1. After login, user selects STUDENT or TEACHER role
2. Role can be changed anytime from profile settings

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Users
- `GET /api/user/profile` - Get profile (protected)
- `PATCH /api/user/role` - Set role (protected)
- `PATCH /api/user/profile` - Update profile (protected)

### Courses
- `GET /api/course` - Get all courses
- `GET /api/course/:id` - Get course details
- `POST /api/course` - Create course (protected)
- `GET /api/course/teacher/courses` - Teacher's courses (protected)
- `PATCH /api/course/:id` - Update course (protected)
- `DELETE /api/course/:id` - Delete course (protected)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full details.

---

## 🎨 UI/UX Features

- ✨ **Modern Design** - Clean, minimal aesthetic inspired by Udemy, Coursera, and Notion
- 📱 **Responsive** - Mobile-first approach
- 🎯 **User-Friendly** - Intuitive navigation and forms
- ⚡ **Smooth Animations** - Framer Motion for polished interactions
- 🌓 **Dark/Light Mode** - Theme support (planned for Phase 3)
- ♿ **Accessible** - WCAG compliant forms and buttons

---

## 🛣️ Development Roadmap

### ✅ Phase 1: Foundation
- [x] Project setup and configuration
- [x] Database schema design
- [x] Authentication system
- [x] UI component library
- [x] Basic routing

### 🔄 Phase 2: Core Features (Current)
- [ ] Role selection page
- [ ] User profile management
- [ ] Course creation interface
- [ ] Student dashboard
- [ ] Teacher dashboard

### 📅 Phase 3: Engagement
- [ ] Progress tracking system
- [ ] Review and rating system
- [ ] Notification system
- [ ] Student dashboards

### 🧠 Phase 4: Intelligence
- [ ] Personalized quizzes
- [ ] ML-based recommendations
- [ ] Analytics dashboard
- [ ] User behavior tracking

### 🚀 Phase 5: Deployment
- [ ] Frontend deployment (Vercel)
- [ ] Backend deployment (Railway)
- [ ] Database optimization
- [ ] CI/CD pipeline

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests (to be added)
cd server
npm test

# Frontend tests (to be added)
cd client
npm test
```

### Manual Testing

1. Create account at `/signup`
2. Login at `/login`
3. Select role at `/role`
4. Explore dashboard at `/dashboard`
5. Create course at `/add-course` (teacher only)

---

## 🐛 Troubleshooting

### CORS Error
- Check backend `.env` for `CLIENT_URL`
- Ensure CORS is enabled in Express

### MongoDB Connection Error
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure database is created

### Token Issues
- Check token expiration (7 days)
- Clear localStorage and re-login
- Verify JWT_SECRET is consistent

See [GETTING_STARTED.md](./GETTING_STARTED.md#-troubleshooting) for more solutions.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Use consistent naming conventions
- Add comments for complex logic
- Follow the existing code style
- Test before submitting PR

---

## 📝 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) file for details.

---

## 👥 Team

- **Project Lead**: [Your Name]
- **Frontend Developer**: [Name]
- **Backend Developer**: [Name]
- **Database Manager**: [Name]

---

## 💬 Community

- **GitHub Issues** - Report bugs or request features
- **Discussions** - General questions and ideas
- **Email** - studenthub@example.com

---

## 🙏 Acknowledgments

- Inspiration from Udemy, Coursera, and Notion
- Icons from Lucide React
- UI components inspired by modern SaaS platforms
- Special thanks to all contributors

---

## 📱 Social Media

- Twitter: [@StudentHub](https://twitter.com/studenthub)
- LinkedIn: [StudentHub](https://linkedin.com/company/studenthub)
- Discord: [Join our server](https://discord.gg/studenthub)

---

<div align="center">

**Made with ❤️ by students, for students**

[⬆ back to top](#-studenthub---a-platform-by-students-for-students)

</div>
