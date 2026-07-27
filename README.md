# Website Ucapan Suara — Fariz & Lia

Website untuk merekam ucapan suara tamu pernikahan, langsung dari browser,
tersimpan otomatis ke Vercel Blob Storage. Gratis untuk hosting.

## Struktur halaman

- `/` — Halaman utama: "Welcome to Fariz & Lia" + tombol mulai merekam
- `/rekam` — Input nama, rekam (maks 60 detik), pause/lanjut/berhenti/ulangi/
  dengarkan/hapus/simpan, konfirmasi permanen, lalu kembali ke halaman utama
- `/admin-fariz-lia-2026` — Halaman **rahasia** untuk kamu: daftar semua
  rekaman tamu, bisa didengarkan dan diunduh. Jangan bagikan link ini ke tamu.

## Langkah 1 — Siapkan akun

1. Buat akun di [github.com](https://github.com) (gratis) jika belum punya.
2. Buat akun di [vercel.com](https://vercel.com) (gratis) — bisa langsung
   daftar pakai akun GitHub kamu, lebih cepat.

## Langkah 2 — Upload kode ini ke GitHub

1. Buat repository baru di GitHub, misalnya beri nama `ucapan-fariz-lia`.
2. Di komputer kamu, masuk ke folder project ini lewat terminal, lalu jalankan:

   ```bash
   git init
   git add .
   git commit -m "Website ucapan suara Fariz & Lia"
   git branch -M main
   git remote add origin https://github.com/USERNAME-KAMU/ucapan-fariz-lia.git
   git push -u origin main
   ```

   Ganti `USERNAME-KAMU` dengan username GitHub kamu.

   > Tidak biasa pakai terminal/git? GitHub juga punya cara upload file lewat
   > browser: buka repository baru → "uploading an existing file" → seret
   > semua file & folder project ini ke sana.

## Langkah 3 — Deploy ke Vercel

1. Login ke [vercel.com](https://vercel.com/new).
2. Klik **Add New → Project**.
3. Pilih repository `ucapan-fariz-lia` yang baru kamu push.
4. Biarkan semua pengaturan default (Vercel otomatis mengenali ini project
   Next.js), lalu klik **Deploy**.
5. Tunggu 1–2 menit sampai selesai. Kamu akan dapat link seperti
   `ucapan-fariz-lia.vercel.app`.

## Langkah 4 — Aktifkan penyimpanan (Vercel Blob)

Ini langkah penting supaya rekaman tamu benar-benar tersimpan.

1. Di dashboard project kamu di Vercel, buka tab **Storage**.
2. Klik **Create Database** → pilih **Blob**.
3. Beri nama bebas, misalnya `ucapan-storage`, lalu klik **Create**.
4. Vercel akan menawarkan untuk menghubungkan store ini ke project kamu —
   klik **Connect**. Ini otomatis membuat environment variable
   `BLOB_READ_WRITE_TOKEN` di project kamu, tanpa perlu kamu ketik manual.
5. Buka tab **Deployments**, klik deployment terakhir → menu titik tiga →
   **Redeploy**, supaya project membaca environment variable yang baru
   ditambahkan.

## Langkah 5 — Coba sendiri dulu

1. Buka link `https://ucapan-fariz-lia.vercel.app` di HP kamu.
2. Klik "Mulai Merekam Ucapan", isi nama, izinkan akses mikrofon, coba rekam.
3. Setelah simpan, buka `https://ucapan-fariz-lia.vercel.app/admin-fariz-lia-2026`
   dan pastikan rekaman kamu muncul serta bisa diputar/diunduh.

## Langkah 6 — Bagikan ke tamu

- Bagikan link utama (`https://ucapan-fariz-lia.vercel.app`) lewat undangan
  digital, WhatsApp, atau kode QR yang ditempel di venue.
- **Simpan link admin untuk diri sendiri saja** — siapa pun yang tahu link
  itu bisa mendengarkan & mengunduh semua rekaman tamu.

## Mengganti nama pengantin / teks

- Nama pengantin di halaman utama: edit `app/page.tsx`, cari teks
  `Fariz` dan `Lia`.
- Judul tab browser & deskripsi: edit `app/layout.tsx` bagian `metadata`.
- Warna & font: edit `tailwind.config.js` (warna) dan `app/layout.tsx`
  (font Google — saat ini "Fraunces" untuk judul, "Work Sans" untuk teks).
- Link admin rahasia: ganti nama folder
  `app/admin-fariz-lia-2026` menjadi apapun yang kamu suka, semakin unik
  semakin aman (contoh: `app/rahasia-xyz123`).

## Batasan yang perlu diketahui

- Free tier Vercel Blob Storage: sekitar 1GB penyimpanan gratis — cukup
  untuk ribuan rekaman 60 detik.
- Rekaman yang sudah disimpan tamu tidak bisa dihapus lewat website (sesuai
  desain), tapi kamu tetap bisa menghapusnya manual lewat dashboard Vercel
  Storage kalau memang perlu.
- Perlu koneksi internet aktif saat tamu merekam & menyimpan (bukan mode
  offline).
- Akses mikrofon browser memerlukan HTTPS — otomatis tersedia dari Vercel,
  tidak perlu setup tambahan.

## Menjalankan di komputer sendiri (opsional, untuk development)

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Untuk mencoba fitur simpan rekaman secara
lokal, kamu perlu menambahkan `BLOB_READ_WRITE_TOKEN` ke file `.env.local`
(ambil dari dashboard Vercel Storage kamu).
