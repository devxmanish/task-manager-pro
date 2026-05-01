# TaskManager Pro — SaaS Team Task Management Platform

> **⚠️ Proprietary Code – No License Granted**
>
> This repository is shared for **portfolio review purposes only**. No permission is granted to use, copy, modify, distribute, or deploy this code — in whole or in part — for any purpose, commercial or otherwise. All rights reserved.
>
> **© 2026 Manish Kumar. All rights reserved.**

---

## Overview

A production-grade, multi-tenant SaaS platform for project management and team collaboration. Built with **Spring Boot 3** and **React 19**, it provides fully isolated organizational workspaces with real-time data synchronization, Kanban task boards, and a professional email notification system.

---

## Key Features

### Multi-Tenant SaaS Architecture
- **Organization isolation** — Each company gets its own data-scoped workspace
- **Invite system** — Admins invite members via email with configurable expiry (24h–30d)
- **Invite tracking** — Full lifecycle management: Pending → Accepted / Expired / Revoked
- **Role-based access** — Admins control projects and members; Members focus on assigned work

### Project & Task Management
- **Kanban boards** — Drag tasks through To Do → In Progress → In Review → Done
- **Priority levels** — Low, Medium, High, Urgent with visual badges
- **Due dates & overdue detection** — Automatic flagging of overdue tasks
- **Task comments** — Threaded discussions on each task

### Real-Time Collaboration
- **WebSocket sync** — STOMP over SockJS for live data updates across all org members
- **Instant notifications** — Push notifications for task assignments, status changes, comments
- **Live dashboard** — Stats, charts, and activity feeds update without page refresh

### Enterprise Security
- **Stateless OTP** — HMAC-SHA256 based, zero database storage, auto-expiring
- **Self-invalidating password reset** — Token includes password hash, auto-invalidates on change
- **HMAC-signed invite tokens** — Cryptographically secure organization invitations
- **JWT authentication** — Stateless, org-scoped claims embedded in token
- **Hardened error handling** — No internal stack traces or class names ever reach the client

### Professional Email System
- **9 branded HTML templates** — OTP, Welcome, Password Reset, Task Assignment, Status Change, Comments, Member Add/Remove, Org Invite
- **Gradient header, CTA buttons, detail cards** — Consistent branding across all communications

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3, Java 17, Spring Security, Spring Data JPA |
| Database | MySQL 8 |
| Auth | JWT + Stateless TOTP (HMAC-SHA256) |
| Real-time | WebSocket (STOMP + SockJS) |
| Email | Spring Mail with HTML MimeMessage templates |
| Frontend | React 19 (Vite 8), Redux Toolkit, React Router 7 |
| Styling | Tailwind CSS v4 + Custom design system |
| Deployment | Railway |

---

## Project Structure

```
team-task-manager/
├── backend/
│   └── src/main/java/com/devxmanish/taskmanager/
│       ├── config/             # Security, WebSocket, CORS, Async, SPA routing
│       ├── controller/         # REST endpoints (Auth, Projects, Tasks, Invitations, etc.)
│       ├── dto/                # Request/Response DTOs
│       ├── entity/             # JPA entities (User, Project, Task, Organization, Invitation)
│       ├── exception/          # Global error handler (13 specific handlers)
│       ├── repository/         # Org-scoped Spring Data repositories
│       ├── security/           # JWT, Auth filter, TOTP, HMAC services
│       └── service/            # Business logic, WebSocket broadcasting, Email
├── frontend/
│   └── src/
│       ├── app/                # Redux store
│       ├── components/         # Layout (Sidebar, DashboardLayout)
│       ├── features/           # Redux slices (auth, projects, tasks, notifications, dashboard)
│       ├── hooks/              # useWebSocket (central STOMP connection)
│       ├── pages/              # Route pages (Landing, Dashboard, Projects, Tasks, Team)
│       ├── services/           # Axios API client
│       └── utils/              # Error sanitization utilities
└── README.md
```

---

## Setup

### Prerequisites
- Java 17+, Maven 3.8+, Node.js 18+, MySQL 8+

### Backend
```bash
cd backend
# Configure database in src/main/resources/application.properties
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MYSQL_URL` | MySQL JDBC URL |
| `MYSQL_USER` / `MYSQL_PASSWORD` | Database credentials |
| `JWT_SECRET` | JWT signing key (64+ chars) |
| `OTP_SECRET` | HMAC signing key for OTP/reset/invite tokens |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP credentials |
| `FRONTEND_URL` | Frontend origin for CORS & email links |

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Initiate signup (sends OTP) |
| POST | `/api/auth/verify-otp` | Verify OTP + register + create/join org |
| POST | `/api/auth/login` | Login, returns JWT with org claims |
| GET | `/api/auth/me` | Current user + org metadata |
| POST | `/api/auth/invite` | Batch invite users to org (admin) |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with HMAC token |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List org-scoped projects |
| POST | `/api/projects` | Create project (admin) |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project (admin) |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/tasks` | List project tasks |
| POST | `/api/projects/:id/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/status` | Change status |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |

### Invitations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invitations` | List org invitations (auto-expires stale) |
| DELETE | `/api/invitations/:id` | Revoke pending invitation |
| POST | `/api/invitations/:id/resend` | Resend with new token/expiry |

---

## Security Architecture

### Stateless OTP (Zero Database Storage)
```
OTP    = last6digits(HMAC-SHA256(SECRET, email|timestamp|expiry))
Token  = base64(email|timestamp|expiry|hmac_signature)
```
Server recomputes on verification — no OTP stored anywhere.

### Self-Invalidating Password Reset
```
Token = HMAC(SECRET, userId|currentPasswordHash|timestamp|expiry)
```
Token auto-invalidates when password changes. One-time use guaranteed.

### Org Invite Token
```
Token = base64(orgId|email|expiry|hmac)
Expiry = admin-configured (24h to 30 days)
```

---

## Deployment (Railway)

1. Push to GitHub
2. Create Railway project → Add MySQL service
3. Connect GitHub repo → Deploy backend
4. Set environment variables in Railway dashboard
5. Frontend is served as static files from Spring Boot in production (`npm run build` → `backend/src/main/resources/static/`)
