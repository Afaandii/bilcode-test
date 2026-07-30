# Architecture Decision Document — ProjectPulse

Platform Manajemen Klien & Proyek Internal (Bilcode Technology)

---

## 1. Ringkasan Tech Stack

| Layer | Pilihan Teknologi | Alasan Pemilihan & Keunggulan |
|---|---|---|
| **Backend** | **Laravel 11 (PHP 8.3)** | Framework robust dengan ORM Eloquent, migrasi seeder bawaan, serta keamanan tinggi. Menggunakan **Laravel Sanctum** untuk Token Authentication yang ringan dan efisien lintas platform. |
| **Web (Admin/PM)** | **React 19 + Vite + Bootstrap 5** | Ekosistem React yang cepat, bundling modern berbasis Vite, serta styling responsive dengan Bootstrap 5 & Custom Vanilla CSS untuk UX modern. |
| **Mobile (Member)** | **Ionic Framework v8 + React + Capacitor v8** | Stack **paling diutamakan** pada spesifikasi technical test. Memungkinkan build lintas platform (Android/iOS/Web) menggunakan basis kode React, performa native via Capacitor, serta komponen UI khas mobile. |
| **Database** | **PostgreSQL 15** | Relational Database Management System (RDBMS) yang andal, efisien, dan siap dipaketkan dalam container Docker & Kubernetes. |
| **LLM Provider (ML)** | **Google Gemini API (`gemini-2.5-flash`)** | Performa inferensi cepat, mendukung **Structured JSON Output Schema**, dan menyediakan fallback sequence otomatis ke model Gemini Flash lainnya. |

---

## 2. Alur Data Utama

### A. Admin Membuat Proyek Baru dari Brief Klien (AI Task Breakdown)
1. **Frontend Web:** Admin mengisi formulir proyek baru dan menempelkan teks brief dari klien, lalu menekan tombol *Generate Tasks via AI*.
2. **HTTP Request:** Web mengirimkan `POST /api/projects/{id}/tasks/generate` dengan header `Authorization: Bearer <token>`.
3. **Backend Middleware:** Laravel Sanctum mengecek validitas token dan Role Middleware memastikan pengirim adalah `admin`.
4. **ML Service Invocation:** Controller memanggil `App\ml\TaskBreakdownClient::generateTasks($brief)`.
5. **Google Gemini API:** Service mengirimkan prompt beserta `generationConfig.responseSchema` ke Gemini REST API.
6. **Parsing & Validation:** Output JSON dari Gemini dibersihkan dan divalidasi (`title`, `description`, `category`, `estimated_effort`).
7. **Response ke Web:** Backend mengembalikan array daftar saran task ke Web. Admin dapat meninjau, mengubah, menambah, atau menghapus saran sebelum mengklik *Simpan Proyek & Task*.
8. **Persistensi Data:** Web mengirim `POST /api/projects/{id}/tasks` untuk menyimpan task ke PostgreSQL.

### B. Member Memperbarui Status Task & Log Waktu (Mobile App)
1. **Ionic Mobile:** Member membuka detail task di aplikasi Ionic dan mengubah status (misal `todo` → `in_progress`).
2. **HTTP Request:** Aplikasi mengirim `PATCH /api/tasks/{id}/status` dan `POST /api/tasks/{id}/time-logs`.
3. **Backend Authorization:** Sanctum mengecek token dan otorisasi role `member`.
4. **Database Update:** Status task diperbarui di database dan catatan jam kerja baru dimasukkan ke tabel `time_logs`.
5. **Notifikasi In-App:** Sistem memicu pembuatan notifikasi baru untuk member terkait.

---

## 3. Desain Skema Database

Sistem menggunakan database relasional PostgreSQL dengan skema sebagai berikut:

* **`users`**: Menyimpan akun pengguna (`id`, `name`, `email`, `password`, `role` [`admin`|`member`]).
* **`clients`**: Data klien perusahaan (`id`, `name`, `contact_email`, `phone`, `company_name`).
* **`projects`**: Data proyek (`id`, `client_id` [FK clients], `name`, `brief`, `status` [`active`|`completed`|`on_hold`], `deadline`).
* **`tasks`**: Data tugas (`id`, `project_id` [FK projects], `assignee_id` [FK users], `title`, `description`, `category` [`frontend`|`backend`|`design`|`QA`], `status` [`todo`|`in_progress`|`review`|`done`], `deadline`, `estimated_effort`).
* **`time_logs`**: Log jam kerja per task (`id`, `task_id` [FK tasks], `user_id` [FK users], `minutes_spent`, `notes`, `logged_at`).
* **`notifications`**: Notifikasi internal (`id`, `user_id` [FK users], `title`, `message`, `is_read`, `created_at`).

---

## 4. Integrasi ML — AI Task Breakdown

* **Pendekatan Prompt & Enforced Schema:** Menggunakan Google Gemini API dengan fitur `responseSchema` bertipe JSON Object. Hal ini menjamin LLM mengembalikan struktur JSON murni tanpa narasi tambahan.
* **Validasi Output:** `TaskBreakdownClient` melakukan sanitasi terhadap *markdown code fences* (` ```json `), mem-parsing JSON, dan memverifikasi ketersediaan kunci wajib per item task.
* **Model Fallback Sequence:** Jika model utama (`gemini-2.5-flash`) mengalami masalah, client secara otomatis mencoba urutan model cadangan (`gemini-flash-latest`, `gemini-1.5-flash`, `gemini-2.0-flash`).
* **Handling Failure (Resiliency):** Jika LLM API gagal/timeout atau API Key tidak valid, backend mengembalikan respon JSON error yang informatif (`success: false`). Fitur inti pembuat proyek **tetap dapat digunakan** secara manual oleh admin.

---

## 5. Autentikasi & Otorisasi

* **Token-Based Authentication:** Menggunakan Laravel Sanctum dengan token Bearer.
* **Penyimpanan Token:**
  * **Web Admin:** Disimpan di `localStorage` browser.
  * **Mobile Ionic:** Disimpan menggunakan Capacitor Preferences / Ionic Storage.
* **Role-Based Access Control (RBAC):**
  * Route divalidasi oleh custom middleware `role:admin` atau `role:member`.
  * Admin memiliki akses penuh ke manajemen Klien, Proyek, Task Breakdown, dan Dashboard Summary.
  * Member dibatasi hanya dapat melihat task yang ditugaskan kepadanya, memperbarui status task, mengisi log waktu, dan melihat notifikasi.

---

## 6. Containerization & Orchestration

* **`backend/Dockerfile`:**
  * Menggunakan base image PHP 8.3 CLI / FPM Alpine.
  * Menginstal ekstensi pdo_pgsql, zip, dan mbstring.
  * Mengoptimalkan dependency via Composer (`composer install --no-dev --optimize-autoloader`).
* **`web/Dockerfile`:**
  * Multi-stage build: Stage 1 (Node 22 Alpine) melakukan `npm run build` untuk menghasilkan bundle statis SPA di folder `/dist`.
  * Stage 2 (Nginx Alpine) menyajikan berkas statis di port **80** dengan aturan SPA routing (`try_files $uri $uri/ /index.html`).
* **Docker Compose (`docker-compose.yml`):**
  * Menggabungkan 3 service: `db` (Postgres 15 di port 5432), `backend` (port 8000), dan `web` (port 3000 -> 80).
* **Kubernetes (`k8s/`):**
  * `db-deployment.yaml` & `db-service.yaml`: Database PostgreSQL di dalam cluster.
  * `backend-deployment.yaml` & `backend-service.yaml`: Pod backend Laravel.
  * `web-deployment.yaml` & `web-service.yaml`: Pod web frontend Nginx.
  * `configmap.yaml` & `secret.example.yaml`: Pengelolaan variabel konfigurasi & kredensial rahasia.
  * `ingress.yaml`: Routing Ingress Nginx (`/api` -> backend:8000, `/` -> web:80).
  * `hpa.yaml`: Horizontal Pod Autoscaler untuk backend (skala 1–5 Pod berdasarkan 70% CPU utilization).
* **Stateless Backend Scaling:**
  * Karena backend bersifat stateless (sesi auth via token di DB / Bearer Token), backend Pod dapat di-scale menjadi multiple replicas tanpa memerlukan session stickiness.

---

## 7. Error Handling & Resiliency

* Format response API konsisten pada seluruh endpoint: `{ "success": false, "message": "...", "errors": {} }`.
* Kegagalan LLM API atau koneksi pihak ketiga tidak pernah menggagalkan pembuatan proyek. Sistem beralih (*fallback*) secara mulus ke pengisian task manual.
* Pada aplikasi Web & Mobile, setiap kegagalan jaringan atau validasi ditampilkan melalui komponen alert/toast yang ramah pengguna.

---

## 8. Trade-off & Keterbatasan

* **Push Notification Mobile:** Menggunakan sistem notifikasi in-app (badge & polling API) untuk efisiensi setup 4 hari tanpa memerlukan integrasi akun Google Firebase Cloud Messaging (FCM) fisik.
* **Single Database Pod di K8s:** Pada lingkungan produksi sebenarnya, disarankan menggunakan Managed Database Service (seperti AWS RDS / GCP Cloud SQL) dibanding menjalankan Single Database Pod di cluster K8s.
