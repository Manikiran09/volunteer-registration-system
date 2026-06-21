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
git clone https://github.com/Manikiran09/volunteer-registration-system
cd volunteer-registration-system
```

### 2. Backend setup

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:5000` by default.

add mongodb uri here to connect for local database

```
MONGODB_URI=your_mongodb_uri_here
```
if you don't have mongodb local click here to download from official website.
```
https://www.mongodb.com/try/download/community
```

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

