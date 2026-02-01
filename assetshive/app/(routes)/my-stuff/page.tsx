'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Asset, LibraryItem } from '@/types';
import sharedStyles from '@/app/styles/SharedGrid.module.css';
/* import localStyles from './page.module.css'; */


export default function MyStuffPage() {
  const [library, setLibrary] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_library')
          .select(`
            asset_id,
            assets (
              id, title, price, file_url, file_type, author_name, user_id, is_active
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          const typedData = data as unknown as LibraryItem[];
          const myAssets = typedData
            .map((item) => item.assets)
            .filter((asset): asset is Asset => asset !== null);
            
          setLibrary(myAssets);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
            console.error('Błąd pobierania biblioteki:', err.message);
        } else {
            console.error('Nieznany błąd:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  const handleDownload = async (asset: Asset) => {
    try {
      const response = await fetch(asset.file_url);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = asset.file_url.split('.').pop()?.split('?')[0] || 'file';
      const safeTitle = asset.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeTitle}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Błąd pobierania:', error);
      window.open(asset.file_url, '_blank');
    }
  };

    return (
        <div className={sharedStyles.container}>
        <div className={sharedStyles.header}>
            <h1 className={sharedStyles.title}>Moje Zasoby</h1>
            <p className={sharedStyles.subtitle}>Tutaj znajdziesz wszystkie zakupione pliki gotowe do pobrania.</p>
        </div>

        {loading ? (
            <div className={sharedStyles.loadingState}>Ładowanie Twojej biblioteki...</div>
        ) : library.length === 0 ? (
            <div className={sharedStyles.emptyState}>
            <p>Nie masz jeszcze żadnych zasobów.</p>
            <Link href="/pictures" className={sharedStyles.link}>Przeglądaj sklep</Link>
            </div>
        ) : (
            <div className={sharedStyles.grid}>
            {library.map((asset) => (
                <div key={asset.id} className={sharedStyles.card}>
                
                {/* Sekcja Mediów */}
                <div className={sharedStyles.mediaWrapper}>
                    {/* Badge Typu */}
                    <div className={sharedStyles.typeBadge}>
                        {asset.file_type === 'image' ? (
                            <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            OBRAZ
                            </>
                        ) : (
                            <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            WIDEO
                            </>
                        )}
                    </div>

                    {/* Wyświetlanie */}
                    {asset.file_type === 'image' ? (
                        <Image 
                        src={asset.file_url} 
                        alt={asset.title} 
                        fill 
                        className={sharedStyles.cardImage} 
                        unoptimized 
                        onClick={() => window.open(asset.file_url, '_blank')}
                        />
                    ) : (
                        <video 
                        src={asset.file_url} 
                        className={sharedStyles.cardVideo} 
                        muted
                        playsInline
                        loop
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                        }}
                        onClick={() => window.open(asset.file_url, '_blank')}
                        />
                    )}
                </div>

                {/* Treść */}
                <div className={sharedStyles.cardContent}>
                    <div>
                    <h3 className={sharedStyles.cardTitle}>{asset.title}</h3>
                    <p className={sharedStyles.metaInfo}>Autor: {asset.author_name || 'Nieznany'}</p>
                    </div>
                    
                    <button 
                        onClick={() => handleDownload(asset)}
                        className={sharedStyles.fullBtn}
                        title="Pobierz plik"
                    >
                        <svg width="24" height="24"viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Pobierz plik
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}