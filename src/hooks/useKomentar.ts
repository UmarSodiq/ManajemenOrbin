/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Komentar, KomentarInput } from '../types';
import { useAuth } from './useAuth';

export function useKomentar(targetId: string) {
  const [comments, setComments] = useState<Komentar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!targetId) return;

    const q = query(
      collection(db, 'comments'),
      where('targetId', '==', targetId),
      orderBy('tanggal', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggal: doc.data().tanggal?.toDate() || new Date(),
      })) as Komentar[];
      setComments(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [targetId]);

  const addComment = async (isi: string) => {
    if (!user || !targetId) return;

    await addDoc(collection(db, 'comments'), {
      targetId,
      userId: user.uid,
      username: user.username,
      isi,
      tanggal: serverTimestamp(),
    });
  };

  const deleteComment = async (commentId: string) => {
    await deleteDoc(doc(db, 'comments', commentId));
  };

  return { comments, isLoading, addComment, deleteComment };
}
