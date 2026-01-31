'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg('Błędny email lub hasło. Spróbuj ponownie.');
      } else {
        router.refresh();
        onClose();
      }
    } catch (err) {
      setErrorMsg('Wystąpił błąd: '+err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        
        <button onClick={onClose} className={styles.closeBtn}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
          </div>
          <h3 className={styles.title}>
            🐝 LOGOWANIE 🐝
          </h3>
          <p className={styles.subtitle}>
            Zaloguj się, aby zarządzać swoimi assetami.
          </p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          
          {errorMsg && (
            <div className={styles.error}>
              {errorMsg}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Hasło</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Hasło"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <div className={styles.footer}>
          Nie masz jeszcze konta?{' '}
          <Link href="/register" className={styles.link}>
            Dołącz do Ula!
          </Link>
        </div>
      </div>
    </div>
  );
}