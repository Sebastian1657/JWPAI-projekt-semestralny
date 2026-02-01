'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Asset } from '@/types';
import styles from './page.module.css';

export default function BasketPage() {
  const [cartItems, setCartItems] = useState<Asset[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadCart = () => {
      const stored = localStorage.getItem('basket');
      if (stored) {
        try {
           setCartItems(JSON.parse(stored));
        } catch (e) {
           console.error("Błąd parsowania koszyka", e);
        }
      }
    };
    loadCart();
  }, []);

  const removeItem = (id: string) => {
    const newCart = cartItems.filter(item => item.id !== id);
    setCartItems(newCart);
    localStorage.setItem('basket', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Twój Koszyk</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>Twój koszyk jest pusty.</h2>
          <p>Znajdź coś dla siebie w galerii!</p>
        </div>
      ) : (
        <>
          <div className={styles.cartList}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div style={{ position: 'relative', width: 80, height: 80 }}>
                    {item.file_type === 'image' ? (
                        <Image 
                            src={item.file_url} 
                            alt={item.title} 
                            fill 
                            className={styles.itemImage}
                            unoptimized
                        />
                    ) : (
                        <video src={item.file_url} className={styles.itemImage} />
                    )}
                </div>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className="text-sm text-stone-500">ID: {item.id.slice(0, 8)}...</p>
                </div>
                <div className={styles.itemPrice}>{item.price.toFixed(2)} zł</div>
                <button onClick={() => removeItem(item.id)} className={styles.removeBtn}>
                  Usuń
                </button>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Łącznie do zapłaty:</span>
              <span className={styles.totalValue}>{totalPrice.toFixed(2)} zł</span>
            </div>
            <button onClick={() => router.push('/payment')} className={styles.checkoutBtn}>
              Przejdź do płatności
            </button>
          </div>
        </>
      )}
    </div>
  );
}