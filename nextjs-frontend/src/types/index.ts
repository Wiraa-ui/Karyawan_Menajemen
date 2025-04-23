// src/types/index.ts

export interface Unit {
  id: number;
  nama: string;
  created_at?: string;
  updated_at?: string;
}

export interface Jabatan {
  id: number;
  nama: string;
  created_at?: string;
  updated_at?: string;
}

export interface Karyawan {
  id: number;
  nama: string;
  username: string;
  password?: string; // Password sebagai opsional
  unit_id: number;
  unit?: Unit;
  jabatans?: Jabatan[];
  tanggal_bergabung: string;
  created_at?: string;
  updated_at?: string;
}

export interface Login {
  id: number;
  karyawan_id: number;
  karyawan?: Karyawan;
  waktu_login: string;
  created_at?: string;
  updated_at?: string;
}

export interface TopUser {
  id: number;
  nama: string;
  unit?: {
    id: number;
    nama: string;
  };
  jabatan: string; // Jabatan sebagai string, bukan objek
  login_count: number;
  last_login?: string;
}

export interface DashboardStats {
  totalKaryawan: number;
  totalLogin: number;
  totalUnit: number;
  totalJabatan: number;
  topUsers: TopUser[];
}

// Response generik dari API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  total_karyawan?: number;
  total_login?: number;
  total_unit?: number;
  total_jabatan?: number;
  top_users?: TopUser[];
  data?: T;
}

// Response khusus untuk statistik dashboard
export interface DashboardApiResponse extends ApiResponse<DashboardStats> {}

// Response saat login berhasil
export interface LoginResponse {
  token: string;
  token_type: string;
  user: UserData;
}

// Data user dari hasil login
export interface UserData {
  id: number;
  nama: string;
  username: string;
}

// Data kredensial yang dikirim saat login
export interface LoginCredentials {
  username: string;
  password: string;
}
