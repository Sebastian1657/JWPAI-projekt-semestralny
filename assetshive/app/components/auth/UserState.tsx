'use client'

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/zustand';
import styles from './UserState.module.css';

export default function UserState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const setGlobalUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    async function getActiveUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      setUser(user);
      setGlobalUser(user);
      setLoading(false);
    }

    getActiveUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setGlobalUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [setGlobalUser]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if(error) {
        console.error(error.message);
    }
    setUser(null);
    setGlobalUser(null)
    router.push('/');
  };

  const handleSignIn = async () => {
    router.push('/login');
  }

  if (loading) {
    return <p>Ładowanie...</p>;
  }

  return (
    <>
      {user ? (
        <div className={styles.userInfo}>
          <div className={styles.userLeft}>
            <div className={styles.userName}>{user.user_metadata?.display_name}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
          <div className={styles.userRight}>
            <svg onClick={handleLogout} style={{cursor: 'pointer'}} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FA493C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4M16 17l5-5-5-5M19.8 12H9"/></svg>
          </div>
        </div>
      ) : (
        <div className={styles.userInfo}>
          <div className={styles.userLeft}>
            <div className={styles.userName}>Gość</div>
            <div className={styles.userEmail} onClick={handleSignIn} style={{cursor: 'pointer'}}>Zaloguj się</div>
          </div>
        </div>
      )}
    </>
  );
}