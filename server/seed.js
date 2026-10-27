const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize, User, Project, Tag } = require('./models/sql');
const ProjectDetail = require('./models/nosql/ProjectDetail');
const AccessLog = require('./models/nosql/AccessLog');
const { connectMariaDB, syncMariaDB } = require('./config/db.mariadb');
const { connectMongoDB } = require('./config/db.mongodb');

const seedDatabase = async () => {
  console.log('====================================================');
  console.log('🚀 Starting DevShowcase Clean Seeder (Praktis LMS)');
  console.log('====================================================');

  try {
    // 1. Establish connections
    console.log('[1/5] Connecting to MariaDB...');
    const mariaConnected = await connectMariaDB();
    if (!mariaConnected) {
      throw new Error('MariaDB connection failed. Please ensure MariaDB is running.');
    }

    console.log('[2/5] Connecting to MongoDB...');
    const mongoConnected = await connectMongoDB();
    if (!mongoConnected) {
      throw new Error('MongoDB connection failed. Please ensure MongoDB is running.');
    }

    // 2. Synchronize MariaDB schema
    console.log('[3/5] Synchronizing MariaDB SQL tables...');
    await syncMariaDB(false);

    // 3. CLEAN EXISTING PROJECT DATA (Reset)
    console.log('[4/5] Resetting existing data in MariaDB & MongoDB...');
    
    // Clear MariaDB pivot and project tables safely
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await sequelize.query('TRUNCATE TABLE project_tags;');
    await Project.destroy({ where: {}, truncate: true });
    await Tag.destroy({ where: {}, truncate: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('  ✓ Cleared MariaDB tables: projects, project_tags, tags.');

    // Clear MongoDB ProjectDetail and AccessLog collection
    await ProjectDetail.deleteMany({});
    await AccessLog.deleteMany({});
    console.log('  ✓ Cleared MongoDB collections: project_details, access_logs.');

    // 4. Seed Default Admin User
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);

    const [adminUser] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@devshowcase.local',
        password_hash: adminPasswordHash,
        role: 'admin',
      },
    });
    console.log(`  ✓ Admin user verified: "${adminUser.username}" (role: ${adminUser.role})`);

    // 5. Seed Real Technical Project: Praktis LMS
    console.log('[5/5] Seeding Project: Praktis - Computer Science Practical Management System...');

    const getTag = async (name, icon = 'code') => {
      const [tagRecord] = await Tag.findOrCreate({
        where: { name },
        defaults: { name, icon_class: icon },
      });
      return tagRecord;
    };

    // =========================================================================
    // PROYEK: Praktis — Computer Science Practical Management System (Web App)
    // =========================================================================
    const p1 = await Project.create({
      title: 'Praktis - Computer Science Practical Management System',
      slug: 'praktis-lab-management',
      category: 'Web App',
      repo_url: 'https://github.com/Pantengineer/Praktis-Group-Project',
      demo_url: 'https://praktis-project.site',
      license: 'MIT',
      featured: true,
    });

    const p1Tags = await Promise.all([
      getTag('React 19'),
      getTag('Vite'),
      getTag('Express.js'),
      getTag('Sequelize'),
      getTag('MongoDB'),
      getTag('Docker'),
      getTag('Bootstrap 5'),
    ]);
    await p1.setTags(p1Tags);

    const markdownDoc1 = `
# Praktis — Computer Science Practical Management System

## 1. Executive Summary & Problem Statement
Sistem Manajemen Laboratorium dan Praktikum (LMS) berskala penuh untuk program studi Ilmu Komputer. Menghadirkan kontrol akses multi-role (Admin, Asisten Dosen, Mahasiswa), deteksi bentrok jadwal ruang praktikum secara real-time, sistem anti-abuse pengunggahan berkas 5 lapis (kuota 100MB/mahasiswa, rate limiter, MIME validation, ENOSPC interceptor), serta sistem pemulihan akun otomatis via SMTP token SHA-256.

Sebelum adanya platform Praktis, pengelolaan praktikum dilakukan secara terfragmentasi melalui spreadsheet dan Google Drive, yang sering mengakibatkan:
- Bentrok penggunaan laboratorium komputer antar-kelas.
- Kebocoran kuota disk server akibat unggahan berkas zip/source code mahasiswa tanpa kuota per-kapita.
- Sulitnya pelacakan tugas praktikum dan penilaian asisten dosen secara terstruktur.

\`\`\`
+--------------------+        +--------------------+        +--------------------+
|   Role Mahasiswa   |        | Role Asisten Dosen |        |     Role Admin     |
| Unggah Tugas & Lap |        | Penilaian & Koreksi|        | Jadwal & Manajemen |
+--------------------+        +--------------------+        +--------------------+
          ||                            ||                            ||
          \\/                            \\/                            \\/
+--------------------------------------------------------------------------------+
|                        Praktis Web Application Gateway                         |
|                    React 19 + Express.js REST API Layer                        |
+--------------------------------------------------------------------------------+
             ||                                                    ||
             \\/                                                    \\/
+---------------------------+                        +---------------------------+
|    MariaDB 11 (Relasional)|                        | MongoDB 7 (Document Store)|
| Entitas Akademik & User   |                        | Audit Log & Modul Tugas   |
+---------------------------+                        +---------------------------+
\`\`\`

## 2. Arsitektur Teknis & Mekanisme Pertahanan Berkas 5-Lapis
Untuk melindungi stabilitas server praktikum saat ratusan mahasiswa mengumpulkan tugas secara bersamaan, platform Praktis menerapkan arsitektur *Five-Layer File Upload Defense*:
1. **Per-Student Storage Quota Engine**: Membatasi total akumulasi file maksimal 100 MB per mahasiswa secara atomik.
2. **Dynamic Rate Limiting**: Membatasi maksimum 15 unggahan per menit per IP address untuk mencegah serangan DoS.
3. **Deep MIME & Magic-Number Validation**: Memeriksa header biner berkas asli, menolak file eksekusi berbahaya (*.exe, *.sh, *.php).
4. **ENOSPC Interceptor**: Memantau kapasitas disk fisik server secara real-time sebelum menerima streaming multipart/form-data.
5. **Secure Cryptographic Hash Token**: Enkripsi dan penamaan acak pada media storage lokal dengan pemulihan akun via token SHA-256 SMTP.

## 3. Fitur Utama & Kinerja
- **Real-Time Schedule Conflict Detector**: Algoritma deteksi bentrok ruangan dan asisten dosen saat plotting jadwal praktikum baru.
- **Role-Based Access Control (RBAC)**: Pemisahan hak akses strictly enforced untuk Mahasiswa, Asisten, dan Kepala Laboratorium.
- **Automated Gradebook Calculation**: Perhitungan otomatis nilai akhir praktikum berdasarkan bobot modul dan kriteria penilaian.
`;

    await ProjectDetail.create({
      projectId: p1.id,
      markdownContent: markdownDoc1.trim(),
      architectureDiagramUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      systemSpecs: {
        'Frontend': 'React 19, Vite, Framer Motion, Bootstrap 5',
        'Backend': 'Express REST API, JWT Authentication, Multer',
        'Database Architecture': 'Dual-Database (Relational Core + Unstructured Content & Telemetry)',
        'Deployment': 'Docker Compose Orchestration',
        'Storage Quota': '100 MB per-student hard quota',
        'Authentication': 'JWT Cookie HttpOnly + bcrypt + SHA-256 Recovery Token',
      },
      changelog: [
        {
          version: 'v2.0.0',
          releaseDate: new Date('2026-03-10'),
          notes: 'Migrasi core frontend ke React 19 dan integrasi 5-layer upload defense engine.',
        },
        {
          version: 'v1.2.0',
          releaseDate: new Date('2026-01-20'),
          notes: 'Implementasi real-time schedule conflict detector untuk ruangan laboratorium.',
        },
        {
          version: 'v1.0.0',
          releaseDate: new Date('2025-09-15'),
          notes: 'Rilis inisial platform Praktis untuk program studi Ilmu Komputer.',
        },
      ],
    });
    console.log(`  ✓ Project seeded: "${p1.title}" (ID: ${p1.id})`);

    // 6. Seed sample access telemetry logs for admin analytics
    console.log('  -> Generating initial telemetry access logs for analytics...');
    const sampleLogs = [];
    const paths = [
      `/api/projects/${p1.slug}`,
      '/api/projects',
      '/api/projects/tags',
    ];
    const ips = ['10.100.30.57', '180.252.12.8', '114.124.201.3', '127.0.0.1', '103.145.22.90'];

    const now = Date.now();
    for (let i = 0; i < 35; i++) {
      const path = paths[Math.floor(Math.random() * paths.length)];
      const targetProjectId = path.includes(p1.slug) ? p1.id : null;

      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = new Date(now - (daysAgo * 86400000 + hoursAgo * 3600000));

      sampleLogs.push({
        timestamp,
        path,
        targetProjectId,
        ipAddress: ips[Math.floor(Math.random() * ips.length)],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        responseTimeMs: Math.floor(Math.random() * 20) + 7,
      });
    }

    await AccessLog.insertMany(sampleLogs);
    console.log(`  ✓ Inserted ${sampleLogs.length} initial telemetry access logs.`);

    console.log('====================================================');
    console.log('🎉 Data Refresh & Seeding completed successfully!');
    console.log('Project: Praktis - Computer Science Practical Management System');
    console.log('Admin Account: admin / admin123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedDatabase();
