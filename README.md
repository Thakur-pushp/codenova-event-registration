# CodeNova Event Registration Platform (MERN)

A full-stack event registration app built with MongoDB, Express, React (Vite), and Node.js.

## Features
- Public event showcase with title, schedule, description, capacity, and available seats
- Registration form: name, email, college/organization, and domain interests
- One registration per email per event (MongoDB compound unique index + friendly HTTP `409 Conflict`)
- Live registration count refresh after a successful registration
- Admin dashboard with search and registration status/capacity information
- Admin API protected by a simple shared key (`ADMIN_KEY`)
- Seed script inserts demo events

> This is a learning-project admin gate, not production-grade authentication. For production, use individual admin accounts, hashed passwords, sessions/JWT, rate limiting, HTTPS, and audit logging.

## 1. Install prerequisites on Windows
1. Install **Node.js LTS** from https://nodejs.org/ (npm is included).
2. Install **Visual Studio Code** from https://code.visualstudio.com/.
3. Install **Git** (optional) from https://git-scm.com/.
4. Use MongoDB Atlas (cloud) or install MongoDB Community Server locally. Atlas is easiest if you don't already have MongoDB running.

Verify Node/npm in VS Code terminal:
```powershell
node -v
npm -v
```

## 2. Open project in VS Code
Extract the ZIP, then VS Code → **File → Open Folder** → select `codenova-event-registration`.
Open Terminal → New Terminal.

## 3. Configure MongoDB and environment variables
Open `server/.env.example`, copy it to `server/.env`, and edit the values.

For MongoDB Atlas:
- Create a free cluster at https://www.mongodb.com/atlas
- Create a database user and allow your current IP in Network Access
- Copy the Node.js connection string into `MONGODB_URI`
- Replace `<db_password>` with your database user's password (URL-encode special characters).

Example `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_URL_ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/codenova_events?retryWrites=true&w=majority
ADMIN_KEY=change-this-to-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
```
Do not commit `.env` to Git.

## 4. Install dependencies
In VS Code terminal, run these in order:
```powershell
cd server
npm install
Copy-Item .env.example .env
```
Edit `server/.env` before starting the server.

Open a **second terminal** in VS Code:
```powershell
cd client
npm install
```

## 5. Seed sample events
With MongoDB configured and `server/.env` saved:
```powershell
cd server
npm run seed
```
This inserts sample events only if the database currently has no events.

## 6. Run the app
Terminal 1:
```powershell
cd server
npm run dev
```
Expected: API listening at `http://localhost:5000` and MongoDB connected.

Terminal 2:
```powershell
cd client
npm run dev
```
Open the local URL printed by Vite, normally http://localhost:5173.

## 7. Use the app
- Click an event to register.
- Use the **Admin** link in the navbar.
- Enter the same value as `ADMIN_KEY` from `server/.env`.
- Search attendees by name, email, event, or college.
- Test duplicate prevention by registering the same email for the same event twice. The second attempt should show a conflict message.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/events` | List events and registration counts |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events/:id/register` | Register attendee |
| GET | `/api/admin/registrations` | List registrations (requires `x-admin-key`) |

## Troubleshooting
- `MongoServerSelectionError`: check Atlas IP allowlist, username/password, and connection string.
- `bad auth`: reset the database user password; URL-encode special characters in it.
- `EADDRINUSE`: change `PORT` in `server/.env`.
- `npm is not recognized`: reinstall Node.js LTS and reopen VS Code.
- `Cannot find module`: run `npm install` in the relevant `server` or `client` folder.
- PowerShell blocks a script: use the VS Code Command Prompt terminal, or review your PowerShell execution policy with an adult/admin if this is a managed device.
