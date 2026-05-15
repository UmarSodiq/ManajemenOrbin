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
  doc, 
  serverTimestamp,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { Anggota, AnggotaInput, OperationType } from '../types';

export function useAnggota() {
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'anggota'), orderBy('namaLengkap', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggalBergabung: doc.data().tanggalBergabung?.toDate() || new Date(),
      })) as Anggota[];
      setAnggotaList(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'anggota');
    });

    return () => unsubscribe();
  }, []);

  const tambahAnggota = async (data: AnggotaInput) => {
    try {
      await addDoc(collection(db, 'anggota'), {
        ...data,
        tanggalBergabung: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'anggota');
    }
  };

  const updateAnggota = async (id: string, data: Partial<AnggotaInput>) => {
    try {
      const docRef = doc(db, 'anggota', id);
      await updateDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `anggota/${id}`);
    }
  };

  const toggleStatusAnggota = async (id: string, currentStatus: 'aktif' | 'nonaktif') => {
    const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      const docRef = doc(db, 'anggota', id);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `anggota/${id}`);
    }
  };

  return { anggotaList, isLoading, tambahAnggota, updateAnggota, toggleStatusAnggota };
}
