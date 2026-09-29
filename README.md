# Photo Gallery — Full Stack (React + Express + MongoDB)

A neo-brutalist photo gallery with real authentication, file uploads, favorites,
profile avatars, light/dark mode, and a full admin panel.

## Stack
- **Frontend:** React (Vite) + Tailwind CSS, React Router
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT stored in an httpOnly cookie (not localStorage) + bcrypt password hashing

## Project layout
```
photo-gallery/
├─ server/     Express API, MongoDB models, file uploads
└─ client/     React app (Vite + Tailwind)
```

## 1. Prerequisites
- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## 2. Install
From the project root:
```bash
npm run install:all
```
(This installs the root, `server`, and `client` dependencies. If you don't have the root
`concurrently` dependency yet, `npm install` at the root first.)

## 3. Configure the server
```bash
cd server
cp .env.example .env   # already done for you — just edit the values below
```
Edit `server/.env`:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — replace with a long random string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — a bootstrap admin account is created automatically
  the first time the server starts (and via `npm run seed:admin`)
- `ADMIN_SIGNUP_CODE` — the access code required on the **Admin Signup** page. Anyone who
  knows this code can create an admin account, so keep it private and change it from the
  default before sharing the app.

## 4. Run in development
From the project root:
```bash
npm run dev
```
This starts the API on `http://localhost:5000` and the React app on `http://localhost:5173`
(Vite proxies `/api` to the server, so the app and API share one origin in the browser — no
CORS/cookie headaches). Open `http://localhost:5173`.

## 5. Using the app
- **Login** — one form for both regular users and admins; the account's own role decides
  where you land.
- **User Signup** — creates a regular account.
- **Admin Signup** — creates an admin account, gated by `ADMIN_SIGNUP_CODE`.
- A bootstrap admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) always exists so you can get into
  the admin panel on a fresh database without knowing the signup code.
- **Gallery / Add Photo / Favorites / Profile** — the regular user area. Profile lets you
  upload/replace/remove an avatar, rename yourself, change your password, and delete your
  account.
- **Admin panel** (`/admin`) — stats overview, manage every photo (search + delete),
  manage every user (promote/demote role, delete — cascades their photos), and a
  cross-account favorites view.
- **Theme toggle** (sun/moon icon) — switches light/dark mode and remembers your choice.

## 6. Production build
```bash
npm run build          # builds client/dist
npm start               # from server/, serves the API AND the built React app together
```

## API summary
| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/signup` | Create a user account |
| POST | `/api/auth/admin-signup` | Create an admin account (`accessCode` required) |
| POST | `/api/auth/login` | Login (user or admin) |
| POST | `/api/auth/logout` | Clear the session |
| GET | `/api/auth/me` | Current session's user |
| GET/PUT | `/api/users/me` | View/update profile |
| PUT/DELETE | `/api/users/me/avatar` | Upload/remove avatar |
| PUT | `/api/users/me/password` | Change password |
| DELETE | `/api/users/me` | Delete own account |
| GET/POST | `/api/photos` | List/upload own photos (`?q=`, `?favorites=true`) |
| GET/DELETE | `/api/photos/:id` | View/delete a photo |
| GET | `/api/photos/:id/file` | The image bytes |
| POST/DELETE | `/api/photos/:id/favorite` | Favorite/unfavorite |
| GET | `/api/admin/stats` \| `/photos` \| `/users` | Admin-only |
| PATCH/DELETE | `/api/admin/users/:id` | Change role / delete a user |

## Security notes
- Passwords are hashed with bcrypt; the JWT lives in an httpOnly, SameSite cookie.
- Uploaded images are renamed to random filenames and their magic bytes are checked, so a
  renamed non-image file is rejected even if the extension looks right.
- Change `JWT_SECRET`, `ADMIN_PASSWORD`, and `ADMIN_SIGNUP_CODE` before deploying anywhere
  real.
