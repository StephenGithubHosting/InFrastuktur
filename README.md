# InFrastuktur

Dashboard transparansi proyek infrastruktur publik. Aplikasi menampilkan ringkasan anggaran, progres pembangunan, dokumentasi lapangan, dan dokumen proyek. Tersedia juga panel admin demo untuk mengubah data proyek di browser.

## Fitur

- Ringkasan proyek, progres fisik, dan status anggaran.
- Rincian kategori serta pengeluaran material.
- Detail kontraktor, lokasi, jadwal, dan nomor kontrak.
- Dokumentasi progres dengan foto, tanggal, dan catatan.
- Pratinjau dokumen PDF.
- Panel admin demo untuk mengubah dan memulihkan data proyek.
- Tata letak responsif untuk desktop, tablet, dan ponsel.

## Teknologi

- React 19
- Vite
- React Router
- PDF.js (`pdfjs-dist`)
- CSS

## Persyaratan

- Node.js versi 20.19+ atau 22.12+
- npm

## Menjalankan secara lokal

1. Clone repository:

   ```bash
   git clone https://github.com/USERNAME/REPOSITORY.git
   cd REPOSITORY
   ```

2. Pasang dependensi:

   ```bash
   npm install
   ```

3. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

4. Buka alamat lokal yang ditampilkan Vite, biasanya <http://localhost:5173>.

## Perintah yang tersedia

```bash
npm run dev      # Jalankan server pengembangan
npm run build    # Buat build produksi di folder dist/
npm run preview  # Pratinjau build produksi
npm run lint     # Jalankan ESLint
```

## Navigasi aplikasi

- `/` — ringkasan proyek dan anggaran.
- `/detail` — informasi proyek, kontraktor, lokasi, jadwal, dan kontrak.
- `/dokumentasi` — laporan dan foto progres lapangan.
- `/dokumen` — daftar dan pratinjau dokumen proyek.
- `/admin` — panel administrasi demo.

## Panel admin demo

Gunakan akun demo berikut untuk membuka panel:

- Email: `admin@infrastuktur.id`
- Kata sandi: `admin123`

Panel ini hanya untuk prototipe. Autentikasi dan penyimpanan data dilakukan di browser, bukan melalui backend. Jangan gunakan login demo ini untuk melindungi data sungguhan. Perubahan proyek disimpan di `localStorage` browser yang digunakan.

## Catatan data

- Data proyek awal berada di `src/projectData.js`.
- Dokumen PDF contoh disimpan di folder `public/`.
- Foto contoh menggunakan URL Unsplash sehingga memerlukan koneksi internet agar dapat dimuat.
- Perubahan dari panel admin tersimpan lokal pada browser dan tidak otomatis tersinkron ke pengguna atau server lain.
