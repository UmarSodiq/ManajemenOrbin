/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
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
          console.error('Error fetching user profile:', err);
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
      let inferredRole: Role = 'sekretaris';
      if (username.toLowerCase() === 'bendaharaorbin') {
        inferredRole = 'bendahara';
      } else if (username.toLowerCase() === 'sekretarisorbin') {
        inferredRole = 'sekretaris';
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // Check if user profile exists, if not create it (for initial setup/demo)
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

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return { user, role, login, logout, isLoading, error };
}
