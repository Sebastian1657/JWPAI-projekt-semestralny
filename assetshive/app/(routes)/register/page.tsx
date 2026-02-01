'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './register.module.css';

export default function RejestracjaPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const form = formRef.current;
    if (!form) return;
  
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
  
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: username,
          },
        },
      });
  
    if (error) {
      setError(error.message);
      return;
    }
  
    setSuccess(true);
    form.reset();
   }
  

    return (
      <div className={styles.registerPage}>
        <div className={styles.registerForm}>
          <form ref={formRef} onSubmit={handleSubmit}>
            <h2 className={styles.registerH2}>Rejestracja</h2>
            <hr className={styles.topLine} />
            <label className={styles.formLabel} htmlFor="username">Nazwa użytkownika</label>
            <input className={styles.formInput} type="text" name="username" placeholder="Nazwa użytkownika" minLength={3} required/><br />
            <label className={styles.formLabel} htmlFor="email">Email</label>
            <input className={styles.formInput} type="email" name="email" placeholder="Email" required/><br />
            <label className={styles.formLabel} htmlFor="password">Hasło</label>
            <input className={styles.formInput} type="password" name="password" placeholder="Hasło" minLength={8} required/><br />
            <button className={styles.submitBtn} type="submit">Utwórz konto</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && (<p className={styles.accountCreated}>🐝 Konto pomyślnie utworzone, witamy w ulu! 🐝</p>)}
          </form>
        </div>
      </div>
   );
}