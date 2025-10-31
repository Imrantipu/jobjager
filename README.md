# JobJ�ger - AI-Powered Job Application Manager

> **A full-stack TypeScript application designed to streamline the job hunting process in Germany**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)

## 🎯 Overview

JobJäger is a comprehensive job application management system specifically designed for the German job market. It helps job seekers organize their applications, create tailored CVs, and generate professional German cover letters (Anschreiben) using AI technology.

### Problem Statement

Job hunting in Germany involves:
- Managing applications across multiple platforms
- Writing custom Anschreiben for each position
- Tailoring CVs for different roles
- Tracking application status and follow-ups

### Solution

A centralized platform that:
- Tracks all job applications with Kanban board visualization
- Builds and manages multiple CV versions
- Generates AI-powered German cover letters using Claude API
- Provides analytics and insights on application progress

## ✨ Features

### Core Functionality

#### 🔐 Authentication & Security
- JWT-based authentication with httpOnly cookies
- Password hashing using bcrypt
- Protected API routes
- Secure session management

#### 📊 Dashboard
- Real-time statistics across all modules
- Application status overview (Total, Applied, Interview, Offers)
- Quick access to all features
- Visual data representation

#### 💼 Application Tracker
- **List View**: Comprehensive table with filtering and search
- **Kanban Board**: Drag-and-drop interface across 5 status columns
  - To Apply → Applied → Interview → Offer → Rejected
- Status management with visual indicators
- Date tracking (applied, follow-up, interview)
- Notes and contact person management

#### 📄 CV Builder
- Multi-section CV management:
  - Personal Information (contact, social links, summary)
  - Work Experience (with multiple achievements per job)
  - Education (degrees, institutions, grades)
  - Skills (categorized with proficiency levels)
  - Languages (CEFR levels: A1-C2, Native)
- Multiple CV versions support
- Default CV designation
- CV duplication for variations
- Export ready (PDF integration planned)

#### ✍️ AI-Powered Anschreiben Generator
- **AI Generation**: Create professional German cover letters using Claude 3.5 Sonnet
- **AI Refinement**: Improve existing letters with specific instructions
- Template system for reusable letters
- Application linking
- Follows German business letter standards (formal "Sie" form)
- 300-400 word professional format

#### 💾 Jobs Management
- Save interesting job postings
- Track source platform and URLs
- Tech stack tagging
- Salary range tracking
- Company information

## 🛠 Tech Stack

### Frontend
- **React 19.1** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7.1** - Build tool & dev server
- **React Router 7.9** - Navigation
- **Zustand 5.0** - State management
- **TailwindCSS 4.1** - Styling
- **DaisyUI 5.3** - UI components
- **React Hook Form 7.65** - Form management
- **Zod 4.1** - Schema validation
- **Axios 1.12** - HTTP client
- **date-fns 4.1** - Date formatting

### Backend
- **Node.js 22.x** - Runtime environment
- **Express 5.1** - Web framework
- **TypeScript 5.9** - Type safety
- **PostgreSQL 16** - Database
- **Prisma 6.18** - ORM
- **JWT** - Authentication
- **Bcrypt 6.0** - Password hashing
- **Zod 4.1** - Validation
- **Anthropic Claude SDK** - AI integration
- **Jest 30.2** - Testing framework
- **Supertest 7.1** - API testing

## 🏗 Architecture

### System Design

```
┌─────────────┐         ┌──────────────┐         ┌───────────────┐
│             │         │              │         │               │
│   React     │◄────────┤   REST API   │◄────────┤  PostgreSQL   │
│   Frontend  │  HTTP   │   Express    │  Prisma │   Database    │
│             │         │              │         │               │
└─────────────┘         └──────────────┘         └───────────────┘
                               │
                               │
                               ▼
                        ┌──────────────┐
                        │              │
                        │  Claude API  │
                        │  (Anthropic) │
                        │              │
                        └──────────────┘
```

### Database Schema

```
Users ──┬── CVs
        ├── Jobs
        ├── Applications ──┬── Jobs
        │                  └── CVs
        ├── Anschreiben ───── Applications
        └── Companies
```

### API Endpoints (41 total)

- **Authentication**: 5 endpoints
- **Jobs**: 8 endpoints
- **Applications**: 9 endpoints
- **CVs**: 9 endpoints
- **Anschreiben**: 10 endpoints

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 22.x or higher
- **npm**: 10.x or higher
- **PostgreSQL**: 16.x or higher
- **Anthropic API Key**: For AI features ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jobjager.git
   cd jobjager
   ```

2. **Set up the database**
   ```bash
   # Create PostgreSQL database
   sudo -u postgres psql
   CREATE DATABASE jobjager;
   CREATE USER jobjager_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE jobjager TO jobjager_user;
   \q
   ```

3. **Configure Backend**
   ```bash
   cd backend
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   ```

   Example `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://jobjager_user:your_password@localhost:5432/jobjager"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ANTHROPIC_API_KEY=your-anthropic-api-key-here
   ```

4. **Run Database Migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Configure Frontend**
   ```bash
   cd ../frontend
   npm install

   # Create .env file
   cp .env.example .env
   ```

   Example `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

6. **Start Development Servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Jobs

```http
POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/:id
PUT    /api/jobs/:id
DELETE /api/jobs/:id
GET    /api/jobs/search?query=...
GET    /api/jobs/statistics
PATCH  /api/jobs/:id/save
```

### Applications

```http
POST   /api/applications
GET    /api/applications
GET    /api/applications/:id
PUT    /api/applications/:id
DELETE /api/applications/:id
PATCH  /api/applications/:id/status
GET    /api/applications/statistics
GET    /api/applications/kanban
GET    /api/applications/job/:jobId
```

### CVs

```http
POST   /api/cvs
GET    /api/cvs
GET    /api/cvs/:id
PUT    /api/cvs/:id
DELETE /api/cvs/:id
GET    /api/cvs/default
GET    /api/cvs/statistics
PATCH  /api/cvs/:id/default
POST   /api/cvs/:id/duplicate
```

### Anschreiben (Cover Letters)

```http
POST   /api/anschreiben/generate    # AI generation
POST   /api/anschreiben/:id/refine  # AI refinement
POST   /api/anschreiben
GET    /api/anschreiben
GET    /api/anschreiben/:id
PUT    /api/anschreiben/:id
DELETE /api/anschreiben/:id
POST   /api/anschreiben/:id/duplicate
GET    /api/anschreiben/statistics
GET    /api/anschreiben/application/:id
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:ci
```

### Frontend Tests (Coming Soon)

```bash
cd frontend
npm test
```

### Current Test Coverage

- Authentication Module: ✅ 14 tests
- Additional modules: In development

## 📦 Project Structure

```
jobjager/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── tests/
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── cv/
│   │   │   ├── applications/
│   │   │   └── jobs/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── README.md
├── CLAUDE.md
└── PROGRESS.md
```

## 💻 Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests with coverage

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript Strict Mode** - Type checking

### Git Workflow

```bash
# Conventional commits
feat: Add new feature
fix: Bug fix
refactor: Code refactoring
docs: Documentation updates
test: Add tests
chore: Maintenance tasks
```

## 🌐 Deployment

### Backend Deployment (Render/Railway)

1. Set environment variables
2. Configure PostgreSQL database
3. Run migrations
4. Deploy

### Frontend Deployment (Vercel)

1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Anthropic for Claude API
- Prisma for the excellent ORM
- DaisyUI for beautiful components
- The open-source community

## 📈 Project Status

- ✅ Backend API: Complete (41 endpoints)
- ✅ Frontend: Complete (11 pages)
- ✅ AI Integration: Complete
- 🚧 Testing: In progress (13% coverage, target: 70%+)
- 📅 Deployment: Planned
- 📅 PDF Export: Planned

## 🎯 Roadmap

- [ ] Complete test coverage (70%+)
- [ ] PDF export for CVs and cover letters
- [ ] Email notifications
- [ ] Analytics dashboard with charts
- [ ] Job board aggregation
- [ ] Mobile application
- [ ] Multi-language support (English/German)

---

**Built with ❤️ for job seekers in Germany**
