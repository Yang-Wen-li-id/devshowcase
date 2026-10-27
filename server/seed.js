const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize, User, Project, Tag } = require('./models/sql');
const ProjectDetail = require('./models/nosql/ProjectDetail');
const AccessLog = require('./models/nosql/AccessLog');
const { connectMariaDB, syncMariaDB } = require('./config/db.mariadb');
const { connectMongoDB, mongoose } = require('./config/db.mongodb');

const seedDatabase = async () => {
  console.log('====================================================');
  console.log('🚀 Starting DevShowcase Dual-Database Seeder Script');
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

    // 2. Synchronize MariaDB schema (safe force/alter)
    console.log('[3/5] Synchronizing MariaDB SQL tables...');
    await syncMariaDB(true);

    // 3. Seed Default Admin & Viewer Users
    console.log('[4/5] Seeding Users into MariaDB...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const viewerPasswordHash = await bcrypt.hash('viewer123', salt);

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

    const [viewerUser] = await User.findOrCreate({
      where: { username: 'viewer' },
      defaults: {
        username: 'viewer',
        email: 'viewer@devshowcase.local',
        password_hash: viewerPasswordHash,
        role: 'viewer',
      },
    });
    console.log(`  ✓ Viewer user verified: "${viewerUser.username}" (role: ${viewerUser.role})`);

    // 4. Seed Predefined Tags
    console.log('[5/5] Seeding Tags, Projects, and MongoDB Documents...');
    const tagList = [
      { name: 'React', icon_class: 'atom' },
      { name: 'Node.js', icon_class: 'server' },
      { name: 'Express', icon_class: 'cpu' },
      { name: 'MariaDB', icon_class: 'database' },
      { name: 'MongoDB', icon_class: 'layers' },
      { name: 'WireGuard', icon_class: 'shield' },
      { name: 'Linux', icon_class: 'terminal' },
      { name: 'Docker', icon_class: 'box' },
      { name: 'Cloudflare Tunnel', icon_class: 'cloud' },
      { name: 'Tailwind CSS', icon_class: 'palette' },
      { name: 'Unity 3D', icon_class: 'gamepad' },
      { name: 'C#', icon_class: 'code' },
    ];

    const tagRecords = {};
    for (const t of tagList) {
      const [record] = await Tag.findOrCreate({
        where: { name: t.name },
        defaults: t,
      });
      tagRecords[t.name] = record;
    }
    console.log(`  ✓ Seeded ${Object.keys(tagRecords).length} tech-stack tags.`);

    // 5. Seed Project 1: Network Topology
    const project1Data = {
      title: 'Enterprise Multi-Site SD-WAN & Zero Trust Mesh',
      slug: 'enterprise-multisite-sdwan-zero-trust',
      category: 'Network Topology',
      repo_url: 'https://github.com/developer/enterprise-sdwan-mesh',
      demo_url: 'https://sdwan.demo.devshowcase.local',
      license: 'Apache-2.0',
      featured: true,
    };

    const [project1] = await Project.findOrCreate({
      where: { slug: project1Data.slug },
      defaults: project1Data,
    });

    await project1.setTags([
      tagRecords['WireGuard'],
      tagRecords['Linux'],
      tagRecords['Cloudflare Tunnel'],
      tagRecords['Docker'],
    ]);

    const markdownDoc1 = `
# Enterprise Multi-Site SD-WAN & Zero Trust Mesh

## 1. Executive Summary & Problem Statement
Perusahaan enterprise modern membutuhkan konektivitas antar-cabang (branch offices) dan multi-region cloud datacenter yang memiliki latensi ultra-rendah, enkripsi tingkat militer, serta tanpa mengekspos port publik secara telanjang ke internet. Solusi IPsec legacy seringkali membebani CPU, lambat saat failover, dan sulit diaudit.

Proyek ini merancang dan mengimplementasikan arsitektur **SD-WAN Mesh hybrid** berbasis protokol WireGuard yang dipadukan dengan **Cloudflare Zero Trust Connector** untuk orkestrasi akses dinamis dan enkripsi L3/L4 end-to-end.

\`\`\`
+------------------+         Encrypted WireGuard Mesh        +------------------+
| Branch Site A    | <=====================================> | Branch Site B    |
| 10.10.10.0/24    |                                         | 10.10.20.0/24    |
+------------------+                                         +------------------+
        ||                                                            ||
        || BGP Failover Route                                         ||
        \\/                                                            \\/
+-------------------------------------------------------------------------------+
|                      Central Datacenter Gateway Hub                           |
|                      Subnet: 10.100.0.0/16 | BGP AS: 64512                   |
|                      Cloudflare Tunnel Ingress Endpoint                       |
+-------------------------------------------------------------------------------+
\`\`\`

## 2. Arsitektur Teknis & Topologi Jaringan
1. **Routing Protocol:** Dynamic Routing via BGP (Border Gateway Protocol) dengan BFD (Bidirectional Forwarding Detection) untuk sub-second link failover.
2. **Kriptografi:** Kunci privat Curve25519 dan simetris ChaCha20-Poly1305 untuk proteksi tamper-proof.
3. **Audit Trail:** Seluruh handshake log dan paket anomali diforward ke pipeline MongoDB AccessLogs secara real-time.

### Cuplikan Konfigurasi WireGuard Gateway (\`/etc/wireguard/wg0.conf\`):
\`\`\`ini
[Interface]
Address = 10.100.30.1/24
PrivateKey = aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890=
ListenPort = 51820
SaveConfig = false

# Post-routing NAT rules for local subnets
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Site B Branch Peer
[Peer]
PublicKey = XyZ1234567890aBcDeFgHiJkLmNoPqRsTuVw=
AllowedIPs = 10.10.20.0/24, 10.100.30.2/32
Endpoint = 198.51.100.25:51820
PersistentKeepalive = 25
\`\`\`

## 3. Hasil Pengujian & Benchmark
- **Throughput:** Mencapai 9.4 Gbps pada link 10GbE dengan utilisasi CPU gateway di bawah 22%.
- **Failover Convergence:** Waktu pemulihan rute saat primary fiber link down adalah **340 milidetik** tanpa pemutusan sesi TCP aktif.
`;

    await ProjectDetail.findOneAndUpdate(
      { projectId: project1.id },
      {
        projectId: project1.id,
        markdownContent: markdownDoc1.trim(),
        architectureDiagramUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
        systemSpecs: {
          'Routing Core': 'BGP + WireGuard Full Mesh (Linux FRRouting)',
          'Operating System': 'Ubuntu 24.04 LTS (Optimized Kernel 6.8)',
          'Gateway Interface': 'Dual 10GbE SFP+ Mellanox ConnectX-4',
          'Tunnel Encryption': 'ChaCha20-Poly1305 / Curve25519',
          'Failover Latency': '< 350 ms (BFD Link Detection)',
          'Cloudflare Ingress': 'Cloudflared Tunnel Daemon v2025.2',
        },
        changelog: [
          {
            version: 'v1.3.0',
            releaseDate: new Date('2026-03-20'),
            notes: 'Pembaruan MTU auto-discovery dan migrasi ke kernel 6.8 with eBPF filter.',
          },
          {
            version: 'v1.2.0',
            releaseDate: new Date('2026-01-15'),
            notes: 'Implementasi Cloudflare Tunnel Zero Trust policy untuk admin dashboard.',
          },
          {
            version: 'v1.0.0',
            releaseDate: new Date('2025-10-01'),
            notes: 'Rilis inisial topologi mesh 3 site dengan failover otomatis.',
          },
        ],
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Project 1 seeded: "${project1.title}" (SQL ID: ${project1.id})`);

    // 6. Seed Project 2: High-Frequency Stock Sentiment Analysis & Visualizer
    const project2Data = {
      title: 'Real-Time Financial Sentiment Engine & Market Analytics',
      slug: 'realtime-financial-sentiment-analytics',
      category: 'Web App',
      repo_url: 'https://github.com/developer/financial-sentiment-engine',
      demo_url: 'https://finance.demo.devshowcase.local',
      license: 'MIT',
      featured: true,
    };

    const [project2] = await Project.findOrCreate({
      where: { slug: project2Data.slug },
      defaults: project2Data,
    });

    await project2.setTags([
      tagRecords['React'],
      tagRecords['Node.js'],
      tagRecords['Express'],
      tagRecords['MariaDB'],
      tagRecords['MongoDB'],
      tagRecords['Tailwind CSS'],
    ]);

    const markdownDoc2 = `
# Real-Time Financial Sentiment Engine & Market Analytics

## 1. Latar Belakang & Pembagian Dual-Database
Dalam pasar modal dan aset kripto, fluktuasi sentimen berita dan media sosial berkorelasi langsung terhadap likuiditas order book. Aplikasi ini dibangun dengan paradigma **Dual-Database Architecture** yang memisahkan beban kerja relasional dan dokumen mentah:

- **MariaDB (Sequelize):**
  - Mengelola data transaksi finansial terstruktur yang membutuhkan kepatuhan ACID tinggi.
  - Tabel akun pengguna, portofolio aset, preferensi alert, dan relasi tag instrumen pasar.
- **MongoDB (Mongoose):**
  - Mengelola aliran data tidak terstruktur (streaming tweets, siaran pers, transkrip earning calls).
  - Skema dinamis untuk matriks sentimen NLP, time-series telemetry, dan access logs.

\`\`\`
[ Data Streams (Bloomberg, News, Twitter) ]
                   ||
                   \\/
        +-----------------------+
        |  Node.js Ingestion    |
        |  NLP Sentiment Parser |
        +-----------------------+
           //               \\\\
    (Relational)        (Raw Telemetry)
         //                   \\\\
        \\/                     \\/
+-------------------+   +--------------------+
| MariaDB (SQL)     |   | MongoDB (NoSQL)    |
| Portfolios, Users |   | Stream Ingestion & |
| Project Master    |   | Access Footprint   |
+-------------------+   +--------------------+
         \\\\                   //
          \\/                 \\/
        +-----------------------+
        |  Express REST API     |
        |  & Recharts Visualizer|
        +-----------------------+
\`\`\`

## 2. Implementasi Pipeline Gabungan (SQL + NoSQL)
\`\`\`javascript
// Cuplikan Controller Penggabungan Data
const getAssetAnalytics = async (ticker) => {
  // 1. Ambil data entitas terstruktur dari MariaDB
  const assetProfile = await MariaDB.Asset.findOne({ where: { ticker } });
  
  // 2. Ambil telemetry log & aggregate sentiment 24 jam terakhir dari MongoDB
  const sentimentDocs = await MongoDB.SentimentLog.aggregate([
    { $match: { assetId: assetProfile.id, timestamp: { $gte: twentyFourHoursAgo } } },
    { $group: { _id: '$sentimentLabel', count: { $sum: 1 }, avgScore: { $avg: '$score' } } }
  ]);
  
  return { ...assetProfile.toJSON(), telemetry: sentimentDocs };
};
\`\`\`

## 3. Fitur Utama & Kinerja
- **Latency Rendering:** Visualisasi grafik candlestick & sentimen Recharts merender 10.000 data point dalam waktu **< 16 ms**.
- **Integritas Transaksi:** 100% konsistensi saldo portofolio dengan Sequelize database isolation level \`READ COMMITTED\`.
`;

    await ProjectDetail.findOneAndUpdate(
      { projectId: project2.id },
      {
        projectId: project2.id,
        markdownContent: markdownDoc2.trim(),
        architectureDiagramUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
        systemSpecs: {
          'Frontend Library': 'React 19 + Vite 6 + Tailwind CSS',
          'Data Visualization': 'Recharts 2.x (Interactive Area & Bar Curves)',
          'Relational DB': 'MariaDB 11.4 with InnoDB Engine',
          'Document DB': 'MongoDB 7.0 Community Edition',
          'Stream Buffer': 'Redis 7 In-Memory Pub/Sub',
          'Avg API Latency': '14.2 ms (p95: 28 ms)',
        },
        changelog: [
          {
            version: 'v2.1.0',
            releaseDate: new Date('2026-02-28'),
            notes: 'Optimasi query agregasi pipeline MongoDB untuk audit telemetry real-time.',
          },
          {
            version: 'v2.0.0',
            releaseDate: new Date('2026-01-10'),
            notes: 'Migrasi UI ke React 19 dan integrasi Recharts analitik interaktif.',
          },
          {
            version: 'v1.0.0',
            releaseDate: new Date('2025-08-15'),
            notes: 'Peluncuran MVP dengan pipeline sentimen Twitter publik.',
          },
        ],
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Project 2 seeded: "${project2.title}" (SQL ID: ${project2.id})`);

    // 7. Seed Sample Access Logs in MongoDB for initial charts!
    const logCount = await AccessLog.countDocuments();
    if (logCount < 10) {
      console.log('  -> Generating initial AccessLogs telemetry data for charts...');
      const sampleLogs = [];
      const paths = [
        `/api/projects/${project1.slug}`,
        `/api/projects/${project2.slug}`,
        '/api/projects',
        '/api/projects/tags',
      ];
      const ips = ['10.100.30.57', '180.252.12.8', '114.124.201.3', '127.0.0.1', '103.145.22.90'];

      const now = Date.now();
      for (let i = 0; i < 45; i++) {
        const randomPathIndex = Math.floor(Math.random() * paths.length);
        const path = paths[randomPathIndex];
        const targetProjectId = path.includes(project1.slug)
          ? project1.id
          : path.includes(project2.slug)
          ? project2.id
          : null;

        // Spread timestamps across the last 7 days
        const daysAgo = Math.floor(Math.random() * 7);
        const hoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date(now - (daysAgo * 86400000 + hoursAgo * 3600000));

        sampleLogs.push({
          timestamp,
          path,
          targetProjectId,
          ipAddress: ips[Math.floor(Math.random() * ips.length)],
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
          responseTimeMs: Math.floor(Math.random() * 28) + 6, // 6ms - 34ms
        });
      }

      await AccessLog.insertMany(sampleLogs);
      console.log(`  ✓ Inserted ${sampleLogs.length} initial telemetry access logs.`);
    }

    console.log('====================================================');
    console.log('🎉 Seeding completed successfully!');
    console.log('Admin Account:');
    console.log('  Username : admin');
    console.log('  Password : admin123');
    console.log('  Role     : admin');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedDatabase();
