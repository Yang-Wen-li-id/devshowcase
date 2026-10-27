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
  console.log('🚀 Starting DevShowcase Clean Data Refresh & Seeder');
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

    // 3. CLEAN EXISTING PROJECT DATA (Reset as requested)
    console.log('[4/5] Resetting existing dummy data in MariaDB & MongoDB...');
    
    // Clear MariaDB pivot and project tables safely
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await sequelize.query('TRUNCATE TABLE project_tags;');
    await Project.destroy({ where: {}, truncate: true });
    await Tag.destroy({ where: {}, truncate: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('  ✓ Cleared MariaDB tables: projects, project_tags, tags.');

    // Clear MongoDB ProjectDetail collection
    await ProjectDetail.deleteMany({});
    console.log('  ✓ Cleared MongoDB collection: project_details.');

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

    // 5. Seed Real Technical Projects
    console.log('[5/5] Seeding 4 Real Technical Projects & Case Studies...');

    // Helper to get or create tag
    const getTag = async (name, icon = 'code') => {
      const [tagRecord] = await Tag.findOrCreate({
        where: { name },
        defaults: { name, icon_class: icon },
      });
      return tagRecord;
    };

    // =========================================================================
    // PROYEK 1: Praktis — Computer Science Practical Management System (Web App)
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
    console.log(`  ✓ Project 1 seeded: "${p1.title}" (ID: ${p1.id})`);

    // =========================================================================
    // PROYEK 2: Enterprise Hybrid Multi-Site SD-WAN Mesh (Network Topology)
    // =========================================================================
    const p2 = await Project.create({
      title: 'Enterprise Hybrid SD-WAN & Zero Trust Network Mesh',
      slug: 'enterprise-sdwan-zerotrust-mesh',
      category: 'Network Topology',
      repo_url: 'https://github.com/developer/enterprise-sdwan-mesh',
      demo_url: 'https://network-mesh.demo.site',
      license: 'Apache-2.0',
      featured: true,
    });

    const p2Tags = await Promise.all([
      getTag('WireGuard'),
      getTag('BGP Routing'),
      getTag('Linux'),
      getTag('Docker'),
      getTag('Cloudflare Tunnel'),
      getTag('eBPF'),
    ]);
    await p2.setTags(p2Tags);

    const markdownDoc2 = `
# Enterprise Hybrid SD-WAN & Zero Trust Network Mesh

## 1. Latar Belakang & Kebutuhan Arsitektur
Menghubungkan kantor cabang regional dan private cloud data center dengan keamanan tingkat enterprise, enkripsi end-to-end, dan mekanisme dynamic failover sub-detik tanpa ketergantungan pada sirkuit sewa MPLS yang mahal.

Proyek ini mengimplementasikan topologi **WireGuard Full-Mesh SD-WAN** yang diorkestrasi dengan routing protocol BGP (Border Gateway Protocol) dan deteksi kesehatan link BFD (Bidirectional Forwarding Detection).

\`\`\`
+-------------------+        WireGuard Encrypted Mesh       +-------------------+
| Branch Office JKT | <===================================> | Branch Office SBY |
| Subnet 10.10.0/24 |                                       | Subnet 10.20.0/24 |
+-------------------+                                       +-------------------+
          ||                                                          ||
          || BGP Dynamic Path                                         ||
          \\/                                                          \\/
+-------------------------------------------------------------------------------+
|                       Primary Cloud Data Center Gateway                       |
|                       Subnet: 10.100.0.0/16 | BGP AS: 64512                   |
+-------------------------------------------------------------------------------+
\`\`\`

## 2. Pengujian & Performa
- **Throughput Enkripsi:** 9.4 Gbps line-rate pada link 10GbE dengan utilisasi CPU gateway di bawah 20%.
- **Failover Convergence:** Waktu pemulihan rute otomatis saat link fiber optik utama terputus adalah **340 milidetik** tanpa memutus sesi koneksi TCP aktif.
`;

    await ProjectDetail.create({
      projectId: p2.id,
      markdownContent: markdownDoc2.trim(),
      architectureDiagramUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
      systemSpecs: {
        'Routing Core': 'BGP + WireGuard Full Mesh (Linux FRRouting)',
        'Operating System': 'Ubuntu 24.04 LTS (Optimized Kernel 6.8)',
        'Network Interface': 'Dual 10GbE SFP+ Mellanox ConnectX-4',
        'Encryption Protocol': 'ChaCha20-Poly1305 / Curve25519',
        'Failover Latency': '< 350 ms (BFD Link Detection)',
        'Security Policy': 'Zero Trust Network Access (ZTNA)',
      },
      changelog: [
        {
          version: 'v1.3.0',
          releaseDate: new Date('2026-03-20'),
          notes: 'Migrasi paket filter ke eBPF dan penambahan auto MTU discovery.',
        },
        {
          version: 'v1.2.0',
          releaseDate: new Date('2026-01-15'),
          notes: 'Integrasi connector Zero Trust untuk admin console remote.',
        },
        {
          version: 'v1.0.0',
          releaseDate: new Date('2025-10-01'),
          notes: 'Rilis inisial topologi mesh multi-site 3 lokasi regional.',
        },
      ],
    });
    console.log(`  ✓ Project 2 seeded: "${p2.title}" (ID: ${p2.id})`);

    // =========================================================================
    // PROYEK 3: High-Frequency Market Sentiment Stream & Telemetry (Web App)
    // =========================================================================
    const p3 = await Project.create({
      title: 'High-Frequency Market Sentiment Stream & Telemetry Engine',
      slug: 'high-frequency-market-sentiment-engine',
      category: 'Web App',
      repo_url: 'https://github.com/developer/financial-sentiment-stream',
      demo_url: 'https://finance-stream.demo.site',
      license: 'MIT',
      featured: false,
    });

    const p3Tags = await Promise.all([
      getTag('React 19'),
      getTag('Node.js'),
      getTag('Express.js'),
      getTag('Sequelize'),
      getTag('MongoDB'),
      getTag('Redis'),
      getTag('Recharts'),
    ]);
    await p3.setTags(p3Tags);

    const markdownDoc3 = `
# High-Frequency Market Sentiment Stream & Telemetry Engine

## 1. Arsitektur Pemisahan Beban Kerja Transaksional & Streaming
Sistem analitik finansial real-time yang memproses ribuan data berita pasar saham dan media sosial per detik untuk menghasilkan skor sentimen instrumen portofolio.

- **Relational ACID Store:** Mengelola portofolio pengguna, pencatatan transaksi eksekusi, dan preferensi sinyal pasar.
- **Unstructured Document & Telemetry Store:** Menangani aliran data mentah berita dan log audit berkecepatan tinggi dengan pipeline agregasi dinamis.

\`\`\`
[ Raw Financial Streams ] ---> [ Node.js NLP Worker ]
                                      ||
             +------------------------+------------------------+
             ||                                                ||
             \\/                                                \\/
    [ MariaDB Relational ]                            [ MongoDB Telemetry ]
   Portofolio & Transaksi                            Data Stream & Footprint
\`\`\`

## 2. Kinerja
- Visualisasi grafik Recharts interaktif merender 10.000 titik data secara mulus pada 60 FPS.
- Kapasitas throughput stream ingestion mencapai 15.000 pesan per detik dengan Redis buffer.
`;

    await ProjectDetail.create({
      projectId: p3.id,
      markdownContent: markdownDoc3.trim(),
      architectureDiagramUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      systemSpecs: {
        'Frontend': 'React 19, Tailwind CSS, Recharts 2.x',
        'Stream Protocol': 'WebSocket, Server-Sent Events (SSE)',
        'Relational Database': 'MariaDB 11 (Transactional Accounts)',
        'Document Database': 'MongoDB 7 (Stream Ingestion & Telemetry)',
        'Message Broker': 'Redis 7 In-Memory Pub/Sub',
        'Throughput': '15,000 events/second capacity',
      },
      changelog: [
        {
          version: 'v2.1.0',
          releaseDate: new Date('2026-02-28'),
          notes: 'Optimasi query pipeline untuk latency dashboard di bawah 20 ms.',
        },
        {
          version: 'v1.0.0',
          releaseDate: new Date('2026-01-10'),
          notes: 'Rilis beta dengan dukungan visualisasi candlestick interaktif.',
        },
      ],
    });
    console.log(`  ✓ Project 3 seeded: "${p3.title}" (ID: ${p3.id})`);

    // =========================================================================
    // PROYEK 4: Distributed Game Server Cluster & Low-Latency Matchmaking (Game Dev)
    // =========================================================================
    const p4 = await Project.create({
      title: 'Distributed Game Server Cluster & Low-Latency Matchmaking',
      slug: 'distributed-game-server-k8s',
      category: 'Game Dev',
      repo_url: 'https://github.com/developer/k8s-game-cluster',
      demo_url: 'https://game-cluster.demo.site',
      license: 'MIT',
      featured: false,
    });

    const p4Tags = await Promise.all([
      getTag('Unity 3D'),
      getTag('C#'),
      getTag('Docker'),
      getTag('Kubernetes'),
      getTag('Linux'),
      getTag('gRPC'),
    ]);
    await p4.setTags(p4Tags);

    const markdownDoc4 = `
# Distributed Game Server Cluster & Low-Latency Matchmaking

## 1. Ikhtisar Sistem
Orkestrasi klaster server game multipemain interaktif berbasis Kubernetes dengan Agones operator. Menyediakan alokasi ruangan game dinamis, sinkronisasi state server-authoritative, dan optimasi paket UDP latensi ultra-rendah.

## 2. Parameter Kinerja
- Dedicated server loop berjalan stabil pada 60 Hz tick-rate di kernel Linux headless.
- Matchmaking allocator gRPC memasangkan pemain regional dalam waktu rata-rata kurang dari 45 milidetik.
`;

    await ProjectDetail.create({
      projectId: p4.id,
      markdownContent: markdownDoc4.trim(),
      architectureDiagramUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      systemSpecs: {
        'Engine / Runtime': 'Unity 6 Dedicated Headless Linux Build',
        'Cluster Orchestration': 'Kubernetes 1.30 with Agones Operator',
        'Transport Protocol': 'UDP + KCP Serialization',
        'Simulation Tick': '60 Hz Authoritative Loop',
        'Allocator Service': 'gRPC High-Performance Microservice',
        'Containerization': 'Docker Distroless Container Image',
      },
      changelog: [
        {
          version: 'v1.1.0',
          releaseDate: new Date('2026-03-05'),
          notes: 'Integrasi Agones autoscaling fleet untuk pemulihan node otomatis.',
        },
        {
          version: 'v1.0.0',
          releaseDate: new Date('2025-11-20'),
          notes: 'Peluncuran inisial klaster 50-player multiplayer arena.',
        },
      ],
    });
    console.log(`  ✓ Project 4 seeded: "${p4.title}" (ID: ${p4.id})`);

    // 6. Seed sample access telemetry logs for admin analytics
    console.log('  -> Generating initial telemetry access logs for analytics...');
    const sampleLogs = [];
    const paths = [
      `/api/projects/${p1.slug}`,
      `/api/projects/${p2.slug}`,
      `/api/projects/${p3.slug}`,
      `/api/projects/${p4.slug}`,
      '/api/projects',
    ];
    const ips = ['10.100.30.57', '180.252.12.8', '114.124.201.3', '127.0.0.1', '103.145.22.90'];

    const now = Date.now();
    for (let i = 0; i < 40; i++) {
      const path = paths[Math.floor(Math.random() * paths.length)];
      let targetProjectId = null;
      if (path.includes(p1.slug)) targetProjectId = p1.id;
      else if (path.includes(p2.slug)) targetProjectId = p2.id;
      else if (path.includes(p3.slug)) targetProjectId = p3.id;
      else if (path.includes(p4.slug)) targetProjectId = p4.id;

      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = new Date(now - (daysAgo * 86400000 + hoursAgo * 3600000));

      sampleLogs.push({
        timestamp,
        path,
        targetProjectId,
        ipAddress: ips[Math.floor(Math.random() * ips.length)],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        responseTimeMs: Math.floor(Math.random() * 22) + 8,
      });
    }

    await AccessLog.deleteMany({});
    await AccessLog.insertMany(sampleLogs);
    console.log(`  ✓ Inserted ${sampleLogs.length} initial telemetry access logs.`);

    console.log('====================================================');
    console.log('🎉 Data Refresh & Seeding completed successfully!');
    console.log('Admin Account:');
    console.log('  Username : admin');
    console.log('  Password : admin123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedDatabase();
