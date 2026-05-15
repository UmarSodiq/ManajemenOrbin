/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'bendahara' | 'sekretaris';

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

// Input types (without id and auto metadata)
export type KasMasukInput = Omit<KasMasuk, 'id' | 'dicatatOleh'>;
export type KasKeluarInput = Omit<KasKeluar, 'id' | 'dicatatOleh'>;
export type RapatInput = Omit<Rapat, 'id' | 'dibuatOleh' | 'notulensi'>;
export type NotulensiInput = Notulensi;
export type AnggotaInput = Omit<Anggota, 'id' | 'tanggalBergabung'>;
export type PengumumanInput = Pick<Pengumuman, 'judul' | 'isi'>;

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
