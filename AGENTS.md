# Warkop Si Bontot — Repo Guide for Agents

## Project

Full-stack coffee shop ordering app. Two independent packages, **no root workspace**, no monorepo tooling.

## Commands

| Location | Command | Action |
|----------|---------|--------|
| `backend/` | `npm run dev` | Nodemon dev server on **port 5000** |
| `frontend/warkop_frontend/` | `npm run dev` | Vite dev server on **port 3000** (proxies `/api` → `localhost:5000`) |
| `frontend/warkop_frontend/` | `npm run build` | Production bundle |
| `backend/` | `npm start` | Production entry `src/app.js` |
| `backend/` | `node reset_db.js` | Drop, recreate & seed all tables |

Both servers must run simultaneously. Backend first, then frontend.

## Architecture

- **Backend**: Express 5, CommonJS (`require`/`module.exports`), entry `backend/src/app.js`
  - MySQL/MariaDB via `mysql2`, schema in `schema.sql`, seed in `seed.sql`
  - JWT auth (1h, `localStorage`), bcryptjs, salt=10
  - Auth routes at `api/auth/*`, API at `api/*`, upload at `api/upload`
- **Frontend**: React 19, Vite 8, JSX, ESM. No TypeScript.
  - Entry `main.jsx`, API layer in `api.js` (native `fetch`, `BASE = 'http://localhost:5000/api'`)
  - CSS only (Bootstrap via CDN on landing); no CSS framework in components
- **Dependencies**: `qrcode` (frontend), `pdfkit` (backend PDF gen), `multer` (uploads), `sweetalert2`
- **No tests**, no CI/CD, no formatter, no `.gitignore`

## Database

- `backend/schema.sql` — full DDL (DROP + CREATE all tables)
- `backend/seed.sql` — 5 categories, 43 menu items with image filenames, default admin user
- 43 menu images pre-loaded at `backend/public/uploads/`
- Admin: `admin@warkop.com` / `password123`

## Routes

**Public**: `GET /menu`, `GET /menu/:id`, `GET /kategori`, `POST /orders`, `GET /orders/:id/struk`, `POST /transaksi`
**Admin** (JWT + role `admin`): `POST/PUT/DELETE /menu/:id`, `GET /orders`, `DELETE /orders/:id`, `GET /transaksi`, `PATCH /transaksi/:id/lunas`, `GET /dashboard/overview`, `GET /dashboard/harian`, `GET /dashboard/pdf`
**Auth**: `POST /auth/register`, `POST /auth/login`
**Upload**: `POST /api/upload` (multipart, field `gambar`, max 2 MB, jpg/png/gif/webp)

## Key App Conventions

### Payment
- Only **Cash** and **QRIS** — transfer method removed entirely
- QRIS: embeds **plain-text receipt** (not a URL) so scan from any phone shows order details without network
- `transaksi.bukti_transfer` column still exists in DB but hidden from UI
- QR code generated on client via `qrcode.toDataURL(text)` before `clearCart()`

### Admin Dashboard
- Orders table shows all orders; "🗑 Hapus" button calls `DELETE /orders/:id`
- Transaksi table: "Lunas/Proses" toggle calls `PATCH /transaksi/:id/lunas`
- Laporan Harian table + "Download PDF" button calls `GET /dashboard/pdf`
- Polling: 5s interval using separate `refreshData()` (no `setLoading`/spinner) to avoid flicker
- `loadData()` (with spinner) and `refreshData()` (background) are separate functions

### Daily Report Gotchas
- Query uses `LEFT JOIN` on `transaksi` (no `status_pembayaran` filter) to count all today's orders
- Total omset: `Number(t.total_harga)` in reduce — string concatenation bug if using raw values
- `formatRp(n)` uses `Number(n).toLocaleString('id-ID')`

### PDF Struk
- `GET /orders/:id/struk` is public (no auth) — needed for desktop download
- Generated server-side with `pdfkit`
- Frontend download: `window.open(getStrukUrl(id))` with token in query param, 30s blob revoke timeout

## Constraints

- `backend/.env` required: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `PORT`, `JWT_SECRET`
- Frontend has `eslint` installed but no config file — `npm run lint` will fail
- Manual verification only — no test runner
- Image uploads: 2 MB limit, jpg/png/gif/webp only, stored at `public/uploads/`, served at `/uploads/`
