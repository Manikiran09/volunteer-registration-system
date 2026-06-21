# Volunteer Registration System

A simple full-stack app for managing volunteers and events. Volunteers can sign up, fill in their skills/availability, and register for events. Admins can approve volunteers, create events, and download CSV reports.

Built with React (Vite) on the frontend and Node.js + Express on the backend. Uses MongoDB, but if you don't have a database set up it'll automatically fall back to storing data in a local JSON file — so you can just clone and run it.

## Features

- Volunteer signup/login with JWT auth
- Volunteer profile (skills, availability, bio)
- Browse and register for events
- Admin dashboard to approve/reject volunteers
- Admin can create/edit/delete events
- CSV export of volunteer data
- Works without MongoDB (local JSON fallback)

## Tech Stack

- **Frontend:** React 19, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose) or local JSON fallback
- **Auth:** JWT, bcryptjs

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd volunteer-registration-system
```

### 2. Backend setup

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:5000` by default.

If you want to use MongoDB, add your connection string to `.env`:

```
MONGODB_URI=your_mongodb_uri_here
```

If you leave it blank, the app will just use a local `local_db.json` file instead — no setup needed.

### 3. Frontend setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Default admin login

```
Email: admin@volunteer.com
Password: admin123
```

## Project Structure

```
volunteer-registration-system/
├── client/          # React frontend
│   └── src/
│       ├── pages/       # Home, Auth, VolunteerDashboard, AdminDashboard
│       └── components/  # Navbar etc.
└── server/          # Express backend
    ├── routes/      # auth, events, volunteers, reports
    ├── middleware/  # JWT auth middleware
    └── db.js        # MongoDB models + JSON fallback
```

## API Overview

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register a new volunteer |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Private | Get logged-in user's profile |
| GET | /api/events | Private | List all events |
| POST | /api/events | Admin | Create an event |
| GET | /api/volunteers | Admin | List all volunteers |
| PUT | /api/volunteers/:id | Admin | Approve/reject a volunteer |
| GET | /api/reports/volunteers | Admin | Download volunteer CSV |

## Notes

This was built as a mini project, so it's kept fairly simple — no email notifications, no payments, no pagination. Possible next steps if I keep working on it: tests, file uploads for profile pictures, deployment.

## License

MIT
