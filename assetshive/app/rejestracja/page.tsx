'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RejestracjaPage() {
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
      <form ref={formRef} onSubmit={handleSubmit}>
        <h1>Rejestracja</h1>
        <input type="text" name="username" placeholder="Nazwa użytkownika" minLength={3} required/>
        <input type="email" name="email" placeholder="Email" required/>
        <input type="password" name="password" placeholder="Hasło" minLength={8} required/>

        <button type="submit">Utwórz konto</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && (<p>Konto pomyślnie utworzone.</p>)}
      </form>
   );
}