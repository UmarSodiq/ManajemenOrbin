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
} from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { Galeri, GaleriInput, OperationType } from '../types';

export function useGallery() {
  const [photos, setPhotos] = useState<Galeri[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'galeri'), orderBy('tanggalUpload', 'desc')), (snapshot) => {
      setPhotos(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggalUpload: doc.data().tanggalUpload?.toDate() || new Date(),
      })) as Galeri[]);
      setIsLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'galeri'));

    return () => unsub();
  }, []);

  const addPhoto = async (data: GaleriInput) => {
    try {
      await addDoc(collection(db, 'galeri'), {
        ...data,
        tanggalUpload: serverTimestamp(),
        diunggahOleh: auth.currentUser?.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'galeri');
    }
  };

  const updatePhoto = async (id: string, data: Partial<GaleriInput>) => {
    try {
      await updateDoc(doc(db, 'galeri', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `galeri/${id}`);
    }
  };

  const deletePhoto = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'galeri', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `galeri/${id}`);
    }
  };

  return { photos, isLoading, addPhoto, updatePhoto, deletePhoto };
}
