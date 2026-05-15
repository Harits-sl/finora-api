# Finora API

Production-ready REST API backend for the Finora personal finance app — built with NestJS 11, PostgreSQL, and Prisma ORM.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 + TypeScript (strict) |
| Database | PostgreSQL via Prisma ORM v6 |
| Auth | JWT (Passport) + bcryptjs |
| Validation | class-validator + class-transformer |
| Logger | Winston + nest-winston |
| Security | Helmet, Compression, CORS |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- PostgreSQL (local or Docker)

### 1. Clone & install

```bash
git clone <repo-url>
cd finora-api
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
APP_NAME=Finora API
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/finora_db

FRONTEND_URL=http://localhost:3000

JWT_SECRET=ganti-dengan-secret-yang-kuat
JWT_EXPIRES_IN=7d
```

### 3. Setup database

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations (creates DB tables)
pnpm prisma:migrate
```

### 4. Run development server

```bash
pnpm dev
```

API akan berjalan di `http://localhost:3000/api/v1`

---

## Scripts

```bash
pnpm dev              # Development server dengan hot reload
pnpm build            # Compile TypeScript ke dist/
pnpm start            # Jalankan hasil build production
pnpm lint             # ESLint + auto-fix
pnpm format           # Prettier formatting

pnpm prisma:generate  # Generate Prisma client (wajib setelah ubah schema)
pnpm prisma:migrate   # Buat & jalankan migrasi database
pnpm prisma:studio    # Buka Prisma Studio GUI

pnpm test             # Unit tests
pnpm test:watch       # Unit tests (watch mode)
pnpm test:cov         # Unit tests + coverage report
```

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

### Health

```
GET /health
```

```json
{
  "success": true,
  "message": "Server is running",
  "data": null
}
```

---

### Auth

Semua endpoint auth tidak memerlukan token.

#### Register

```
POST /auth/register
```

```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "secret123"
}
```

#### Login

```
POST /auth/login
```

```json
{
  "email": "budi@example.com",
  "password": "secret123"
}
```

**Response sukses:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "Budi Santoso", "email": "..." },
    "token": "eyJhbGci..."
  }
}
```

---

### Users

> Semua endpoint users memerlukan header `Authorization: Bearer <token>`

| Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/users` | List semua user (paginated) |
| `GET` | `/users/me` | Profil user yang sedang login |
| `GET` | `/users/:id` | Detail user by ID |
| `PUT` | `/users/:id` | Update user |
| `DELETE` | `/users/:id` | Hapus user |

Query params untuk list: `?page=1&limit=10&search=budi`

---

### Finance (Transaksi)

> Semua endpoint finance memerlukan header `Authorization: Bearer <token>`

| Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/finance` | List transaksi milik user (paginated) |
| `GET` | `/finance/summary` | Ringkasan income / expense / balance |
| `GET` | `/finance/:id` | Detail transaksi |
| `POST` | `/finance` | Buat transaksi baru |
| `PUT` | `/finance/:id` | Update transaksi |
| `DELETE` | `/finance/:id` | Hapus transaksi |

**Contoh buat transaksi:**

```json
POST /api/v1/finance
Authorization: Bearer <token>

{
  "type": "EXPENSE",
  "category": "FOOD",
  "amount": 35000,
  "description": "Makan siang",
  "date": "2026-05-15"
}
```

**Enum `type`:** `INCOME` | `EXPENSE`

**Enum `category`:** `FOOD` | `TRANSPORT` | `ENTERTAINMENT` | `HEALTH` | `EDUCATION` | `SHOPPING` | `BILLS` | `SALARY` | `INVESTMENT` | `OTHER`

---

## Response Format

Semua endpoint mengembalikan format yang konsisten.

**Sukses:**

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

**Sukses (paginated):**

```json
{
  "success": true,
  "message": "Success",
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["email must be an email", "password must be at least 6 characters"]
}
```

---

## Project Structure

```
src/
├── common/
│   ├── constants/        # API prefix, enum UserRole, TransactionType/Category
│   ├── decorators/       # @Public(), @CurrentUser()
│   ├── dto/              # PaginationDto (reusable)
│   ├── exceptions/       # AppException, ResourceNotFoundException, dll
│   ├── filters/          # AllExceptionsFilter — normalisasi semua error
│   ├── guards/           # JwtAuthGuard (global, semua route protected by default)
│   ├── interceptors/     # ResponseInterceptor + LoggingInterceptor
│   ├── middleware/       # LoggerMiddleware (HTTP request logging)
│   ├── pipes/            # ParseIntPipe
│   ├── types/            # ApiResponse, PaginatedResponse interface
│   └── utils/            # successResponse(), paginatedResponse(), errorResponse()
│
├── config/               # app.config, database.config, env.validation (Joi), logger.config
├── logger/               # AppLoggerModule + AppLogger (Winston, @Global)
├── prisma/               # PrismaModule + PrismaService (@Global, graceful shutdown)
│
└── modules/
    ├── health/           # GET /health (public)
    ├── auth/             # POST /auth/register|login + JwtStrategy
    ├── users/            # CRUD users, GET /me
    └── finance/          # CRUD transaksi + GET /summary
```

---

## Database Schema

```
User
  id, name, email, password, role (ADMIN|USER)
  → transactions[]

Transaction
  id, userId, type, category, amount (Decimal), description?, date
```

Setelah mengubah `prisma/schema.prisma`, selalu jalankan:

```bash
pnpm prisma:migrate    # buat migration
pnpm prisma:generate   # update TypeScript types
```

---

## Authentication Flow

1. Client melakukan `POST /auth/register` atau `POST /auth/login`
2. Server mengembalikan `token` (JWT)
3. Sertakan token di setiap request berikutnya:
   ```
   Authorization: Bearer <token>
   ```
4. Token expired sesuai `JWT_EXPIRES_IN` (default: `7d`)

**Semua route dilindungi JWT secara global.** Untuk membuat route publik, gunakan decorator `@Public()`:

```typescript
import { Public } from '../../common/decorators';

@Public()
@Get('status')
getStatus() { ... }
```

---

## Logging

Log disimpan di folder `logs/` (dibuat otomatis):

- `logs/combined.log` — semua log (info, warn, error)
- `logs/error.log` — error log saja

Di development, console menampilkan output berwarna. Di production, format JSON.

---

## Environment Variables

| Variable | Required | Default | Keterangan |
|---|---|---|---|
| `APP_NAME` | | `Finora API` | Nama aplikasi |
| `PORT` | | `3000` | Port server |
| `NODE_ENV` | | `development` | `development` / `production` / `test` |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `FRONTEND_URL` | | `http://localhost:3000` | Allowed CORS origin |
| `JWT_SECRET` | ✅ | — | Secret key untuk signing JWT |
| `JWT_EXPIRES_IN` | | `7d` | Durasi token JWT |

---

## License

UNLICENSED — Private project.
