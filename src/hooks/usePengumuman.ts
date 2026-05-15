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
  limit,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { Pengumuman, PengumumanInput, OperationType } from '../types';

export function usePengumuman() {
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'pengumuman'), orderBy('tanggalDibuat', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggalDibuat: doc.data().tanggalDibuat?.toDate() || new Date(),
        tanggalDiperbarui: doc.data().tanggalDiperbarui?.toDate() || new Date(),
      })) as Pengumuman[];
      setPengumumanList(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pengumuman');
    });

    return () => unsubscribe();
  }, []);

  const tambahPengumuman = async (data: PengumumanInput) => {
    try {
      await addDoc(collection(db, 'pengumuman'), {
        ...data,
        tanggalDibuat: serverTimestamp(),
        tanggalDiperbarui: serverTimestamp(),
        dibuatOleh: auth.currentUser?.uid,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pengumuman');
    }
  };

  const updatePengumuman = async (id: string, data: Partial<PengumumanInput>) => {
    try {
      const docRef = doc(db, 'pengumuman', id);
      await updateDoc(docRef, {
        ...data,
        tanggalDiperbarui: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pengumuman/${id}`);
    }
  };

  const hapusPengumuman = async (id: string) => {
    try {
      const docRef = doc(db, 'pengumuman', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `pengumuman/${id}`);
    }
  };

  return { pengumumanList, isLoading, tambahPengumuman, updatePengumuman, hapusPengumuman };
}
