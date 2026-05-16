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
} from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { Kegiatan, KegiatanInput, OperationType } from '../types';

export function useEvents() {
  const [events, setEvents] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'kegiatan'), orderBy('tanggal', 'asc')), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Kegiatan[]);
      setIsLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'kegiatan'));

    return () => unsub();
  }, []);

  const addEvent = async (data: KegiatanInput) => {
    try {
      await addDoc(collection(db, 'kegiatan'), {
        ...data,
        dibuatOleh: auth.currentUser?.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'kegiatan');
    }
  };

  const updateEvent = async (id: string, data: Partial<KegiatanInput>) => {
    try {
      await updateDoc(doc(db, 'kegiatan', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `kegiatan/${id}`);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'kegiatan', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `kegiatan/${id}`);
    }
  };

  return { events, isLoading, addEvent, updateEvent, deleteEvent };
}
