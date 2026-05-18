import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'id';

interface LanguageState {
  language: Language;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'id',
      t: (key) => {
        return translations['id'][key] || key;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

export const translations: Record<Language, Record<string, string>> = {
  id: {
    dashboard: 'Dasbor',
    income: 'Kas Masuk',
    dues: 'Iuran',
    expense: 'Kas Keluar',
    report: 'Laporan Keuangan',
    members: 'Manajemen Anggota',
    minutes: 'Notulensi Rapat',
    presence: 'Presensi',
    announcement: 'Pengumuman',
    assets: 'Manajemen Aset',
    gallery: 'Galeri Kegiatan',
    calendar: 'Kalender Kegiatan',
    polling: 'E-Voting / Polling',
    guide: 'Petunjuk Penggunaan',
    logout: 'Keluar Sesi',
    nav_main: 'Navigasi Utama',
    org_name: 'REMAJA BRITANIA NGLEMPONG',
    org_desc: 'Organisasi Management',
    welcome: 'Selamat Datang',
    welcome_bendahara: 'Selamat Datang, Bendahara',
    welcome_sekretaris: 'Selamat Datang, Sekretaris',
    status_finance: 'Status keuangan organisasi hari ini.',
    status_org: 'Kelola administrasi organisasi Anda hari ini.',
    total_balance: 'Total Saldo Kas',
    unpaid_dues: 'Belum Bayar Iuran',
    active_members: 'Anggota Aktif',
    latest_transactions: 'Transaksi Terbaru',
    all_reports: 'Semua Laporan',
    view_all: 'Lihat Semua',
    person: 'Orang',
    soul: 'Jiwa',
    no_transactions: 'Belum ada transaksi tercatat.',
    no_announcements: 'Belum ada pengumuman.',
    finance_status_label: 'Status Keuangan',
    finance_status_desc: 'Verifikasi saldo terakhir dilakukan hari ini oleh sistem.',
    total_members: 'Total Anggota',
    meetings_done: 'Rapat Terlaksana',
    active_announcements: 'Pengumuman Aktif',
    upcoming_meeting: 'Jadwal Rapat Mendatang',
    no_upcoming_meetings: 'Belum ada rapat terjadwal dalam waktu dekat.',
    manage_meeting: 'Kelola Rapat',
    last_presence: 'Presensi Terakhir',
    present: 'Hadir',
    participation: 'Partisipasi',
    org_news: 'Warta Organisasi',
    empty_label: 'Kosong.',
    select_lang: 'Pilih Bahasa',
    lang_id: 'Indonesia',
    lang_jv: 'Jawa Ngoko',
    menu: 'MENU',
    logout_confirm: 'Keluar Sistem',
    org_age: 'Usia Organisasi',
    year: 'Tahun',
    month: 'Bulan',
    day: 'Hari',
    standing_since: 'Berdiri Sejak'
  }
};
