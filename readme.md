# 🎓 StudentHub - A Platform by Students, for Students

<div align="center">

![StudentHub](https://img.shields.io/badge/StudentHub-v1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-v16+-green)
![React](https://img.shields.io/badge/React-v19+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v5+-green)
![Redis](https://img.shields.io/badge/Redis-Cache-red)

**Learn. Teach. Grow.**

[🚀 Get Started](#-quick-start) • [📖 Documentation](#-documentation) • [🛠️ Tech Stack](#-tech-stack) • [🏗️ Architecture](#-architecture-overview) • [🚢 Deployment](#-deployment)

</div>

---

## 📋 Project Overview

**StudentHub** is an innovative student-exclusive learning platform inspired by Udemy. Students curate and share free educational resources from YouTube, documentation sites, blogs, and open educational platforms.

### Core Mission

Create a platform where:
- ✅ Students learn from curated free resources
- ✅ Students can become teachers and share knowledge
- ✅ Learning progress is tracked and visualized
- ✅ Active contributors are rewarded with badges, coupons, and recognition

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

### Databases & Caching
- **MongoDB** - Cloud database (Atlas)
- **Redis** - Caching for improved performance

---

## 🏗️ Architecture Overview

StudentHub follows a modern client-server architecture with separation of concerns:

- **Client (Frontend)**: A Single Page Application (SPA) built with React and Vite, hosted on Vercel. It communicates with the backend via RESTful APIs.
- **Server (Backend)**: An Express.js REST API that handles business logic, authentication, and database operations.
- **Data Layer**: 
  - **MongoDB** managed via **Prisma ORM** for persistent storage of users, courses, and progress.
  - **Redis** is used as an in-memory cache to speed up frequent queries (like course listings) and manage rate-limiting or sessions.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (or local MongoDB)
- Redis instance (local or remote)
- Git
- Docker & Docker Compose (Optional, for Docker setup)

### Setup Instructions (Manual)

1. **Clone the repository**
```bash
git clone https://github.com/your-username/studenthub.git
cd studenthub
```

2. **Setup Backend**
```bash
cd server
npm install

# Create .env file
echo "DATABASE_URL=your_mongodb_uri" > .env
echo "REDIS_URL=your_redis_url" >> .env
echo "JWT_SECRET=your-secret-key" >> .env
echo "PORT=5000" >> .env

# Generate Prisma client
npx prisma generate

# Start backend
npm run dev
```

3. **Setup Frontend**
```bash
cd ../client
npm install

# Start frontend
npm run dev
```

4. **Visit the app**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Setup Instructions (Docker)

If you prefer using Docker to run the entire stack (including Redis and MongoDB), you can use the provided Docker configuration.

1. **Clone and navigate to the project root**
```bash
git clone https://github.com/your-username/studenthub.git
cd studenthub
```

2. **Configure Environment Variables**
Ensure you have `.env` files created in both `server/` and `client/` directories based on `.env.example` configurations.

3. **Run with Docker Compose**
```bash
docker-compose up --build
```
This will start the backend, frontend, MongoDB, and Redis containers automatically.

---

## 🚢 Deployment

### Deploying Backend to Render

1. Create a new Web Service on [Render](https://render.com/).
2. Connect your GitHub repository and select the `studenthub` repository.
3. Set the Root Directory to `server`.
4. Set the Build Command:
```bash
npm install && npx prisma generate
```
5. Set the Start Command:
```bash
npm start
```
6. Add your Environment Variables:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
   - `PORT` (Render uses its own port, usually setting it to 10000 or similar works)
7. Deploy the service.

### Deploying Frontend (e.g., to Vercel)
1. Import the project in Vercel.
2. Set the Root Directory to `client`.
3. Vercel will automatically detect the Vite framework and configure the build settings.
4. Add environment variables (like `VITE_API_URL` pointing to your Render backend).
5. Deploy.

---

## 📖 Documentation

- **[Getting Started Guide](./GETTING_STARTED.md)** - Complete setup instructions
- **[API Documentation](./API_DOCUMENTATION.md)** - Full API reference with examples
- **[Technical Requirements Document](./TRD.md)** - Known technical gaps and architecture

---

## 🤝 Contributing

We welcome contributions! Please read our contribution guidelines and follow the standard PR process.

## 📝 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) file for details.
