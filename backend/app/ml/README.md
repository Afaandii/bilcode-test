# backend/app/ml

Integrasi ke LLM API untuk fitur **AI-assisted task breakdown** (lihat root `README.md` bagian Requirement Functional #4).

Saran isi folder ini:

- `task_breakdown_client.{py,ts,php}` — wrapper pemanggilan LLM API (OpenAI/Gemini/Hugging Face): kirim brief klien sebagai prompt, terima output terstruktur (JSON: daftar task, kategori, estimasi effort).
- Penanganan timeout/error wajib ada di sini — kegagalan panggilan LLM **tidak boleh** membuat endpoint `POST /api/projects/:id/tasks/generate` gagal total; kembalikan response yang jelas supaya admin tetap bisa membuat task manual.
- Dokumentasikan pendekatan prompt yang dipilih (few-shot, output JSON terstruktur, dsb) di `docs/architecture.md`, bukan hanya di kode.
