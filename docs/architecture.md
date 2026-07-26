# Architecture Decision Document — ProjectPulse

> Isi dokumen ini selama/setelah pengerjaan. Ini bagian yang dinilai reviewer untuk memahami keputusan teknis, bukan cuma kode yang jalan.

## 1. Ringkasan Stack

| Layer | Pilihan | Alasan singkat |
|---|---|---|
| Backend | Laravel / Next.js | |
| Web | Next.js/React / Blade | |
| Mobile | Ionic / React Native / Flutter | |
| Database | | |
| LLM Provider | OpenAI / Gemini / Hugging Face | |

## 2. Alur Data Utama

Jelaskan alur request untuk 1-2 fitur inti (mis. "admin bikin proyek dari brief klien" dan "member update status task") dari client sampai database.

## 3. Desain Skema Database

Diagram/daftar tabel & relasi (Client, Project, Task, User, TimeLog, dst) beserta alasan desainnya.

## 4. Integrasi ML — AI Task Breakdown

- Pendekatan prompt yang dipakai (few-shot / output JSON terstruktur / dsb).
- Bagaimana output LLM divalidasi sebelum ditampilkan ke admin.
- Bagaimana kegagalan/timeout LLM API ditangani (fallback ke input manual).

## 5. Autentikasi & Otorisasi

Bagaimana token auth bekerja lintas web-mobile, dan bagaimana role `admin`/`member` dibatasi di level API.

## 6. Containerization & Orchestration

- Isi & alasan struktur `Dockerfile` di `backend/` dan `web/` (base image, multi-stage build kalau ada).
- Cara menjalankan `docker-compose up` untuk dev lokal.
- Cara deploy manifest di `k8s/` ke cluster lokal (minikube/kind/k3d) — termasuk cara mengakses service setelah deploy.
- Kalau backend di-scale >1 replika, apa yang perlu dipastikan tetap benar (state, session, dsb)?

## 7. Error Handling & Resiliency

Bagaimana sistem tetap berfungsi (fitur inti) saat LLM API gagal/timeout, dan bagaimana error ditampilkan ke user di web & mobile.

## 8. Trade-off & Keterbatasan

Hal yang disederhanakan/di-skip karena keterbatasan waktu 4 hari, dan bagaimana akan dikembangkan lebih lanjut kalau ada waktu tambahan.
