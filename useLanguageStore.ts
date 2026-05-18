/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { KasMasuk, KasKeluar, Iuran, KasMasukInput, KasKeluarInput, OperationType } from '../types';

export function useKeuangan() {
  const [kasMasukList, setKasMasukList] = useState<KasMasuk[]>([]);
  const [kasKeluarList, setKasKeluarList] = useState<KasKeluar[]>([]);
  const [iuranList, setIuranList] = useState<Iuran[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubMasuk = onSnapshot(query(collection(db, 'kasMasuk'), orderBy('tanggal', 'desc')), (snapshot) => {
      setKasMasukList(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggal: doc.data().tanggal?.toDate() || new Date(),
      })) as KasMasuk[]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'kasMasuk'));

    const unsubKeluar = onSnapshot(query(collection(db, 'kasKeluar'), orderBy('tanggal', 'desc')), (snapshot) => {
      setKasKeluarList(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggal: doc.data().tanggal?.toDate() || new Date(),
      })) as KasKeluar[]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'kasKeluar'));

    const unsubIuran = onSnapshot(collection(db, 'iuran'), (snapshot) => {
      setIuranList(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggalBayar: doc.data().tanggalBayar?.toDate() || new Date(),
      })) as Iuran[]);
      setIsLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'iuran'));

    return () => {
      unsubMasuk();
      unsubKeluar();
      unsubIuran();
    };
  }, []);

  const tambahKasMasuk = async (data: KasMasukInput) => {
    try {
      await addDoc(collection(db, 'kasMasuk'), {
        ...data,
        dicatatOleh: auth.currentUser?.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'kasMasuk');
    }
  };

  const updateKasMasuk = async (id: string, data: Partial<KasMasukInput>) => {
    try {
      await updateDoc(doc(db, 'kasMasuk', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `kasMasuk/${id}`);
    }
  };

  const hapusKasMasuk = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'kasMasuk', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `kasMasuk/${id}`);
    }
  };

  const tambahKasKeluar = async (data: KasKeluarInput) => {
    try {
      await addDoc(collection(db, 'kasKeluar'), {
        ...data,
        dicatatOleh: auth.currentUser?.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'kasKeluar');
    }
  };

  const updateKasKeluar = async (id: string, data: Partial<KasKeluarInput>) => {
    try {
      await updateDoc(doc(db, 'kasKeluar', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `kasKeluar/${id}`);
    }
  };

  const hapusKasKeluar = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'kasKeluar', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `kasKeluar/${id}`);
    }
  };

  const toggleIuran = async (anggotaId: string, periode: string, jumlah: number) => {
    const existing = iuranList.find(i => i.anggotaId === anggotaId && i.periode === periode);
    if (existing) {
      try {
        await deleteDoc(doc(db, 'iuran', existing.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `iuran/${existing.id}`);
      }
    } else {
      try {
        await addDoc(collection(db, 'iuran'), {
          anggotaId,
          periode,
          jumlah,
          tanggalBayar: serverTimestamp(),
          dicatatOleh: auth.currentUser?.uid,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'iuran');
      }
    }
  };

  const NOMINAL_IURAN = 5000;

  const rekapIuranKeKasMasuk = async (periode: string, tanggalKumpulan: Date) => {
    const listIuranBulanIni = iuranList.filter(i => i.periode === periode);
    const totalDiterima = listIuranBulanIni.reduce((sum, item) => sum + (item.jumlah || 0), 0);
    
    if (totalDiterima <= 0) return;

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = new Intl.DateTimeFormat('id-ID', options).format(tanggalKumpulan);
    const keterangan = `iuran kumpulan tanggal ${dateStr}`;

    try {
      await addDoc(collection(db, 'kasMasuk'), {
        keterangan,
        jumlah: totalDiterima,
        tanggal: tanggalKumpulan,
        dicatatOleh: auth.currentUser?.uid,
        isIuran: true,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'kasMasuk');
    }
  };

  const totalMasuk = kasMasukList.reduce((sum, item) => sum + item.jumlah, 0);
  const totalKeluar = kasKeluarList.reduce((sum, item) => sum + item.jumlah, 0);
  const saldoKas = totalMasuk - totalKeluar;

  return { 
    kasMasukList, 
    kasKeluarList, 
    iuranList, 
    saldoKas, 
    isLoading,
    NOMINAL_IURAN,
    tambahKasMasuk,
    updateKasMasuk,
    hapusKasMasuk,
    tambahKasKeluar,
    updateKasKeluar,
    hapusKasKeluar,
    toggleIuran,
    rekapIuranKeKasMasuk
  };
}
