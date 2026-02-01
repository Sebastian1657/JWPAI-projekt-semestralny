'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Asset } from '@/types';
import styles from './page.module.css';

export default function PaymentPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('basket');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  const handleTransaction = async (status: 'success' | 'fail') => {
    if (status === 'fail') {
        alert('Płatność odrzucona przez operatora.');
        return;
    }

    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        alert('Musisz być zalogowany, aby sfinalizować zakup!');
        setLoading(false);
        return;
    }

    try {
      // Dodaj wpisy do user_library
      const libraryEntries = items.map(item => ({
        user_id: user.id,
        asset_id: item.id
      }));

      const { error } = await supabase
        .from('user_library')
        .insert(libraryEntries);

      if (error) throw error;

      localStorage.removeItem('basket');
      window.dispatchEvent(new Event('storage'));

      alert('Zakup udany! Pliki odnajdziesz w zakładce "Zakupione"');
      router.push('/my-stuff');

    } catch (error: unknown) {
      console.error(error);
      let message = 'Nieznany błąd';
      if (error instanceof Error) message = error.message;
      alert('Błąd zapisu: ' + message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bramka Płatności</h1>
        
        <div className={styles.summary}>
          <p>Do zapłaty:</p>
          <div className={styles.total}>{totalPrice.toFixed(2)} zł</div>
          <p className="text-sm text-stone-500 mt-2">Ilość produktów: {items.length}</p>
        </div>

        <div className={styles.methods}>
          <span className={`${styles.methodBadge} ${styles.activeMethod}`}>BLIK</span>
          <span className={styles.methodBadge}>Karta</span>
          <span className={styles.methodBadge}>Przelew</span>
        </div>

        {loading ? (
            <p className={styles.processing}>Przetwarzanie płatności...</p>
        ) : (
            <div className={styles.actions}>
            <button 
                onClick={() => handleTransaction('success')} 
                className={`${styles.payBtn} ${styles.success}`}
            >
                Płatność udana ✅
            </button>
            <button 
                onClick={() => handleTransaction('fail')} 
                className={`${styles.payBtn} ${styles.fail}`}
            >
                Odrzucenie transakcji ❌
            </button>
            </div>
        )}
      </div>
    </div>
  );
}