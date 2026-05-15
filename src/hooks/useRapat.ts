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
import { Rapat, RapatInput, NotulensiInput, Presensi, OperationType } from '../types';

export function useRapat() {
  const [rapatList, setRapatList] = useState<Rapat[]>([]);
  const [presensiList, setPresensiList] = useState<Presensi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubRapat = onSnapshot(query(collection(db, 'rapat'), orderBy('tanggal', 'desc')), (snapshot) => {
      setRapatList(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggal: doc.data().tanggal?.toDate() || new Date(),
      })) as Rapat[]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'rapat'));

    const unsubPresensi = onSnapshot(collection(db, 'presensi'), (snapshot) => {
      setPresensiList(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Presensi[]);
      setIsLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'presensi'));

    return () => {
      unsubRapat();
      unsubPresensi();
    };
  }, []);

  const tambahRapat = async (data: RapatInput) => {
    try {
      await addDoc(collection(db, 'rapat'), {
        ...data,
        dibuatOleh: auth.currentUser?.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'rapat');
    }
  };

  const updateRapat = async (id: string, data: Partial<RapatInput>) => {
    try {
      await updateDoc(doc(db, 'rapat', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rapat/${id}`);
    }
  };

  const simpanNotulensi = async (rapatId: string, notulensi: NotulensiInput) => {
    try {
      await updateDoc(doc(db, 'rapat', rapatId), { notulensi });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rapat/${rapatId}`);
    }
  };

  const hapusRapat = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'rapat', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `rapat/${id}`);
    }
  };

  const togglePresensi = async (rapatId: string, anggotaId: string) => {
    const existing = presensiList.find(p => p.rapatId === rapatId && p.anggotaId === anggotaId);
    if (existing) {
      try {
        const newStatus = existing.status === 'hadir' ? 'tidak_hadir' : 'hadir';
        await updateDoc(doc(db, 'presensi', existing.id), { status: newStatus });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `presensi/${existing.id}`);
      }
    } else {
      try {
        await addDoc(collection(db, 'presensi'), {
          rapatId,
          anggotaId,
          status: 'hadir',
          dicatatOleh: auth.currentUser?.uid,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'presensi');
      }
    }
  };

  const getPresensiRapat = (rapatId: string) => {
    return presensiList.filter(p => p.rapatId === rapatId);
  };

  return { 
    rapatList, 
    presensiList, 
    isLoading, 
    tambahRapat, 
    updateRapat, 
    simpanNotulensi, 
    hapusRapat, 
    togglePresensi,
    getPresensiRapat
  };
}
