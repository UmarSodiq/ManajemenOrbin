# Security Specification: Manajemen Organisasi Pemuda

## 1. Data Invariants
- A `KasMasuk` or `KasKeluar` must have a valid `jumlah` (>0) and a `tanggal`.
- `Iuran` must be associated with a valid `anggotaId` and `periode` (YYYY-MM).
- `Presensi` must be associated with a valid `rapatId` and `anggotaId`.
- Only `Bendahara` role can write to financial collections.
- Only `Sekretaris` role can write to meeting and member collections.
- All write operations require a verified email if using real emails (but we use username mapping, so we'll enforce authenticated user).

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Unauthorized Financial Write**: A user with `role: sekretaris` attempts to write to `kasMasuk`.
2. **Identity Spoofing**: A user attempts to create a `KasMasuk` with `dicatatOleh` set to another user's UID.
3. **Negative Amount**: A `Bendahara` attempts to save a `KasKeluar` with `jumlah: -100`.
4. **Member Dues Tampering**: A user attempts to delete an `Iuran` record they didn't create.
5. **Orphaned Attendance**: A user attempts to create a `Presensi` for a `rapatId` that doesn't exist.
6. **Admin Privilege Escalation**: A user attempts to update their own `role` in the `users` collection.
7. **Junk ID Poisoning**: A user attempts to create a document with a 2KB string as its ID.
8. **PII Leak**: An unauthenticated user attempts to read the `anggota` collection.
9. **Shadow Update**: A `Bendahara` attempts to add a `isVerified: true` field to a `KasMasuk` record.
10. **Immutable Field Change**: A user attempts to change the `tanggalBergabung` of an `Anggota`.
11. **Query Scraping**: An authenticated user attempts to list all `Iuran` records without a proper filter (if restricted).
12. **Status Shortcutting**: A user attempts to update a finished meeting's notulensi.

## 3. Planned Rules Strategy
- Use `isValid[Entity]` helpers for every write.
- Role-based gates for each collection.
- `affectedKeys().hasOnly()` for updates.
- `exists()` or `get()` for relational integrity.
- Server timestamps for audit fields.
