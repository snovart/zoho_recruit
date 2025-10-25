# Recruitment Form – Full‑Stack App (Vue 3 + Node.js + PostgreSQL + Zoho Recruit API)

This repository contains a full‑stack recruitment form application built with **Vue 3 (Composition API)** on the frontend and **Node.js/Express** on the backend, backed by **PostgreSQL** via **Knex.js**. Submissions are stored locally and synchronised to **Zoho Recruit** (module: *Candidates*), including optional resume file upload to candidate **Attachments**.

The project is split into two folders:
- `frontend/` — Vue 3 app (Vite) with a two‑step form and a paginated list of applications.
- `backend/` — Express API with authentication, PostgreSQL persistence, and a Zoho Recruit integration service.

---

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Run the Backend](#run-the-backend)
- [Zoho Recruit Integration](#zoho-recruit-integration)
  - [Create OAuth Client (EU DC)](#create-oauth-client-eu-dc)
  - [Generate Refresh Token](#generate-refresh-token)
  - [Sync Behaviour](#sync-behaviour)
- [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Architecture

- **Frontend**: Vue 3 (Composition API), Vite, Axios, Tailwind‑style utility classes, file upload via `FormData`.
- **Backend**: Node.js 18+, Express, Multer (multipart), Knex.js, PostgreSQL, JSON Web Tokens (cookie‑based session), structured logging.
- **Database**: PostgreSQL with Knex migrations/seeds. Two core tables: `users`, `applications`.
- **3rd party**: Zoho Recruit v2 REST API (EU DC). OAuth2 with refresh token; scopes limited to Recruit modules and attachments.

---

## Prerequisites

- Node.js **≥ 18**
- npm **≥ 9**
- PostgreSQL **≥ 13**
- A Zoho account in the **EU** data center (project code and docs assume `*.zoho.eu` endpoints)

---

## Quick Start

```bash
# 1) Backend
cd backend
npm ci
cp .env.example .env              # fill the values (see below)
npx knex migrate:latest           # create tables
npx knex seed:run                 # seed users
npm run dev                       # start backend on http://localhost:5000

# 2) Frontend
cd ../frontend
npm ci
cp .env.example .env              # set VITE_* vars if needed
npm run dev                       # open http://localhost:5173
```

Login using a seeded account (see seeds below), create a new application and submit. After successful save the backend will push the candidate to Zoho Recruit and (if provided) upload the resume as an attachment.

---

## Backend Setup

### Environment Variables

Create `backend/.env` and set the following variables:

```bash
# Server
PORT=5000
NODE_ENV=development
SESSION_SECRET=change_this_secret

# Database
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=zoho_recruit_app

# CORS
CORS_ORIGIN=http://localhost:5173

# Zoho Recruit (EU DC)
ZOHO_REGION=eu
ZOHO_CLIENT_ID=1000.xxxxxxxxxxxxxxxxxxxxx
ZOHO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxx
ZOHO_REFRESH_TOKEN=1000.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ZOHO_ORG_ID=2010XXXXXXXX        # Your Zoho Recruit Org ID (number)
```

### Database Setup

This project uses **Knex.js** migrations and seeds.

1) **Run migrations** (creates `users` and `applications`):

```bash
npx knex migrate:latest
```

- `20251022144335_create_users.js` — creates table **users**  
  Columns: `id, email, password_hash, role, is_active, created_at, updated_at`.

- `20251022232604_create_applications.js` — creates table **applications** with FK `user_id → users.id`  
  Captures a snapshot of the form (step 1 + step 2) including `skills` (JSONB), `resume_path`, etc.

2) **Run seeds** (creates initial users including an admin):

```bash
npx knex seed:run
```

- `src/db/seeds/users.js` inserts 6 users with hashed passwords and resets the sequence:

  | id | email               | role   | password  |
  |----|---------------------|--------|-----------|
  | 1  | admin@example.com   | admin  | Admin123! |
  | 2  | user1@example.com   | user   | User123!  |
  | 3  | user2@example.com   | user   | User123!  |
  | 4  | user3@example.com   | user   | User123!  |
  | 5  | user4@example.com   | user   | User123!  |
  | 6  | user5@example.com   | user   | User123!  |

> Passwords are hashed using `bcryptjs` inside the seed file.

### Run the Backend

```bash
npm run dev      # nodemon + TypeScript-free ES modules
# or
npm start        # production (ensure DB and env vars are set)
```

The backend starts on **http://localhost:5000** by default.

---

## Zoho Recruit Integration

The integration lives in `backend/src/services/zohoRecruitService.js`. It handles:
- Access token refresh using a long‑lived **refresh token**
- `POST /Candidates` to create a candidate
- `POST /Candidates/{id}/Attachments` to upload a resume (with `attachments_category=Resume`)
- Optional: `GET /settings/fields?module=Candidates` to introspect available fields

### Create OAuth Client (EU DC)

1. Open **https://api-console.zoho.eu/**
2. Create client: **Server‑based Applications**
3. **Authorized Redirect URI**: `http://localhost:5000/zoho/oauth/callback`
4. Save **Client ID** and **Client Secret**

### Generate Refresh Token

Use the backend helper route to mint a refresh token for your account (one‑time):

1. Build the URL (EU DC) with the following scopes:
   - `ZohoRecruit.modules.ALL`
   - `ZohoRecruit.attachments.ALL`
   - `ZohoRecruit.org.READ`
   - (optional) `ZohoRecruit.settings.READ` for the fields metadata endpoint

```
https://accounts.zoho.eu/oauth/v2/auth
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=http://localhost:5000/zoho/oauth/callback
  &scope=ZohoRecruit.modules.ALL,ZohoRecruit.attachments.ALL,ZohoRecruit.org.READ,ZohoRecruit.settings.READ
  &access_type=offline
  &prompt=consent
```

2. Log in, consent, and you will be redirected to the backend callback page showing JSON with `access_token` and **`refresh_token`**. Copy the **refresh token** to `ZOHO_REFRESH_TOKEN` in your `.env`.

> Be sure your account belongs to the same **EU** data center.

### Sync Behaviour

- When a user submits the form, the backend:
  1. Saves the application into PostgreSQL.
  2. Creates a **Candidate** in Zoho Recruit mapping local fields:
     - Name, Email, Mobile, City, Source, Description, Current Job Title, Current Employer, Experience in Years, Skill Set, Expected Salary, etc. (only if values are present)
  3. If a resume file is provided, uploads it to the candidate’s **Attachments** with `attachments_category=Resume`.

- A debug endpoint exists to inspect available candidate fields:
  - `GET /api/zoho/recruit/fields` → returns `api_name`, `data_type`, `field_label`, `required`

---

## Frontend Setup

The frontend is a **Vue 3 (Composition API)** app created with **Vite**.

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev         # http://localhost:5173
```

Environment example (`frontend/.env`):
```bash
VITE_API_BASE=http://localhost:5000
```

Key features:
- Two‑step application form (Step 1 + Step 2)
- Client‑side validation
- File upload (resume) using `multipart/form-data`
- Applications list with pagination, sorting, and chips for skills
- Simple auth UI (login / logout) backed by the backend’s `/api/auth`

---

## API Reference

All routes are prefixed with `/api` unless stated otherwise.

### Auth
- `POST /api/auth/login` — { email, password } → session cookie
- `POST /api/auth/logout` — clears session
- `GET /api/auth/me` — returns current user profile

### Applications
- `POST /api/applications` — multipart form submit; saves to DB and pushes to Zoho.  
  Body fields mirror the form:  
  `first_name, last_name, email, phone, current_address, date_of_birth, position_applied_for, resume (file), linkedin_profile, education_level, years_of_experience, skills[], previous_employer, current_job_title, notice_period, expected_salary, availability_for_interview, preferred_location, cover_letter, source_of_application`
- `GET /api/applications?page=1&limit=20&sort=created_at:desc` — paginated list for the current user

### Zoho (debug)
- `GET /api/zoho/recruit/fields` — candidate field metadata (requires `ZOHO_RECRUIT.settings.READ` scope)

### OAuth helper (one‑time setup)
- `GET /zoho/oauth/callback` — exchanges `code`→token and displays JSON with `refresh_token`

---

## Project Structure

```
backend/
  index.js
  src/
    routes/
      auth.js
      applications.js
      index.js
    controllers/
      authController.js
      applicationsController.js
      zohoRecruitController.js
    services/
      zohoRecruitService.js
      applicationsService.js
    db/
      pool.js
      migrations/
        20251022144335_create_users.js
        20251022232604_create_applications.js
      seeds/
        users.js
  .env.example
  knexfile.js
  package.json

frontend/
  src/
    main.ts / main.js
    router/
    components/
    pages/
      ApplicationsList.vue
      ApplicationNew.vue
  .env.example
  vite.config.ts
  package.json
```

---

## Troubleshooting

- **Invalid OAuth Scope** on Zoho consent page  
  Ensure you are using the **EU** accounts host and correct scope names. Example: `accounts.zoho.eu` and `ZohoRecruit.modules.ALL` (not lowercase).

- **attachments_category cannot be empty** when uploading the resume  
  The backend sets `attachments_category=Resume`. Confirm you are on the latest code and your file input is named `resume` in the frontend.

- **400 expecting either a file input or an attachment_url**  
  Make sure the request is `multipart/form-data` and the field name is `resume`. Also verify the file is not empty.

- **CORS errors** in the browser  
  Set `CORS_ORIGIN=http://localhost:5173` in `backend/.env`. Restart the backend.

- **Login fails for seed users**  
  Double‑check you ran `npx knex seed:run`. If you changed seed data, truncate `users` and re‑run seeds.

---

## License

This project is provided as‑is for internal integration and demonstration purposes.
