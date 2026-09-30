# Enterprise Meeting Room Booking System

A full-stack enterprise meeting room reservation platform built with **Node.js, Express, MongoDB/Mongoose** on the backend and **React (Vite), Tailwind CSS, Framer Motion, and Lucide Icons** on the frontend. 

The application strictly operates within standard business hours (**09:00–18:00**) and implements custom **Part A Conflict Detection** and **Part B Next-Available Slot Finder** algorithms without using any third-party scheduling libraries.

---

## 🏗️ System Architecture Overview

The codebase is structured into two completely independent, decoupled standalone services:

```text
meeting-room-booking-system/
├── backend/                  # Node.js + Express + MongoDB REST API Service
│   ├── config/
│   │   └── db.js             # MongoDB Atlas connection with in-memory fallback
│   ├── controllers/
│   │   ├── bookingController.js # Part A conflict handling & booking endpoints
│   │   └── roomController.js    # Part B slot finder & room management endpoints
│   ├── models/
│   │   ├── Booking.js        # Mongoose Booking schema
│   │   └── Room.js           # Mongoose Room schema
│   ├── repositories/
│   │   └── storage.js        # Data persistence layer with seed data
│   ├── routes/
│   │   ├── bookingRoutes.js  # Booking REST endpoints
│   │   └── roomRoutes.js     # Room REST endpoints
│   ├── scripts/
│   │   └── seed.js           # Database seeding script
│   ├── services/
│   │   └── bookingService.js # Pure custom scheduling algorithms
│   ├── .env.example          # Environment variables template for backend
│   ├── .gitignore
│   ├── package.json          # Independent backend dependencies & scripts
│   └── server.js             # Express application entry point (Render-ready)
│
├── frontend/                 # React (Vite) + Tailwind CSS + Motion Single Page App
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js        # Centralized REST client (ALL API calls route here)
│   │   ├── components/
│   │   │   ├── BookingList.jsx        # Table view of all reservations
│   │   │   ├── BookingModal.jsx       # Reservation modal with conflict feedback
│   │   │   ├── Navbar.jsx             # Corporate navigation bar
│   │   │   ├── RoomCard.jsx           # Individual meeting room card
│   │   │   ├── SlotFinderModal.jsx    # Part B slot search interface
│   │   │   ├── TimelineView.jsx       # Interactive schedule matrix (09:00-18:00)
│   │   │   └── Toast.jsx              # Real-time toast notifications provider
│   │   ├── App.jsx           # Root UI dashboard component
│   │   ├── main.jsx          # React app entry point
│   │   └── index.css         # Tailwind CSS entry file
│   ├── .env.example          # Environment variables template for frontend
│   ├── .gitignore
│   ├── index.html            # HTML template
│   ├── package.json          # Independent frontend dependencies & scripts
│   └── vite.config.js        # Vite configuration (Vercel-ready)
│
├── .gitignore                # Root gitignore file
└── README.md                 # System documentation & deployment guide
```

---

## 🧮 Custom Business Logic & Pure Algorithms

### Part A: Pure Conflict Detection Algorithm

#### Mathematical Formulation
Every booking is represented as a half-open interval $[R_{\text{start}}, R_{\text{end}})$ in total minutes from midnight ($09:00 = 540\text{ min}, 18:00 = 1080\text{ min}$).

Two intervals $[R_{\text{start}}, R_{\text{end}})$ and $[E_{\text{start}}, E_{\text{end}})$ overlap **if and only if**:
$$\text{Overlap} \iff (R_{\text{start}} < E_{\text{end}}) \land (R_{\text{end}} > E_{\text{start}})$$

#### Proof of Back-to-Back Allowance
Suppose an existing meeting $E$ runs from `10:00` to `11:00` ($E_{\text{start}} = 600, E_{\text{end}} = 660$) and a new meeting $R$ is requested from `11:00` to `12:00` ($R_{\text{start}} = 660, R_{\text{end}} = 720$):
$$R_{\text{start}} < E_{\text{end}} \implies 660 < 660 \implies \mathbf{FALSE}$$
Because strict inequality ($<$) is evaluated, the condition yields `FALSE`. **Back-to-back meetings are strictly allowed.**

#### Conflict Rejection Response (`HTTP 409 Conflict`)
If an overlap is detected, the API returns `409 Conflict` with an exact detailed error message:
```json
{
  "success": false,
  "error": "Conflict detected: Requested time 10:30-11:30 overlaps with existing booking \"Strategy Sync\" (10:00-11:00) in Executive Boardroom.",
  "conflictingBooking": {
    "id": "6741a...",
    "title": "Strategy Sync",
    "startTime": "10:00",
    "endTime": "11:00",
    "organizer": "Jane Doe"
  }
}
```

---

### Part B: Next Available Slot Finder Algorithm

#### Linear Sweep Pointer Algorithm
Given a target room, date, and requested duration $d$ (in minutes):
1. **Sort chronologically**: Fetch existing bookings for that room and date and sort them in ascending order of start time.
2. **Initialize Pointer**: Set $\text{pointer} = 540$ (09:00).
3. **Scan Intervals**:
   - For each booking $B$:
     $$\text{gap} = B_{\text{start}} - \text{pointer}$$
     If $\text{gap} \ge d$, return slot $[\text{pointer}, \text{pointer} + d]$.
     Otherwise, advance $\text{pointer} = \max(\text{pointer}, B_{\text{end}})$.
4. **Final Gap Check**:
   $$\text{remainingGap} = 1080 - \text{pointer}$$
   If $\text{remainingGap} \ge d$, return slot $[\text{pointer}, \text{pointer} + d]$.
5. **No Slot Found**: Return `{ available: false, reason: "No slot of X minutes available..." }`.

#### API Response Example (`GET /api/rooms/:roomId/next-available`)
```json
{
  "success": true,
  "room": {
    "id": "room-pod-a",
    "name": "Innovation Pod A",
    "code": "ROOM-POD-A"
  },
  "available": true,
  "roomId": "room-pod-a",
  "date": "2026-09-30",
  "durationMinutes": 45,
  "startTime": "11:00",
  "endTime": "11:45"
}
```

---

## 🔌 Centralized API Architecture (`/src/api/api.js`)

All frontend components strictly route API interactions through `/src/api/api.js`. Components **do not** issue inline `fetch` or `axios` calls.

| Service Function | Endpoint | Description |
| :--- | :--- | :--- |
| `fetchRooms()` | `GET /api/rooms` | Fetches all available meeting rooms |
| `fetchBookings(roomId, date)` | `GET /api/bookings` | Fetches filtered bookings |
| `createBooking(data)` | `POST /api/bookings` | Submits reservation with Part A conflict validation |
| `cancelBooking(id)` | `DELETE /api/bookings/:id` | Cancels a reservation |
| `fetchNextAvailableSlot(...)` | `GET /api/rooms/:id/next-available` | Runs Part B slot calculation |
| `createRoom(data)` | `POST /api/rooms` | Creates custom room facility |
| `seedDefaultRooms()` | `POST /api/rooms/seed` | Seeds pre-configured rooms |
| `clearAllData()` | `POST /api/rooms/clear-all` | Resets all bookings |

---

## 🛠️ Local Setup & Execution Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

---

### 1. Backend Setup (`/backend`)

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/meeting_rooms?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
```
*(Note: If `MONGO_URI` is omitted, the backend seamlessly falls back to an in-memory database store for instant local testing).*

```bash
# Start the backend server in development mode
npm run dev

# Or start in production mode
npm start
```
Backend runs at: `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)

---

### 2. Frontend Setup (`/frontend`)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
# Start Vite development server
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🚀 Deployment Instructions

### Deploying Backend to Render (`/backend`)

1. Connect your repository to **Render** and choose **Web Service**.
2. Set **Root Directory** to `backend`.
3. Set **Runtime** to `Node`.
4. Set **Build Command**: `npm install`.
5. Set **Start Command**: `npm start`.
6. Add Environment Variables:
   - `PORT`: `5000` (or leave to Render default)
   - `MONGO_URI`: `your-mongodb-atlas-connection-string`
   - `FRONTEND_URL`: `https://your-frontend.vercel.app`

---

### Deploying Frontend to Vercel (`/frontend`)

1. Import your repository into **Vercel**.
2. Select **Root Directory** as `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`
7. Click **Deploy**.

---

## 📋 Features Checklist

- [x] Strictly independent `/backend` and `/frontend` directories.
- [x] Zero root-level application dependencies or junk files.
- [x] Pure custom conflict detection algorithm with half-open interval math.
- [x] Enforced working hours (09:00 – 18:00) with back-to-back meeting allowance.
- [x] Linear sweep next-available slot finder algorithm.
- [x] Centralized API client service at `/frontend/src/api/api.js`.
- [x] Real-time toast notifications with exact 409 conflict diagnostics.
- [x] Production-ready configuration for Render (Backend) & Vercel (Frontend).
