'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

// Typ Assetu
interface Asset {
  id: string;
  title: string;
  price: number;
  file_url: string;
  file_type: 'image' | 'animation';
  is_active: boolean;
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Asset | null>(null);
  const router = useRouter();

  // 1. Pobieranie danych
  useEffect(() => {
    const fetchMyProducts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/logowanie');
        return;
      }

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setProducts(data);
      setLoading(false);
    };

    fetchMyProducts();
  }, [router]);

  // Aktualizacja produktu
  const handleUpdateProduct = (updatedAsset: Asset) => {
    setProducts((prev) => 
      prev.map((p) => (p.id === updatedAsset.id ? updatedAsset : p))
    );
    setSelectedProduct(updatedAsset);
  };

  // Usunięcie produktu
  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="flex h-64 items-center justify-center text-stone-500">
           Ładowanie Twoich skarbów... 🐝
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Moje Wystawione Produkty</h1>
          <p className={styles.subtitle}>Zarządzaj swoją kolekcją w sklepie.</p>
        </div>
        <div className="text-sm text-stone-500">
          Łącznie: <strong>{products.length}</strong>
        </div>
      </div>

      <div className={styles.grid}>
        {products.length === 0 ? (
          <div className="col-span-full py-10 text-center text-stone-500">
            Pusto w ulu! Nie wystawiłeś jeszcze żadnych produktów.
            <br />
            <a href="/upload" className="mt-4 inline-block text-amber-600 hover:underline">
              Dodaj coś teraz
            </a>
          </div>
        ) : (
          products.map((product) => (
            <div 
              key={product.id} 
              className={styles.card}
              onClick={() => setSelectedProduct(product)}
            >
              {/* Kropka statusu */}
              <div 
                className={`${styles.statusDot} ${product.is_active ? styles.activeDot : styles.inactiveDot}`} 
                title={product.is_active ? "Aktywny w sklepie" : "Ukryty"}
              />

              <div className={styles.imageWrapper}>
                {product.file_type === 'image' ? (
                  <Image 
                    src={product.file_url} 
                    alt={product.title} 
                    fill 
                    className={styles.image} 
                    unoptimized
                  />
                ) : (
                  <video src={product.file_url} className="h-full w-full object-cover" />
                )}
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{product.title}</h3>
                <p className={styles.cardPrice}>{product.price.toFixed(2)} zł</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL SZCZEGÓŁÓW */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          onUpdate={handleUpdateProduct}
          onDelete={handleDeleteProduct}
        />
      )}
    </div>
  );
}

// --- SUBKOMPONENT MODALA ---
function ProductDetailModal({ 
  product, 
  onClose, 
  onUpdate, 
  onDelete 
}: { 
  product: Asset; 
  onClose: () => void;
  onUpdate: (a: Asset) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  
  const [tempTitle, setTempTitle] = useState(product.title);
  const [tempPrice, setTempPrice] = useState(product.price.toString());
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Funkcja zapisu zmian
  const saveChanges = async (updates: Partial<Asset>) => {
    setProcessing(true);
    const { error } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', product.id);
    if (error) {
      alert('Błąd aktualizacji: ' + error.message);
    } else {
      onUpdate({ ...product, ...updates });
    }
    setProcessing(false);
  };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (tempTitle !== product.title) saveChanges({ title: tempTitle });
    };

    const handlePriceBlur = () => {
        setIsEditingPrice(false);
        const numPrice = parseFloat(tempPrice);
        if (!isNaN(numPrice) && numPrice !== product.price) {
            saveChanges({ price: numPrice });
        } else {
            setTempPrice(product.price.toString());  
        }
    };

    const handleToggleActive = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const isActive = e.target.checked;
        await saveChanges({ is_active: isActive });
    };

  const handleDelete = async () => {
    setProcessing(true);
    try {
        const fileName = product.file_url.split('assets_bucket/').pop();
        if (fileName) {
            const { error: storageError } = await supabase
            .storage
            .from('assets_bucket')
            .remove([fileName]);

            if (storageError) {
                console.error('Błąd usuwania pliku ze Storage:', storageError);
                throw new Error('Nie udało się usunąć pliku ze storage.');
            }
        }

        const { error: dbError } = await supabase
            .from('assets')
            .delete()
            .eq('id', product.id);
        if (dbError) {
            throw dbError;
        }
        onDelete(product.id);
    } catch (error: unknown) {
        let msg = 'Wystąpił nieznany błąd';
        if (error instanceof Error) {
            msg = error.message;
        } 
        alert('Nie udało się usunąć: ' + msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className={styles.modalHeader}>
            {product.file_type === 'image' ? (
                <Image src={product.file_url} alt={product.title} className={styles.modalImage} width={120} height={120}/>
            ) : (
                <video src={product.file_url} className={styles.modalImage} />
            )}
          
          <div className={styles.modalInfo}>
            {/* EDYCJA TYTUŁU */}
            <div className={styles.editableField}>
              {isEditingTitle ? (
                <input 
                  autoFocus
                  className={styles.editInput}
                  value={tempTitle}
                  onChange={e => setTempTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={e => e.key === 'Enter' && handleTitleBlur()}
                />
              ) : (
                <>
                  <span className={styles.displayValue}>{product.title}</span>
                  <button onClick={() => setIsEditingTitle(true)} className={styles.editIconBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                </>
              )}
            </div>

            {/* EDYCJA CENY */}
            <div className={styles.editableField}>
              {isEditingPrice ? (
                 <div className="flex items-center gap-2">
                   <input 
                    autoFocus
                    type="number"
                    className={styles.editInput}
                    value={tempPrice}
                    onChange={e => setTempPrice(e.target.value)}
                    onBlur={handlePriceBlur}
                    onKeyDown={e => e.key === 'Enter' && handlePriceBlur()}
                   />
                   <span>zł</span>
                 </div>
              ) : (
                <>
                  <span className={styles.displayPrice}>{product.price.toFixed(2)} zł</span>
                  <button onClick={() => setIsEditingPrice(true)} className={styles.editIconBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* AKCJE NA DOLE */}
        <div className={styles.modalActions}>
          {/* Checkbox Aktywności */}
          <label className={styles.switchLabel}>
            <input 
              type="checkbox" 
              className={styles.switchInput} 
              checked={product.is_active}
              onChange={handleToggleActive}
              disabled={processing}
            />
            <span className={styles.switchSlider}></span>
            <span>{product.is_active ? 'Widoczny w sklepie' : 'Ukryty'}</span>
          </label>

          {/* Przycisk Usuwania */}
          <button 
            className={styles.deleteActionBtn} 
            onClick={() => setShowDeleteConfirm(true)}
            disabled={processing || showDeleteConfirm}
          >
            Usuń produkt
          </button>
        </div>

        {/* DIALOG POTWIERDZENIA */}
        {showDeleteConfirm && (
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>
              Czy na pewno chcesz bezpowrotnie usunąć <b>{product.title}</b>?
            </p>
            <div className={styles.confirmActions}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded bg-white px-3 py-1 text-sm text-stone-600 border border-stone-300 hover:bg-stone-50"
              >
                Anuluj
              </button>
              <button 
                onClick={handleDelete}
                disabled={processing}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                {processing ? 'Usuwanie...' : 'Tak, usuń'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}