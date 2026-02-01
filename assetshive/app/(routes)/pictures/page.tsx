'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import sharedStyles from '@/app/styles/SharedGrid.module.css';
import localStyles from './page.module.css';
import { User } from '@supabase/supabase-js';
import { Asset } from '@/types';

const ITEMS_PER_PAGE = 8;

export default function PicturesPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pobieranie danych
  useEffect(() => {
    const fetchPictures = async () => {
      setLoading(true);
      
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await supabase
        .from('assets')
        .select('*', { count: 'exact' })
        .eq('file_type', 'image')
        .eq('is_active', true)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Błąd pobierania:', error);
      } else {
        setAssets(data || []);
        setTotalItems(count || 0);
      }
      setLoading(false);
    };

    fetchPictures();
  }, [page]);

  // --- LOGIKA INTERAKCJI ---

  const handleAssetClick = (asset: Asset) => {
    if (!user) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('openLogin', 'true');
      router.push(`${pathname}?${params.toString()}`);
    } else {
      setSelectedAsset(asset);
    }
  };

  const handleAddToCart = (asset: Asset) => {
    const currentCart = JSON.parse(localStorage.getItem('basket') || '[]');
    if (!currentCart.find((item: Asset) => item.id === asset.id)) {
      const newCart = [...currentCart, asset];
      localStorage.setItem('basket', JSON.stringify(newCart));
      alert('🐝 Dodano do koszyka! 🐝');
      setSelectedAsset(null);
      window.dispatchEvent(new Event('cart-updated'));
    } else {
      alert('Ten produkt jest już w koszyku');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className={sharedStyles.container}>
      <div className={sharedStyles.header}>
        <h1 className={sharedStyles.title}>Galeria Grafik</h1>
        <p className={sharedStyles.subtitle}>Przeglądaj unikalne zasoby stworzone przez naszą społeczność</p>
      </div>

      {loading ? (
        <div className={localStyles.loadingContainer}>
            <svg className={localStyles.loadingIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        </div>
      ) : (
        <>
          {/* GRID */}
          <div className={sharedStyles.grid}>
            {assets.map((asset) => (
              <div key={asset.id} className={sharedStyles.card} onClick={() => handleAssetClick(asset)}>
                <div className={sharedStyles.mediaWrapper}>
                  <Image 
                    src={asset.file_url} 
                    alt={asset.title}
                    fill
                    className={sharedStyles.cardImage}
                    unoptimized
                  />
                </div>
                <div className={sharedStyles.cardContent}>
                  <div>
                    <h3 className={sharedStyles.cardTitle}>{asset.title}</h3>
                    <p className={sharedStyles.cardAuthor}>
                      Autor: {asset.author_name || 'Anonim'}
                    </p>
                  </div>
                  <div className={sharedStyles.cardFooter}>
                    <span className={sharedStyles.price}>{asset.price.toFixed(2)} zł</span>
                    <button className={sharedStyles.actionBtn}>
                      {user ? 'Szczegóły' : 'Zaloguj się po więcej'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINACJA */}
          {totalPages > 1 && (
            <div className={sharedStyles.pagination}>
              <button 
                className={sharedStyles.pageBtn} 
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                &larr; Poprzednia
              </button>
              <span className={sharedStyles.pageInfo}>
                Strona {page} z {totalPages}
              </span>
              <button 
                className={sharedStyles.pageBtn} 
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Następna &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL SZCZEGÓŁÓW */}
      {selectedAsset && (
        <div className={localStyles.overlay} onClick={(e) => e.target === e.currentTarget && setSelectedAsset(null)}>
          <div className={localStyles.modal}>
            <button className={localStyles.closeBtn} onClick={() => setSelectedAsset(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className={localStyles.modalImageWrapper}>
              <Image 
                src={selectedAsset.file_url} 
                alt={selectedAsset.title}
                fill
                className={localStyles.modalImage}
                unoptimized
              />
            </div>

            <div className={localStyles.modalContent}>
                <span className={localStyles.modalType}>Grafika Cyfrowa</span>
                <h2 className={localStyles.modalTitle}>{selectedAsset.title}</h2>
                <p className={localStyles.modalAuthor}>
                    Autor: {selectedAsset.author_name || 'Anonim'}
                </p>
                <p className={localStyles.modalDescription}>
                    {selectedAsset.description || 'Brak dodatkowego opisu dla tego zasobu.'}
                </p>

                <div className={localStyles.modalFooter}>
                    <span className={localStyles.modalPrice}>{selectedAsset.price.toFixed(2)} zł</span>
                    <button className={localStyles.addToCartBtn} onClick={() => handleAddToCart(selectedAsset)} >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    Dodaj do koszyka
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}