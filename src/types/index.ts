/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'bendahara' | 'sekretaris' | 'anggota';

export interface AppUser {
  uid: string;
  username: string;
  role: Role;
}

export interface Anggota {
  id: string;
  namaLengkap: string;
  jabatan: string;
  status: 'aktif' | 'nonaktif';
  tanggalBergabung: Date;
  userId?: string; // Link to AppUser.uid
}

export interface Komentar {
  id: string;
  targetId: string; // ID for pengumuman, rapat, etc.
  userId: string;
  username: string;
  isi: string;
  tanggal: Date;
}

export interface Iuran {
  id: string;
  anggotaId: string;
  periode: string; // "YYYY-MM"
  jumlah: number;
  tanggalBayar: Date;
  dicatatOleh: string;
}

export interface IuranInput {
  anggotaId: string;
  periode: string;
  jumlah: number;
}

export interface KasMasuk {
  id: string;
  keterangan: string;
  jumlah: number;
  tanggal: Date;
  dicatatOleh: string;
  isIuran?: boolean;
}

export interface KasKeluar {
  id: string;
  keterangan: string;
  jumlah: number;
  tanggal: Date;
  dicatatOleh: string;
}

export interface Notulensi {
  agenda: string;
  pembahasan: string;
  keputusan: string;
}

export interface Rapat {
  id: string;
  judul: string;
  tanggal: Date;
  waktuMulai: string;
  waktuSelesai: string;
  tempat: string;
  notulensi?: Notulensi;
  dibuatOleh: string;
}

export interface Presensi {
  id: string;
  rapatId: string;
  anggotaId: string;
  status: 'hadir' | 'tidak_hadir';
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  tanggalDibuat: Date;
  tanggalDiperbarui: Date;
  dibuatOleh: string;
}

export interface Asset {
  id: string;
  namaBarang: string;
  lokasi: string;
  tanggalInput: Date;
  dicatatOleh: string;
}

export interface Galeri {
  id: string;
  judul: string;
  deskripsi?: string;
  imageUrl: string;
  tanggalKegiatan: string;
  tanggalUpload: Date;
  diunggahOleh: string;
}

export interface Kegiatan {
  id: string;
  judul: string;
  kategori: 'Rutin' | 'Khusus' | 'Sosial' | 'Rapat';
  deskripsi?: string;
  tanggal: string; // YYYY-MM-DD
  dibuatOleh: string;
  laporanNarasi?: string;
  biayaAktual?: number;
  catatanKeuangan?: string;
}

export interface Polling {
  id: string;
  judul: string;
  deskripsi?: string;
  tipe: 'pilihan_ganda' | 'manual';
  pilihan: string[];
  status: 'aktif' | 'selesai';
  createdAt: Date;
  dibuatOleh: string;
}

export interface Vote {
  id: string; // This will be the userId
  pilihan: string;
  voterName?: string;
  timestamp: Date;
}

// Input types (without id and auto metadata)
export type KasMasukInput = Omit<KasMasuk, 'id' | 'dicatatOleh'>;
export type KasKeluarInput = Omit<KasKeluar, 'id' | 'dicatatOleh'>;
export type RapatInput = Omit<Rapat, 'id' | 'dibuatOleh' | 'notulensi'>;
export type NotulensiInput = Notulensi;
export type AnggotaInput = Omit<Anggota, 'id' | 'tanggalBergabung'>;
export type PengumumanInput = Pick<Pengumuman, 'judul' | 'isi'>;
export type AssetInput = Omit<Asset, 'id' | 'tanggalInput' | 'dicatatOleh'>;
export type GaleriInput = Omit<Galeri, 'id' | 'tanggalUpload' | 'diunggahOleh'>;
export type KegiatanInput = Omit<Kegiatan, 'id' | 'dibuatOleh'>;
export type PollingInput = Omit<Polling, 'id' | 'createdAt' | 'dibuatOleh'>;
export type VoteInput = Omit<Vote, 'id' | 'timestamp'>;
export type KomentarInput = Pick<Komentar, 'targetId' | 'isi'>;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
