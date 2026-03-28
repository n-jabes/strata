# STRATA

**STRATA** is a smart terraced agriculture platform for Africa. This repository contains a **Next.js** web application (in `frontend/`) with PostgreSQL, authentication, dashboards, land analysis, and community features.

---

## Prerequisites

Install the following on your computer before you begin.

| Requirement | Notes |
|-------------|--------|
| **Git** | To clone the repository. [Download Git](https://git-scm.com/downloads) |
| **Node.js** | **20.x LTS** or newer (includes `npm`). [Download Node.js](https://nodejs.org/) |
| **PostgreSQL database** | Either **local PostgreSQL** or a **hosted** instance such as [Neon](https://neon.tech). The app does not bundle a database server. |

**Optional but recommended**

- **OpenSSL** (often pre-installed on macOS/Linux; on Windows you can use Git Bash or WSL) to generate `AUTH_SECRET`, or use any secure random string generator.
- A **[Resend](https://resend.com)** account if you want password-reset emails to be delivered in development or production.
- A **[Cloudinary](https://cloudinary.com)** account if you use community features that upload media.

---

## Repository layout

- **`frontend/`** — Main application (Next.js 16, Prisma, NextAuth). **Follow the setup steps below in this folder.**
- **`backend/`** — Separate Express package with its own Prisma schema. It is **not required** to run the primary STRATA web app. Use it only if you are actively developing against that service.

---

## 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL> strata
cd strata
```

Replace `<YOUR_REPOSITORY_URL>` with the HTTPS or SSH URL of this project.

---

## 2. Choose a database

You must have a **PostgreSQL** database and a connection string. Two common options:

### Option A — Neon (cloud, no local install)

1. Create a free project at [neon.tech](https://neon.tech).
2. In the Neon dashboard, copy the **connection string** (usually under “Connection details”).
3. Neon URLs typically look like:  
   `postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`  
4. Paste that value into `DATABASE_URL` in your `frontend/.env` file (see below).

### Option B — Local PostgreSQL

1. Install PostgreSQL (e.g. from [postgresql.org](https://www.postgresql.org/download/) or your OS package manager).
2. Create a database, for example named `strata`:

   ```bash
   createdb strata
   ```

3. Set `DATABASE_URL` to something like:

   ```env
   DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/strata?schema=public"
   ```

Use a user that has permission to create tables and run migrations.

---

## 3. Configure environment variables

All application secrets and URLs for the main app live in **`frontend/.env`**.

1. Copy the example file:

   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit **`frontend/.env`** and set at least the **required** variables below.

### Sample `frontend/.env` (fill in your own values)

```env
# --- Database (required) ---
# Local example:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/strata?schema=public"
# Neon example (use the string from your Neon project):
# DATABASE_URL="postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL=""

# --- App URLs (required for local dev) ---
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"

# --- NextAuth (required) ---
# Generate e.g. openssl rand -base64 32
AUTH_SECRET="paste-a-long-random-secret-here"

# --- Password reset email (optional; without Resend, reset tokens still work but no email is sent) ---
RESEND_API_KEY=""
RESEND_FROM="STRATA <onboarding@resend.dev>"

# --- Community media uploads (optional until you use uploads) ---
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# --- Optional: legacy / future backend wiring ---
BACKEND_URL="http://localhost:3001"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

**Important**

- **`DATABASE_URL`** must point to an empty or compatible PostgreSQL database before the first migration.
- **`AUTH_SECRET`** must be a strong, unique secret in any shared or production environment.
- **`AUTH_URL`** and **`NEXT_PUBLIC_SITE_URL`** should match the URL where you open the app (for local development, `http://localhost:3000` is typical). In production, set them to your real domain (e.g. `https://app.example.com`).

### Seeding the super admin (optional variables)

The seed script creates or updates a **super admin** user. You can override defaults with:

| Variable | Purpose |
|----------|---------|
| `SEED_SUPER_ADMIN_EMAIL` | Email for the seeded admin |
| `SEED_SUPER_ADMIN_NAME` | Display name |
| `SEED_SUPER_ADMIN_PASSWORD` | Password (set this in production) |

If you omit `SEED_SUPER_ADMIN_PASSWORD`, a **default temporary password** is used and a warning is printed—change it immediately after first login.

---

## 4. Install dependencies

From the **`frontend`** directory:

```bash
npm install
```

This installs packages and runs **`prisma generate`** (via `postinstall`) so the Prisma client matches the schema.

---

## 5. Apply database migrations

With **`DATABASE_URL`** set in **`frontend/.env`**, run:

```bash
cd frontend
npx prisma migrate deploy
```

This applies all SQL migrations under `frontend/prisma/migrations/` to your database.

- For a **fresh** database, this creates the full schema.
- If you see connection errors, confirm PostgreSQL is running (local) or that your Neon project is active and the URL includes `?sslmode=require` if Neon requires SSL.

---

## 6. Seed the database (recommended)

Creates the super admin and baseline data expected by the app:

```bash
npm run db:seed
```

Note the credentials you configured (or the defaults printed in the seed output). Use them to sign in at **`/login`**.

---

## 7. Start the development server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

You should be able to:

- Browse public pages.
- **Register** a new account or **sign in** with the seeded super admin.
- Use authenticated areas (dashboard, farms, analyze land, etc.) according to your role.

---

## 8. Production build (sanity check)

```bash
npm run build
npm start
```

Ensure the same environment variables are set in your hosting provider (e.g. Vercel) as in `.env`.

---

## Useful commands (frontend)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npx prisma migrate deploy` | Apply migrations (CI / production) |
| `npx prisma migrate status` | Check migration state |
| `npm run db:seed` | Run seed script |

---

## Troubleshooting

- **`DATABASE_URL` errors** — Verify the URL, credentials, database name, and that the server accepts connections (firewall, SSL). Neon strings often need `sslmode=require`.
- **“Invalid credentials” after seed** — Confirm you used the email/password from your seed variables (or the documented defaults) and that `npm run db:seed` completed without errors.
- **Password reset never arrives** — Set `RESEND_API_KEY` and `RESEND_FROM`, and use a Resend-approved sender. Without them, the API still responds generically but **no email is sent** (check server logs).
- **Community uploads fail** — Configure all three `CLOUDINARY_*` variables.

---

## License and support

Refer to your team’s policies for licensing and internal support channels.

If you improve this setup, consider updating **`frontend/.env.example`** and this **README** so new contributors stay in sync.
