'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import { Asset } from '@/types';

export default function Home() {
  const [galleryItems, setGalleryItems] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchPromoted = async () => {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('file_type', 'image')
        .eq('is_active', true)
        .limit(8)
        .order('created_at', { ascending: false });
      
      if (data) {
        setGalleryItems(data);
      }
    };

    fetchPromoted();
  }, []);

  const displayItems = [...galleryItems, ...galleryItems];

  return (
    <main className={styles.container}>
      
      {/* LOGO */}
      <div className={styles.logoWrapper}>
        <h1 className={styles.logo}>AssetsHive 🐝</h1>
        <p className={styles.sublogo}>Najsłodsze zasoby w sieci</p>
      </div>

      {/* PRZESUWAJĄCA SIĘ GALERIA */}
      {galleryItems.length > 0 && (
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeTrack}>
            {displayItems.map((item, index) => (
              // Używamy index w key, bo duplikujemy itemy i ID się powtarzają
              <div key={`${item.id}-${index}`} className={styles.marqueeItem}>
                <Image 
                  src={item.file_url} 
                  alt={item.title} 
                  fill 
                  className={styles.marqueeImage} 
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HEXAGONALNE PRZYCISKI */}
      <div className={styles.hexGroup}>
        
        {/* Przycisk Główny */}
        <div className={styles.hexWrapper}>
          <Link href="/pictures" className={styles.hexBtn}>
            <div className={styles.hexIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <span className={styles.hexText}>Znajdź coś<br/>dla siebie!</span>
          </Link>
        </div>

        {/* Przycisk Drugi (Placeholder) */}
        <div className={styles.hexWrapper}>
          <div className={`${styles.hexBtn} ${styles.hexBtnSecondary}`}>
            <div className={styles.hexIcon}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            <span className={styles.hexText}>Zarejestruj<br/>Się!</span>
          </div>
        </div>

      </div>

    </main>
  );
}