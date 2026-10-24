# InFrastuktur

Dashboard transparansi proyek infrastruktur publik untuk memantau anggaran, progres, dokumentasi, dan dokumen proyek.

## Fitur

- Ringkasan proyek, progres pembangunan, dan penyerapan anggaran.
- Rincian kategori anggaran dan pengeluaran material.
- Detail proyek mencakup kontraktor, lokasi, jadwal, dan nomor kontrak.
- Dokumentasi progres lapangan berupa foto dan laporan berkala.
- Daftar serta pratinjau dokumen proyek dalam format PDF.
- Panel admin demo untuk mengubah atau memulihkan data proyek.
- Formulir laporan ketidaksesuaian dan daftar laporan publik.
- Inbox admin untuk meninjau laporan dan memperbarui status tindak lanjut.
- Tema gelap/terang yang tersimpan dan tersinkron saat berpindah halaman.
- Tampilan responsif untuk desktop, tablet, dan ponsel.

## Teknologi

- React
- Vite
- React Router
- PDF.js (`pdfjs-dist`)
- CSS

## Persyaratan

- Node.js 20.19+ atau 22.12+
- npm

## Menjalankan secara lokal

Clone repository dan masuk ke folder proyek:

```bash
git clone https://github.com/StephenGithubHosting/InFrastuktur.git
cd InFrastuktur
```

Pasang dependensi dan jalankan server pengembangan:

```bash
npm install
npm run dev
```

Buka URL yang ditampilkan Vite, biasanya <http://localhost:5173>.

## Perintah npm

```bash
npm run dev      # Jalankan server pengembangan
npm run build    # Buat build produksi di folder dist/
npm run preview  # Pratinjau build produksi
npm run lint     # Jalankan ESLint
```

## Halaman aplikasi

- `/` — ringkasan proyek dan anggaran.
- `/detail` — detail informasi proyek.
- `/dokumentasi` — laporan dan foto progres lapangan.
- `/dokumen` — daftar dan pratinjau dokumen proyek.
- `/laporan-warga` — daftar laporan warga tanpa menampilkan nama atau kontak pelapor.
- `/laporan-ketidaksesuaian` — formulir laporan masyarakat.
- `/admin` — panel administrasi demo.
- `/admin/laporan-ketidaksesuaian` — daftar dan status laporan masyarakat.

## Akun demo admin

- Email: `admin@infrastuktur.id`
- Kata sandi: `admin123`

Panel admin hanya untuk prototipe. Login tidak menggunakan autentikasi backend, dan perubahan data termasuk laporan disimpan secara lokal di browser (`localStorage`). Halaman laporan publik hanya menampilkan laporan yang tersimpan pada browser ini; kiriman dari pengguna di perangkat lain tidak akan masuk ke daftar tanpa integrasi backend dan database. Jangan gunakan untuk melindungi atau mengelola data sungguhan.

## Catatan

- Data proyek awal tersedia di `src/projectData.js`.
- Contoh dokumen IMB/PBG dan denah konseptual disimpan di folder `public/`:
  `/dokumen-proyek.pdf` dan `/denah-bangunan-puskesmas-prambanan.pdf`.
- Kedua PDF adalah dokumen simulasi, bukan dokumen perizinan resmi atau gambar
  konstruksi. Aset `public/` diakses dari URL root, bukan melalui `/public/`.
- Foto contoh menggunakan Unsplash dan memerlukan koneksi internet.
- Perubahan data lokal tidak otomatis tersinkron ke browser atau server lain.
