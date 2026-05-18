/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AppUser, Role } from '../types';
import { useAppStore } from '../store/appStore';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser, role, setRole } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const appUser: AppUser = {
              uid: fbUser.uid,
              username: userData.username,
              role: userData.role as Role,
            };
            setUser(appUser);
            setRole(appUser.role);
          }
        } catch (err) {
          console.error('Gagal mengambil profil pengguna:', err);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setRole]);

  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Jika input mengandung '@', gunakan sebagai email asli. 
      // Jika tidak, tambahkan suffix otomatis untuk virtual email.
      const email = usernameOrEmail.includes('@') 
        ? usernameOrEmail 
        : `${usernameOrEmail.toLowerCase()}@organisasi.com`;
      
      const username = usernameOrEmail.includes('@') 
        ? usernameOrEmail.split('@')[0] 
        : usernameOrEmail;

      // Tentukan peran otomatis berdasarkan username jika profil belum ada
      let inferredRole: Role = 'anggota';
      if (username.toLowerCase() === 'bendaharaorbin') {
        inferredRole = 'bendahara';
      } else if (username.toLowerCase() === 'sekretarisorbin') {
        inferredRole = 'sekretaris';
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // Periksa apakah profil pengguna ada, jika tidak, buat baru (untuk demo/setup awal)
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const userData = {
          username,
          role: inferredRole,
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, userData);
        const appUser: AppUser = {
          uid: fbUser.uid,
          username,
          role: inferredRole,
        };
        setUser(appUser);
        setRole(inferredRole);
      } else {
        const userData = userDoc.data();
        const appUser: AppUser = {
          uid: fbUser.uid,
          username: userData.username,
          role: userData.role as Role,
        };
        setUser(appUser);
        setRole(appUser.role);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const email = `${username.toLowerCase()}@organisasi.com`;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userData = {
        username,
        role: 'anggota' as Role,
        createdAt: serverTimestamp(),
      };
      
      await setDoc(userDocRef, userData);
      
      const appUser: AppUser = {
        uid: fbUser.uid,
        username,
        role: 'anggota',
      };
      
      setUser(appUser);
      setRole('anggota');
    } catch (err: any) {
      setError(err.message || 'Gagal registrasi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
    } catch (err) {
      console.error('Gagal keluar sesi:', err);
    }
  };

  return { user, role, login, register, logout, isLoading, error };
}
