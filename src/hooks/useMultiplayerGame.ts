import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { OperationType } from '../types';

export interface GameRoom {
  id: string;
  gameType: string;
  status: 'waiting' | 'playing' | 'finished';
  players: {
    p1: { uid: string; name: string };
    p2?: { uid: string; name: string };
    p3?: { uid: string; name: string };
    p4?: { uid: string; name: string };
  };
  gameState: any;
  turn: string;
  winner: string | null;
  updatedAt: any;
  maxPlayers: number;
}

export function useMultiplayerGame(gameType: string) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createRoom = async (userId: string, userName: string, initialGameState: any, maxPlayers: number = 2) => {
    setIsLoading(true);
    try {
      const newRoomRef = doc(collection(db, 'gameRooms'));
      const roomData: Omit<GameRoom, 'id'> = {
        gameType,
        status: 'waiting',
        players: {
          p1: { uid: userId, name: userName }
        },
        gameState: initialGameState,
        turn: userId,
        winner: null,
        updatedAt: serverTimestamp(),
        maxPlayers
      };
      await setDoc(newRoomRef, roomData);
      setIsLoading(false);
      return newRoomRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gameRooms');
      setIsLoading(false);
      return null;
    }
  };

  const joinRoom = async (roomId: string, userId: string, userName: string, currentPlayers: any, maxPlayers: number = 2) => {
    setIsLoading(true);
    try {
      const roomRef = doc(db, 'gameRooms', roomId);
      const playerCount = Object.keys(currentPlayers).length;
      const nextSlot = `p${playerCount + 1}`;
      
      const updates: any = {
        [`players.${nextSlot}`]: { uid: userId, name: userName },
        updatedAt: serverTimestamp()
      };

      if (playerCount + 1 === maxPlayers) {
        updates.status = 'playing';
      }

      await updateDoc(roomRef, updates);
      setIsLoading(false);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gameRooms/${roomId}`);
      setIsLoading(false);
      return false;
    }
  };

  const updateGameState = async (roomId: string, newState: any, nextTurn?: string, winner?: string | null) => {
    try {
      const roomRef = doc(db, 'gameRooms', roomId);
      const updates: any = {
        gameState: newState,
        updatedAt: serverTimestamp()
      };
      if (nextTurn) updates.turn = nextTurn;
      if (winner !== undefined) {
        updates.winner = winner;
        if (winner) updates.status = 'finished';
        else if (winner === null && newState.isDraw) updates.status = 'finished';
      }
      await updateDoc(roomRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gameRooms/${roomId}`);
    }
  };

  const leaveRoom = async (roomId: string) => {
     // For simplicity, we just delete if it's waiting or keep history if finished
     // In a real app we'd handle disconnects
  };

  const findAvailableRoom = async (maxPlayersReq: number = 2) => {
    try {
      const q = query(
        collection(db, 'gameRooms'),
        where('gameType', '==', gameType),
        where('status', '==', 'waiting'),
        where('maxPlayers', '==', maxPlayersReq),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as GameRoom;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'gameRooms');
      return null;
    }
  };

  const subscribeToRoom = (roomId: string) => {
    const roomRef = doc(db, 'gameRooms', roomId);
    return onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        setRoom({ id: doc.id, ...doc.data() } as GameRoom);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `gameRooms/${roomId}`);
    });
  };

  return { 
    room, 
    isLoading, 
    createRoom, 
    joinRoom, 
    updateGameState, 
    findAvailableRoom,
    subscribeToRoom,
    setRoom
  };
}
