# Pembukuan Trip Ojol - GrabBike Hemat

**Aplikasi Pembukuan Trip GrabBike yang Simpel, Cepat, dan Pintar untuk Driver Ojol**

Aplikasi web progresif (PWA) ini dirancang khusus untuk membantu driver GrabBike menghitung pendapatan bersih, melacak potongan komisi, dan mengelola riwayat orderan dengan mudah.

## ✨ Fitur Utama

- **Pencatatan Trip Mudah**
  - Input argo aplikasi atau net masuk dompet
  - Dukungan dua mode: **GrabBike Hemat** & **GrabBike Standard**
  - Hitung otomatis Gross, Potongan, dan Net

- **Perhitungan Cerdas**
  - Persentase potongan dinamis berdasarkan **level driver** (Jawara, Ksatria, Pejuang, Anggota)
  - Prediksi & override manual potongan "Esok Hari"
  - Batas maksimal potongan 8%

- **Ringkasan & Statistik**
  - Uang Bersih (Net) total
  - Pendapatan Kotor
  - Total Order
  - Breakdown potongan Standard & Hemat

- **Tampilan Fleksibel**
  - Per Hari, Minggu, atau Bulan
  - Navigasi tanggal cepat

- **Manajemen Data**
  - Backup & Restore data JSON
  - Export ke CSV (bisa dibuka di Excel)
  - Edit & Hapus trip
  - Reset data

- **PWA (Installable)**
  - Bisa di-install di Android/iOS
  - Bekerja offline
  - Tampilan modern & responsif

## 🖼️ Tampilan Aplikasi

*WIP*

## 🚀 Cara Menggunakan

1. Buka [https://sssira.github.io/pembukuan-mitra-grab/](https://sssira.github.io/pembukuan-mitra-grab/) atau install dari repository ini.
2. Pilih level driver Anda.
3. Masukkan tanggal dan argo trip.
4. Tekan **Tambah Trip Baru**.
5. Lihat ringkasan di bagian atas.

> **Tips**: Gunakan tombol **Enter** pada keyboard untuk mempercepat input.

## 📊 Cara Kerja Perhitungan

- **GrabBike Standard**: Net ÷ 92% × 100 (dibulatkan)
- **GrabBike Hemat**:
  - Menggunakan persentase berdasarkan level driver
  - Minimal argo 10.200 untuk kena potongan
  - Bisa di-override manual jika potongan aktual berbeda

## 🛠️ Teknologi

- HTML5, CSS3, Vanilla JavaScript
- Progressive Web App (PWA)
- LocalStorage
- Mobile-First Design

## 📥 Instalasi / Penggunaan Lokal

```bash
git clone https://github.com/sssira/pembukuan-mitra-grab.git
cd pembukuan-mitra-grab
# Buka file index.html di browser
