'use client'

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function UserState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function getActiveUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      setUser(user);
      setLoading(false);
    }

    getActiveUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if(error) {
        console.error(error.message);
    }
    setUser(null);
    router.push('/');
  };

  const handleSignIn = async () => {
    router.push('/login');
  }

  if (loading) {
    return <p>Ładowanie...</p>;
  }

  return (
    <div>
      {user ? (
        <>
            <p>Witaj, {user.user_metadata?.display_name}!</p>
            <button onClick={handleLogout} style={{cursor: 'pointer'}}>Wyloguj się</button>
        </>
      ) : (
        <p onClick={handleSignIn} style={{cursor: 'pointer'}}>Zaloguj się</p>
      )}
    </div>
  );
}