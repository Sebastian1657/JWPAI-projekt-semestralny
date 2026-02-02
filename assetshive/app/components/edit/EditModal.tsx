'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import styles from './EditModal.module.css';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditModal({ isOpen, onClose }: EditModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          setDisplayName(user.user_metadata?.display_name || '');
        }
      };
      fetchUserData();
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg(null);
  setSuccessMsg(null);

  try {
    // 1. Pobieramy aktualnego użytkownika, by mieć dostęp do obecnego e-maila
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error("Nie znaleziono sesji użytkownika");

    const cleanEmail = email.trim().toLowerCase();
    
    // 2. Budujemy obiekt zmian
    // Zawsze wysyłamy nazwę użytkownika (metadane)
    const updateData: any = {
      data: { display_name: displayName.trim() }
    };

    // 3. Dodajemy email tylko jeśli jest INNY niż obecny
    if (cleanEmail !== currentUser.email) {
      updateData.email = cleanEmail;
    }

    // 4. Dodajemy hasło tylko jeśli pole nie jest puste
    if (newPassword.trim() !== '') {
      updateData.password = newPassword;
    }

    // 5. WYKONUJEMY TYLKO JEDNO WYWOŁANIE
    const { error } = await supabase.auth.updateUser(updateData);

    if (error) {
      // Wyświetl pełny komunikat błędu w konsoli dla debugowania
      console.error("Supabase Update Error:", error);
      setErrorMsg('Błąd: ' + error.message);
    } else {
      setSuccessMsg('Dane zostały zaktualizowane pomyślnie!');
    }
  } catch (err: any) {
    setErrorMsg('Wystąpił nieoczekiwany błąd: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        
        <button onClick={onClose} className={styles.closeBtn}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h3 className={styles.title}>🐝 USTAWIENIA KONTA 🐝</h3>
          <p className={styles.subtitle}>Zaktualizuj swoje dane profilowe.</p>
        </div>

        <form onSubmit={handleUpdate} className={styles.form}>
          
          {errorMsg && <div className={styles.error}>{errorMsg}</div>}
          {successMsg && <div className={styles.success} style={{color: '#4CAF50', marginBottom: '1rem', textAlign: 'center'}}>{successMsg}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Nazwa użytkownika</label>
            <input
              type="text"
              required
              value={displayName}
              name="username"
              onChange={(e) => setDisplayName(e.target.value)}
              className={styles.input}
              minLength={3}
              placeholder="Nazwa użytkownika"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              required
              value={email}
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Nowe hasło (opcjonalnie)</label>
            <input
              type="password"
              value={newPassword}
              name="password"
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              minLength={8}
              placeholder="Pozostaw puste, aby nie zmieniać"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </form>
      </div>
    </div>
  );
}