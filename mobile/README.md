# mobile

Aplikasi untuk role `member` (developer/desainer). Pilih salah satu stack — urutan preferensi: **Ionic** (paling diutamakan) → **React Native** (setara) → **Flutter** (poin preferensi stack terkecil, kualitas implementasi tetap dinilai penuh).

Struktur yang disarankan:

- **Ionic / React Native**: `src/{screens,components,services}`
- **Flutter**: `lib/{screens,components,services}`

Isi minimal:
- `screens/` (atau `pages/`) — layar login, daftar task, detail task, riwayat task selesai, notifikasi.
- `components/` — widget/komponen yang dipakai berulang.
- `services/` — pemanggilan API ke backend (auth, tasks, time-logs), penyimpanan token.

Hapus sub-folder yang tidak dipakai (mis. kalau pilih Flutter, hapus folder `src/` dan generate `lib/` lewat `flutter create`).
