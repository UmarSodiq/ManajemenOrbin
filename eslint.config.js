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
  setDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { Polling, PollingInput, Vote, VoteInput, OperationType } from '../types';

export function usePollingActions() {
  const createPoll = async (data: PollingInput) => {
    try {
      await addDoc(collection(db, 'polling'), {
        ...data,
        createdAt: serverTimestamp(),
        dibuatOleh: auth.currentUser?.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'polling');
    }
  };

  const updatePollStatus = async (id: string, status: 'aktif' | 'selesai') => {
    try {
      await updateDoc(doc(db, 'polling', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `polling/${id}`);
    }
  };

  const deletePoll = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'polling', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `polling/${id}`);
    }
  };

  const castVote = async (pollId: string, data: VoteInput) => {
    let voterId = localStorage.getItem('voter_id');
    if (!voterId) {
      voterId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('voter_id', voterId);
    }
    
    const finalVoterId = auth.currentUser?.uid || voterId;
    const path = `polling/${pollId}/voters/${finalVoterId}`;
    
    try {
      await setDoc(doc(db, 'polling', pollId, 'voters', finalVoterId), {
        ...data,
        timestamp: serverTimestamp(),
      });
      localStorage.setItem(`voted_${pollId}`, 'true');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  return { createPoll, updatePollStatus, deletePoll, castVote };
}

export function usePolling() {
  const [polls, setPolls] = useState<Polling[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const actions = usePollingActions();

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'polling'), orderBy('createdAt', 'desc')), (snapshot) => {
      setPolls(snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as Polling[]);
      setIsLoading(false);
    }, (err) => {
      console.error("Polls List Error:", err);
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  return { polls, isLoading, ...actions };
}

export function useSinglePoll(id: string | undefined) {
  const [poll, setPoll] = useState<Polling | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'polling', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPoll({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Polling);
      } else {
        setPoll(null);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Single Poll Error:", err);
      setError(err.message);
      setIsLoading(false);
    });

    return () => unsub();
  }, [id]);

  return { poll, isLoading, error };
}

export function usePollVotes(pollId: string | undefined) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userVote, setUserVote] = useState<Vote | null>(null);

  useEffect(() => {
    if (!pollId) return;

    const unsub = onSnapshot(collection(db, 'polling', pollId, 'voters'), (snapshot) => {
      const votesList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      }) as Vote[];
      
      setVotes(votesList);
      
      const voterId = localStorage.getItem('voter_id');
      const finalVoterId = auth.currentUser?.uid || voterId;
      
      if (finalVoterId) {
        setUserVote(votesList.find(v => v.id === finalVoterId) || null);
      }
      
      setIsLoading(false);
    }, (err) => {
      console.error("Votes List Error:", err);
      setIsLoading(false);
    });

    return () => unsub();
  }, [pollId]);

  return { votes, userVote, isLoading };
}
