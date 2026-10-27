# DevShowcase: Platform Portofolio Interaktif & Audit Akses Proyek

> **Dual-Database Architecture:** MariaDB (Relational ACID Core) + MongoDB (Unstructured Telemetry & Documentation)  
> **Backend:** Node.js, Express.js, Sequelize ORM, Mongoose ODM  
> **Frontend:** React 19, Vite, Tailwind CSS, React Router v7, Recharts, Lucide Icons  
> **Server Instance:** Ubuntu Server (10.100.30.57) • Cloudflare Tunnel Ready

---

## 1. Ikhtisar Arsitektur Dual-Database

DevShowcase membagi persistensi data berdasarkan karakteristik beban kerja (*workload separation*):

```
                                  +-----------------------------+
                                  |   Client: React 19 (Vite)   |
                                  |   (Port 5173 / Tunnel Web)  |
                                  +-----------------------------+
                                                 ||
                                                 || REST API (JSON / JWT)
                                                 \/
                                  +-----------------------------+
                                  |    Express.js Backend API   |
                                  |    (Port 5001 / AuditLogger)|
                                  +-----------------------------+
                                         //               \\
                      (Relational Entities)              (Docs & Telemetry)
                                       //                   \\
                                      \/                     \/
                  +---------------------------+       +---------------------------+
                  |    MariaDB 11.4 (Port 3306)|       |  MongoDB 7.0 (Port 27017) |
                  |    via Sequelize ORM      |       |  via Mongoose ODM         |
                  +---------------------------+       +---------------------------+
                  | • users (auth, roles)     |       | • project_details         |
                  | • projects (core metadata)|       |   (Markdown docs, specs,  |
                  | • tags (tech-stack)       |       |   changelog history)      |
                  | • project_tags (pivot M:N)|       | • access_logs (telemetry, |
                  +---------------------------+       |   Cloudflare IP, latency) |
                                                      +---------------------------+
```

### A. MariaDB (Core Entity & ACID Consistency)
- **Tabel `users`**: Menyimpan kredensial pengguna terenkripsi (`bcrypt`), email unik, dan role (`admin` / `viewer`).
- **Tabel `projects`**: Menyimpan entitas utama proyek: `id`, `title`, `slug` (unik), `category` (`Web App`, `Network Topology`, `Game Dev`, `System Admin`), `repo_url`, `demo_url`, `license`, `featured`.
- **Tabel `tags`**: Kamus tag tech-stack (`React`, `WireGuard`, `Linux`, `Docker`, dsb).
- **Tabel `project_tags`**: Tabel pivot many-to-many menghubungkan `projects.id` dan `tags.id`.

### B. MongoDB (Unstructured Documents & Audit Telemetry)
- **Koleksi `project_details`**:
  - `projectId`: Integer unik berelasi dengan `id` tabel `projects` di MariaDB.
  - `markdownContent`: Dokumentasi teknis/studi kasus panjang (mendukung syntax highlight dan diagram ASCII).
  - `architectureDiagramUrl`: URL gambar diagram topologi sistem.
  - `systemSpecs`: Objek dinamis (`Schema.Types.Mixed`) menyimpan spesifikasi OS, RAM, CPU, latency, router engine.
  - `changelog`: Array riwayat rilis `[{ version, releaseDate, notes }]`.
- **Koleksi `access_logs`**:
  - `timestamp`: Waktu kunjungan.
  - `path`: Endpoint/halaman proyek yang diakses.
  - `targetProjectId`: Referensi ID proyek yang diakses (nullable).
  - `ipAddress`: IP riil pengunjung (mendukung header `cf-connecting-ip`, `x-forwarded-for` dari Cloudflare Tunnel).
  - `userAgent`: Browser dan OS client.
  - `responseTimeMs`: Durasi respon server dalam milidetik.

---

## 2. Struktur Proyek

```
devshowcase/
├── client/                     # Frontend React 19 (Vite)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProjectCard, MarkdownViewer,
│   │   │                       # SystemSpecsHUD, ChangelogTimeline, ProjectFormModal
│   │   ├── pages/              # Home, ProjectDetail, AdminDashboard, AdminLogin
│   │   ├── services/           # api.js (Axios Client & Interceptors)
│   │   ├── App.jsx             # React Router v7 routes
│   │   ├── main.jsx            # Entrypoint
│   │   └── index.css           # Tailwind CSS & Glassmorphism styles
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                     # Backend Express.js
│   ├── config/
│   │   ├── db.mariadb.js       # Inisialisasi Sequelize & auto-sync tabel
│   │   └── db.mongodb.js       # Inisialisasi Mongoose connection
│   ├── controllers/
│   │   ├── authController.js       # Login JWT, me, logout
│   │   ├── projectController.js    # Dual-store atomic CRUD & merged response
│   │   └── analyticsController.js  # Telemetry summary, trend charts, raw logs
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification & admin authorization
│   │   └── auditLogger.js      # Automatic visitor telemetry logger to MongoDB
│   ├── models/
│   │   ├── sql/                # User.js, Project.js, Tag.js, index.js
│   │   └── nosql/              # ProjectDetail.js, AccessLog.js
│   ├── routes/                 # authRoutes, projectRoutes, analyticsRoutes, index.js
│   ├── seed.js                 # Seeder admin default & sampel proyek teknis
│   ├── .env.example
│   └── server.js               # Entrypoint Express server
└── README.md
```

---

## 3. Persiapan Lingkungan & Instalasi

### Spesifikasi Target Ubuntu Server (10.100.30.57)
- **Node.js**: v20.x atau v22.x LTS
- **MariaDB Server**: Port 3306
  - User: `admin`
  - Password: `labbnbr@123`
  - Database: `devshowcase_db`
- **MongoDB**: Port 27017
  - URI: `mongodb://127.0.0.1:27017/devshowcase_db`

### Langkah 1: Setup Backend
```bash
cd devshowcase/server

# Salin konfigurasi environment
cp .env.example .env

# Pasang dependensi
npm install

# Jalankan seeder database (membuat akun admin & 2 proyek sampel)
npm run seed

# Jalankan server Express (development)
npm run dev
# Atau mode production:
npm start
```
*Backend akan berjalan di `http://0.0.0.0:5001` (Health check: `http://localhost:5001/api/health`).*

### Langkah 2: Setup Frontend
```bash
cd devshowcase/client

# Salin konfigurasi environment
cp .env.example .env

# Pasang dependensi
npm install

# Jalankan Vite development server
npm run dev
```
*Frontend akan dapat diakses di `http://localhost:5173` atau `http://10.100.30.57:5173`.*

---

## 4. Kredensial Default Seeder

Setelah menjalankan `npm run seed`:
- **URL Admin Login:** `http://localhost:5173/admin/login`
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `admin`

*(Tersedia tombol satu-klik "Autofill: admin / admin123" pada halaman login).*

---

## 5. Ringkasan Endpoint API

### A. Autentikasi (`/api/auth`)
| Metode | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/login` | Publik | Otentikasi username/password, mengembalikan token JWT |
| `GET` | `/api/auth/me` | User | Mengambil data sesi pengguna dari token |
| `POST` | `/api/auth/logout` | User | Mengakhiri sesi dan membersihkan cookie |

### B. Proyek (`/api/projects`)
| Metode | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/projects` | Publik | Mengambil daftar proyek (filter: `category`, `tag`, `search`, `featured`) |
| `GET` | `/api/projects/tags` | Publik | Mengambil seluruh daftar tag tech-stack |
| `GET` | `/api/projects/:slug` | Publik | **Merged Endpoint**: Menggabungkan data MariaDB & dokumen MongoDB |
| `POST` | `/api/projects` | Admin | **Atomic Dual-Store Create**: Transaksi SQL + upsert MongoDB |
| `PUT` | `/api/projects/:id` | Admin | **Atomic Dual-Store Update**: Memperbarui MariaDB & MongoDB |
| `DELETE` | `/api/projects/:id` | Admin | **Atomic Dual-Store Delete**: Menghapus data dari MariaDB & MongoDB |

### C. Telemetri & Analitik (`/api/analytics`)
| Metode | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/analytics/overview` | Admin | KPI total proyek, total kunjungan, waktu respon rata-rata |
| `GET` | `/api/analytics/trend` | Admin | Agregasi data time-series harian untuk grafik Recharts |
| `GET` | `/api/analytics/logs` | Admin | Log audit mentah MongoDB dengan pagination dan filter |

### D. Health Check
| Metode | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/health` | Publik | Memeriksa koneksi simultan MariaDB dan MongoDB |

---

## 6. Integrasi Cloudflare Tunnel

Untuk mengekspos server lokal Ubuntu (`10.100.30.57`) ke domain publik via Cloudflare Tunnel:

1. Unduh dan autentikasi daemon `cloudflared`:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create devshowcase
   ```

2. Konfigurasi file `/etc/cloudflared/config.yml`:
   ```yaml
   tunnel: <TUNNEL_UUID>
   credentials-file: /etc/cloudflared/<TUNNEL_UUID>.json

   ingress:
     # Frontend Client
     - hostname: showcase.yourdomain.com
       service: http://127.0.0.1:5173

     # Backend API
     - hostname: api-showcase.yourdomain.com
       service: http://127.0.0.1:5001

     - service: http_status:404
   ```

3. Jalankan daemon:
   ```bash
   cloudflared tunnel run devshowcase
   ```
*Middleware `auditLogger.js` pada backend Express secara otomatis membaca header `cf-connecting-ip` yang dikirim Cloudflare untuk mencatat IP riil pengunjung ke MongoDB.*

---

## 7. Lisensi
Didistribusikan di bawah lisensi MIT.
