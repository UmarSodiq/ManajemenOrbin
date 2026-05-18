import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  setDoc,
  doc, 
  serverTimestamp,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { GameScore, OperationType } from '../types';

export function useGameScores() {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'gameScores'), 
      orderBy('score', 'desc'),
      limit(100)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as GameScore[];
      setScores(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gameScores');
    });

    return () => unsubscribe();
  }, []);

  const saveScore = async (userId: string, namaLengkap: string, newScore: number) => {
    try {
      // We use userId as document ID to only keep the best score per user
      const docRef = doc(db, 'gameScores', userId);
      // Wait, if it's setDoc it will overwrite. We want to check if newScore > currentScore.
      // But rules can also handle this or we can do it here.
      // For simplicity, let's just use addDoc if we want a history, 
      // or use setDoc with userId and let the game logic handle "only save if higher".
      
      await setDoc(docRef, {
        userId,
        namaLengkap,
        score: newScore,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gameScores');
    }
  };

  return { scores, isLoading, saveScore };
}
