# Take-Home Technical Test — Full Stack Developer

**Bilcode Technology** · Seleksi Kandidat
Studi Kasus: **ProjectPulse — Platform Manajemen Klien & Proyek Internal**

> Dokumen ini adalah instruksi resmi pengerjaan technical test untuk kandidat yang **lolos ke tahap coding test**. Baca menyeluruh sebelum mulai. Setiap baris kode yang disubmit harus bisa kamu jelaskan saat wawancara teknis.

---

## Ringkasan

| | |
|---|---|
| **Posisi** | Full Stack Developer |
| **Estimasi waktu** | 4 hari kerja (atur ritme sesuai deadline dengan recruiter) |
| **Submission** | Repository Git (akses ke recruiter) — `backend/`, `web/`, `mobile/`, `k8s/` + `README.md` |
| **Yang diuji** | Web dev · Mobile dev · Integrasi ML · Git/GitHub · Docker & Kubernetes |

**Konteks:** Bilcode mengerjakan banyak proyek klien paralel. PM/admin butuh **web** untuk kelola klien, proyek, & task tim. Developer/desainer butuh **aplikasi mobile** untuk lihat task yang di-assign & lapor progres. Keduanya berbagi **satu backend API** yang sama, plus satu fitur berbasis **ML**.

---

## Kebebasan Teknis

- **Backend:** Laravel **atau** Next.js (API routes/Route Handlers).
- **Mobile:** pilih salah satu — **Ionic (paling diutamakan)** → React Native (setara) → **Flutter (poin preferensi terkecil)**. Semua tetap dinilai penuh dari sisi kualitas implementasi.
- **Database:** bebas (MySQL/PostgreSQL/dsb).
- **ML:** wajib pakai model/API pretrained (OpenAI/Gemini/Hugging Face). Yang dinilai **kualitas integrasi**, bukan akurasi/orisinalitas model.
- **AI coding assistant** boleh dipakai, tapi kamu wajib paham & bisa menjelaskan setiap bagian kode.

---

## Requirement Functional — Tahap Inti (WAJIB)

1. **Autentikasi** dengan role `admin` (PM, login via web) & `member` (developer/desainer, login via mobile).
2. **Admin (web):**
   - CRUD klien (nama, kontak, perusahaan)
   - CRUD proyek (nama, klien terkait, deadline, status)
   - CRUD task per proyek (judul, deskripsi, assignee, deadline, status)
   - Dashboard ringkasan (proyek aktif, task overdue, workload per anggota)
3. **Member (mobile):**
   - Lihat task yang di-assign ke dirinya (filter status)
   - Update status task: `todo → in_progress → review → done`
   - Tambah catatan progres / log waktu kerja per task
   - Lihat riwayat task selesai
4. **Fitur ML — AI-assisted task breakdown:** saat admin buat proyek baru, admin menempel brief klien (teks bebas) → sistem memanggil LLM API untuk menyarankan daftar task + kategori (`frontend`/`backend`/`design`/`QA`) + estimasi effort kasar. Admin bisa **terima/edit/hapus/tambah** saran sebelum disimpan jadi task sungguhan.
5. **Notifikasi in-app** di mobile saat member dapat task baru atau deadline mendekat (H-1).
6. **API terdokumentasi** (Postman collection atau OpenAPI/Swagger, disertakan di repo).

## Requirement Functional — Tahap Lanjutan (NILAI TAMBAH)

- Laporan jam kerja per proyek/anggota, ekspor CSV/PDF.
- Komentar/diskusi kolaboratif per task (multi-user + riwayat siapa/kapan).
- Papan Kanban drag-and-drop antar status di web.

---

## Requirement Non-Functional

- Autentikasi **berbasis token** (JWT/Sanctum/Passport) — jangan andalkan session cookie lintas web-mobile.
- **Validasi input di backend** (bukan hanya di frontend/mobile).
- Format **response error API konsisten** (status code + pesan jelas) di semua endpoint, termasuk saat LLM API gagal.
- **Fitur inti tetap jalan penuh** walau AI task breakdown sedang gagal/timeout (ML bersifat *assist*, bukan *blocking*).
- Mobile bisa jalan di emulator/simulator — sertakan screenshot/video demo singkat di README.
- **API key JANGAN di-hardcode** / ter-commit. Pakai `.env` (lokal) & `Secret`/`ConfigMap` K8s (cluster). Sertakan `.env.example` + `secret.example.yaml`.
- Image Docker `backend` & `web` bisa di-`docker build` ulang dari source tanpa langkah manual di luar dokumentasi.

---

## Containerization & Orchestration (WAJIB)

- `backend` & `web` **wajib** punya `Dockerfile` masing-masing + bisa jalan bareng via `docker-compose` (dev lokal).
- **Wajib** manifest **Kubernetes** minimal (Deployment, Service, ConfigMap/Secret, Ingress) untuk `backend` & `web`, deployable ke cluster lokal (minikube/kind/k3d). Tidak wajib deploy ke cloud production.

---

## API Minimal

```
POST   /api/auth/login | /api/auth/register
GET    /api/clients | POST /api/clients
GET    /api/projects | POST /api/projects
GET    /api/projects/:id
POST   /api/projects/:id/tasks/generate    -> saran task dari brief klien (ML)
GET    /api/projects/:id/tasks | POST /api/projects/:id/tasks
PATCH  /api/tasks/:id                       -> update task (assignee, deadline — admin)
PATCH  /api/tasks/:id/status                -> update status (member)
POST   /api/tasks/:id/time-logs             -> catatan progres/jam kerja (member)
GET    /api/tasks?assignee=&status=&project_id=
GET    /api/dashboard/summary               -> ringkasan untuk admin
```

---

## Tampilan Frontend

**Web (admin/PM):** login · dashboard ringkasan · manajemen klien (CRUD) · manajemen proyek (tempel brief → edit saran AI → simpan task) · daftar & detail task per proyek dengan filter (assignee, status).

**Mobile (member):** login · daftar task ke user (filter status) · detail task (update status, catatan progres/log waktu) · riwayat task selesai · notifikasi in-app (badge/list, push notification tidak wajib).

---

## Data Awal (Seeder/Fixture)

- 3–5 klien dummy
- 3–5 proyek, masing-masing dengan beberapa task
- Beberapa akun dummy role `admin` & `member`

---

## Struktur Folder yang Direkomendasikan

```
project-root/
├── backend/
│   ├── app/ (routes/controllers, models, services)
│   ├── app/ml/            -> integrasi LLM API (task_breakdown_client.py|ts)
│   ├── tests/
│   ├── Dockerfile
│   └── .env.example
├── web/                   -> dashboard admin/PM (Next.js/React, atau blade)
│   ├── src/{pages,components,services,hooks}
│   └── Dockerfile
├── mobile/                -> Ionic (diutamakan) / React Native / Flutter
│   └── src/ atau lib/{screens,components,services}
├── k8s/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── web-deployment.yaml
│   ├── web-service.yaml
│   ├── configmap.yaml
│   ├── secret.example.yaml
│   └── ingress.yaml
├── docker-compose.yml     -> dev lokal (wajib)
└── docs/architecture.md
```

---

## Git/GitHub

- Histori commit **granular & bermakna** (bukan satu commit besar "final code").
- Pakai branch — minimal `main` + 1 feature branch, meski dikerjakan sendiri.

## Isi README Submission (di root repo)

Instruksi menjalankan ketiganya via `docker-compose up` (dev) **dan** `kubectl apply -f k8s/` (cluster lokal), cara akses service setelah deploy, cara jalankan mobile di emulator/simulator (+ screenshot/video jika device fisik tak ada), serta link portofolio pribadi (nilai tambah).

---

## Kriteria Penilaian

Setiap aspek dinilai **1–5** oleh reviewer × bobot → skor akhir **0–100**.

| Aspek | Bobot |
|---|---|
| Web Development & Containerization/Orchestration (backend API, dashboard web, Docker, Kubernetes) | 30% |
| Mobile Development (implementasi + kesesuaian stack) | 20% |
| Integrasi ML & Error Handling/Resiliency | 25% |
| Autentikasi, Role-based Access & Database Design | 15% |
| Git/GitHub Practice & Dokumentasi | 10% |

**Catatan alokasi:**
- **Web/Orchestration (30%):** porsi signifikan khusus untuk kebenaran & kelengkapan Docker + manifest Kubernetes — bukan sekadar pelengkap.
- **Mobile (20%):** ~15% kualitas implementasi (setara Ionic/RN/Flutter) + ~5% kesesuaian stack (penuh Ionic, sebagian RN, minimal Flutter).
- **Git & Dokumentasi (10%):** terbagi rata antara histori commit/branching dan kelengkapan README + `docs/architecture.md`.

---

## Bonus Challenge

- CI/CD (GitHub Actions): lint/test → build & push image Docker tiap push ke `main`.
- Helm chart sederhana sebagai pembungkus manifest K8s (menggantikan raw YAML di `k8s/`).
- Horizontal Pod Autoscaler (HPA) pada Deployment `backend` + penjelasan trigger scaling.
- Build APK (Android)/IPA siap-install untuk demo tanpa setup environment.
- `docs/architecture.md` menjelaskan alasan pemilihan Laravel vs Next.js & Ionic vs RN vs Flutter untuk kasus ini.

---

*Dokumen Rekrutmen Bilcode Technology — Rahasia. Pertanyaan seputar teknis/deadline: hubungi recruiter melalui kanal yang telah diberikan.*
