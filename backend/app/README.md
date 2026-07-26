# backend/app

Kode aplikasi utama backend (bebas Laravel atau Next.js API routes/Route Handlers).

Struktur yang disarankan (sesuaikan penamaan dengan konvensi framework yang dipilih):

- `routes/` atau `controllers/` — definisi endpoint & handler HTTP.
- `models/` — representasi tabel/entity (Client, Project, Task, User, TimeLog, dst).
- `services/` — logika bisnis (mis. `ProjectService`, `TaskAssignmentService`) dipisah dari controller supaya mudah ditest.

Lihat `app/ml/` untuk integrasi fitur AI task breakdown, dan `../tests/` untuk unit/integration test.
