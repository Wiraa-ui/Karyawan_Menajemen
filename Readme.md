 # Manajemen Karyawan
  <img src="https://i.imgur.com/zK5EWcj.png" width="800"/>

Aplikasi Manajemen Data Karyawan berbasis web dengan fitur pengelolaan **Unit**, **Jabatan**, dan **Statistik Login**. Dibangun dengan **Laravel 12.9.2** sebagai backend REST API dan **Next.js 15.3.1** sebagai frontend SPA, serta menggunakan **Tailwind CSS** untuk antarmuka modern.

---

## ✨ Fitur Utama

- 🔐 Autentikasi login (token-based dengan Laravel Sanctum)
- 👨‍💼 Manajemen data karyawan (CRUD)
- 🏢 Manajemen unit (CRUD)
- 🧾 Manajemen jabatan (CRUD)
- 📊 Dashboard statistik:
  - Total karyawan
  - Jumlah unit dan jabatan
  - 10 karyawan dengan login terbanyak
- 🔎 Pencarian karyawan, unit, dan jabatan
- ➕ Tambah data dari dropdown jika tidak ditemukan (inline create)

---

## 🧱 Teknologi

| Stack       | Tools                         |
|-------------|-------------------------------|
| **Backend** | Laravel 12.9.2, Sanctum       |
| **Frontend**| Next.js 15.3.1, Tailwind CSS, TypeScript |
| **Database**| MySQL             |
| **API**     | REST                       |

---

## 🚀 Instalasi

```bash
### Backend (Laravel)
cd laravel-backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve


### Frontend (Laravel)
cd nextjs-frontend
npm install
npm run dev
