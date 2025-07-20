# 🛠️ Task Master – Server Side (API)

Task Master is a collaborative task management platform built for team-based project workflows. This repository contains the **backend server** implemented using **Express.js** and **PostgreSQL**, responsible for authentication, team and project management, task tracking, and commenting functionality.

---

## 📦 Tech Stack

- **Node.js** with **Express.js**
- **PostgreSQL** (with Prisma ORM)
- **JWT-based Authentication**
- **REST API**
- **Validation** with custom middleware

---

## 🧩 Core Features

### 👥 User & Team Management
- Users can register, login, and manage their profile
- Users can join teams or be invited
- Teams can have multiple members with invitation status tracking

### 📁 Project Management
- Projects are created by users and linked to one or more teams
- Only team members can access project-related tasks

### ✅ Task Management
- Tasks are created under a project and assigned to team members
- Tasks support metadata like `start_date`, `due_date`, `status`, and `description`
- Validations to prevent past-due dates and ensure task assignment integrity

### 💬 Task Comments
- Users can comment on tasks
- Comments include timestamp and author information

## 🗂️ Folder Structure
task-master-backend/
│
├── prisma/ # Prisma schema
├── app.js # Main Express app setup
├── src/
    │
    ├── controllers/ # Business logic for tasks, teams, projects
    ├── middleware/ # Auth, validation, and error handling
    ├── routes/ # API route definitions
    ├── lib/ # Helper functions (e.g. response formatter)
    ├── generated/ # Prisma generated file


---

## 🔐 Authentication

- JWT-based authentication (`Authorization: Bearer <token>`)
- Login and register routes return a token on success
- Middleware verifies user and attaches user data to `req.user`

---

## 🧪 API Endpoints (Sample)

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Users
- `POST /api/users/register` (register a user)
- `GET /api/users` (get all users)
- `PUT /api/users/:id` (update user details)
- `GET /api/users/:id` (get specific user)

### Teams
- `POST /api/teams` (create a team)
- `GET /api/teams` (get teams for user)
- `DELETE /api/teams` (delete a teams)

### Projects
- `POST /api/projects` (create a project)
- `GET /api/projects` (projects user is involved in)

### Tasks
- `POST /api/tasks` ✅ Validates required fields and future dates
- `GET /api/tasks` ✅ Fetches tasks from projects user is part of
- `DELETE /api/tasks/:id` ✅ Delete a task
- `PATCH /api/tasks/:id` ✅ Update status of a task
- `POST /api/tasks/:id/comments` ✅ Add tasks comments

---

## 🧰 Environment Variables 

- Environment variables are stored in .env
