# 📋 TaskManager Pro

### Enterprise-Grade SaaS Platform for Team Task Management & Collaboration

A production-ready, multi-tenant platform that empowers teams to manage projects, track tasks, and collaborate in real-time — all within secure, isolated organizational workspaces.

> **🔒 Proprietary Software**
>
> This repository is shared for **portfolio review purposes only**. No permission is granted to use, copy, modify, distribute, or deploy this code — in whole or in part — for any purpose, commercial or otherwise.

---

## ✨ Features

### 🏢 Multi-Tenant Organization System
- Fully isolated data-scoped workspaces for each company
- Admin-managed invite system with configurable expiry (24 hours – 30 days)
- Invite lifecycle tracking — Pending → Accepted / Expired / Revoked
- Role-based access control — Admins manage projects & members; Members focus on assigned work

### 📊 Project & Task Management
- **Kanban boards** — Drag tasks through `To Do → In Progress → In Review → Done`
- **Priority system** — Low, Medium, High, Urgent with visual color-coded badges
- **Due dates & overdue detection** — Automatic flagging of overdue tasks
- **Task comments** — Threaded discussions attached to each task

### ⚡ Real-Time Collaboration
- **WebSocket sync** — STOMP over SockJS for live data updates across all organization members
- **Instant notifications** — Push alerts for task assignments, status changes, and comments
- **Live dashboard** — Stats, charts, and activity feeds update without page refresh

### 🔐 Enterprise Security
- **Stateless OTP** — HMAC-SHA256 based, zero database storage, auto-expiring verification
- **Self-invalidating password reset** — Tokens embed password hash, auto-invalidate on change
- **HMAC-signed invite tokens** — Cryptographically secure organization invitations
- **JWT authentication** — Stateless, organization-scoped claims embedded in token
- **Hardened error handling** — No internal stack traces or class names ever reach the client

### 📧 Professional Email System (Resend)
- **9 branded HTML email templates** with gradient headers, CTA buttons, and detail cards
- **Email types** — OTP Verification, Welcome, Password Reset, Task Assignment, Status Update, Comment Notification, Member Added/Removed, Organization Invite
- **Dynamic branding** — Company name and year automatically applied across all templates

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Spring Boot 3, Java 17, Spring Security, Spring Data JPA |
| **Database** | MySQL 8 |
| **Authentication** | JWT + Stateless TOTP (HMAC-SHA256) |
| **Real-time** | WebSocket (STOMP + SockJS) |
| **Email** | Resend API with branded HTML templates |
| **Frontend** | React 19 (Vite 8), Redux Toolkit, React Router 7 |
| **Styling** | Tailwind CSS v4 + Custom design system |
| **Hosting** | Railway (Backend) · Vercel (Frontend) |

---

## 🗂️ Architecture

```
team-task-manager/
├── backend/
│   └── src/main/java/com/devxmanish/taskmanager/
│       ├── config/             # Security, WebSocket, CORS, Async, SPA routing
│       ├── controller/         # REST endpoints (Auth, Projects, Tasks, Invitations)
│       ├── dto/                # Request/Response DTOs with validation
│       ├── entity/             # JPA entities (User, Project, Task, Organization, Invitation)
│       ├── exception/          # Global error handler with 13 specific handlers
│       ├── repository/         # Org-scoped Spring Data repositories
│       ├── security/           # JWT filter, TOTP service, HMAC token provider
│       └── service/            # Business logic, WebSocket broadcasting, Email
├── frontend/
│   └── src/
│       ├── app/                # Redux store configuration
│       ├── components/         # Layout (Sidebar, DashboardLayout)
│       ├── features/           # Redux slices (auth, projects, tasks, notifications, dashboard)
│       ├── hooks/              # useWebSocket (central STOMP connection manager)
│       ├── pages/              # Route pages (Landing, Dashboard, Projects, Tasks, Team)
│       ├── services/           # Axios API client with JWT interceptor
│       └── utils/              # Error sanitization utilities
└── README.md
```

---

## 🔑 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Initiate signup — sends OTP to email |
| `POST` | `/api/auth/verify-otp` | Verify OTP, register user, create/join org |
| `POST` | `/api/auth/login` | Login — returns JWT with org-scoped claims |
| `GET` | `/api/auth/me` | Get current user + organization metadata |
| `POST` | `/api/auth/invite` | Batch invite users to organization (admin) |
| `POST` | `/api/auth/forgot-password` | Send password reset email |
| `POST` | `/api/auth/reset-password` | Reset password with self-invalidating HMAC token |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List org-scoped projects |
| `POST` | `/api/projects` | Create project (admin) |
| `PUT` | `/api/projects/:id` | Update project details |
| `DELETE` | `/api/projects/:id` | Delete project (admin) |
| `POST` | `/api/projects/:id/members` | Add member to project |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove member from project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/tasks` | List all tasks in a project |
| `POST` | `/api/projects/:id/tasks` | Create task with assignment |
| `PUT` | `/api/tasks/:id` | Update task details |
| `PATCH` | `/api/tasks/:id/status` | Change task status |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `POST` | `/api/tasks/:id/comments` | Add comment to task |

### Invitations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/invitations` | List org invitations (auto-expires stale) |
| `DELETE` | `/api/invitations/:id` | Revoke a pending invitation |
| `POST` | `/api/invitations/:id/resend` | Resend with fresh token and expiry |

---

## 🔐 Security Architecture

### Stateless OTP — Zero Database Storage
```
OTP    = last6digits( HMAC-SHA256(SECRET, email | timestamp | expiry) )
Token  = base64( email | timestamp | expiry | hmac_signature )
```
The server recomputes the OTP on verification — nothing is stored in the database.

### Self-Invalidating Password Reset
```
Token = HMAC( SECRET, userId | currentPasswordHash | timestamp | expiry )
```
The token automatically invalidates when the password is changed. One-time use is guaranteed without any database tracking.

### Organization Invite Tokens
```
Token  = base64( orgId | email | expiry | hmac )
Expiry = admin-configured (24 hours to 30 days)
```

---

## 📄 License

**All Rights Reserved.**

This project is proprietary software. No license is granted for use, modification, or distribution.

© 2026 Manish Kumar. All rights reserved.
