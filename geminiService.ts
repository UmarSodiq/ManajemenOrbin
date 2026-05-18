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
import { Asset, AssetInput, OperationType } from '../types';

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'assets'), orderBy('tanggalInput', 'desc')), (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggalInput: doc.data().tanggalInput?.toDate() || new Date(),
      })) as Asset[]);
      setIsLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'assets'));

    return () => unsub();
  }, []);

  const addAsset = async (data: AssetInput) => {
    try {
      await addDoc(collection(db, 'assets'), {
        ...data,
        tanggalInput: serverTimestamp(),
        dicatatOleh: auth.currentUser?.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'assets');
    }
  };

  const updateAsset = async (id: string, data: Partial<AssetInput>) => {
    try {
      await updateDoc(doc(db, 'assets', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `assets/${id}`);
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'assets', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `assets/${id}`);
    }
  };

  return { assets, isLoading, addAsset, updateAsset, deleteAsset };
}
