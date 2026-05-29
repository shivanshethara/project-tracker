# Project Tracker

A polished, local-first personal project tracker. Add projects, view them in a list,
edit/delete them, track progress, and see a small dashboard with charts.

- **Frontend:** React 18 + Vite, Tailwind CSS, Framer Motion, Chart.js (react-chartjs-2), Axios, React Router
- **Backend:** Node.js + Express, better-sqlite3 (single-file DB, zero config), CORS
- No auth, no uploads, no email, no state-management library — just the tracker.

## Prerequisites

- **Node.js 18+** (includes npm). Check with `node -v`.

That's it. The SQLite database file (`server/projects.db`) is created **automatically**
on first server start — there is no migration step and nothing to install for the DB.

## Project structure

```
Golden response/
├── README.md
├── server/
│   ├── .env.example
│   ├── package.json
│   └── index.js
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── index.css
        ├── components/
        │   ├── Layout.jsx
        │   ├── Modal.jsx
        │   └── ProjectForm.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Projects.jsx
            └── ProjectDetail.jsx
```

## Running the app (two terminals)

Run the backend and frontend in **two separate terminal windows**.

### Terminal 1 — backend

```bash
cd server
copy .env.example .env      # Windows (PowerShell/cmd). On macOS/Linux: cp .env.example .env
npm install
npm run dev
```

The API starts on **http://localhost:5000**. On first run it creates `server/projects.db`
automatically and runs `CREATE TABLE IF NOT EXISTS` on startup.

> `.env` is optional — `PORT` defaults to `5000` if no `.env` exists. Creating it just makes the port explicit.

### Terminal 2 — frontend

```bash
cd client
npm install
npm run dev
```

Vite serves the app on **http://localhost:5173**. All `/api` requests are proxied to
the backend on port 5000 (configured in `vite.config.js`), so there are no CORS issues.

## Open the app

Visit **http://localhost:5173** in your browser.

- `/` — Dashboard: four stat cards, a status doughnut chart, a per-category bar chart, and the 5 most recent projects.
- `/projects` — Full project grid with add (modal) / edit / delete.
- `/projects/:id` — Single project detail view with edit.

## API reference

Base path: `/api`

| Method | Endpoint             | Description                          |
| ------ | -------------------- | ------------------------------------ |
| GET    | `/api/projects`      | List all projects (newest first)     |
| GET    | `/api/projects/:id`  | Get one project                      |
| POST   | `/api/projects`      | Create a project                     |
| PUT    | `/api/projects/:id`  | Update a project                     |
| DELETE | `/api/projects/:id`  | Delete a project                     |
| GET    | `/api/stats`         | Aggregate dashboard statistics       |

On `POST`/`PUT`, the fields `name`, `category`, `status`, `priority`, and `deadline`
are required; a missing field returns `400` with a clear message. Unexpected errors
return `500` with the error message.

## Notes

- Nothing to do manually beyond the steps above. If `npm install` + `npm run dev` succeed
  in both folders, the app just works.
- To reset all data, stop the server and delete `server/projects.db` (and the `.db-wal` /
  `.db-shm` companion files if present). It will be recreated empty on next start.
