/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function validateJumlah(value: string): string | null {
  const num = parseFloat(value);
  if (isNaN(num)) return 'Jumlah harus berupa angka';
  if (num < 0.01) return 'Jumlah minimal adalah 0,01';
  if (num > 999999999.99) return 'Jumlah melebihi batas maksimal';
  return null;
}

export function validateRequiredFields(fields: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      errors[key] = 'Kolom ini wajib diisi';
    }
  }
  return errors;
}

export function validateRentangTanggal(mulai: Date, selesai: Date): string | null {
  if (mulai > selesai) return 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai';
  
  const diffTime = Math.abs(selesai.getTime() - mulai.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 366) return 'Rentang tanggal tidak boleh melebihi 366 hari';
  
  return null;
}
