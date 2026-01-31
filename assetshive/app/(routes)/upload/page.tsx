'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import { User } from '@supabase/supabase-js';

interface FileItem {
  id: string;
  file: File;
  preview: string;
  name: string;
  price: string;
  type: 'image' | 'animation';
  is_active: boolean;
}

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- SPRAWDZANIE USERA ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    checkUser();
  }, []);

  // --- HANDLERY PLIKÓW ---

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const newItems: FileItem[] = Array.from(newFiles).map((file) => {
      const isVideo = file.type.startsWith('video/');
      const fileType = isVideo ? 'animation' : 'image';
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        name: file.name.split('.')[0],
        price: '',
        type: fileType as 'image' | 'animation',
        is_active: false
      };
    });

    setFiles((prev) => [...prev, ...newItems]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = '';
  };

  // --- EDYCJA I USUWANIE ---

  const updateItem = (id: string, field: 'name' | 'price', value: string) => {
    setFiles((prev) => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const requestDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setFiles((prev) => prev.filter(item => item.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // --- UPLOAD DO SUPABASE ---

  const handleUploadAll = async () => {
    if (!user || files.length === 0) return;
    setLoading(true);

    try {
      // Uploadujemy pliki równolegle
      await Promise.all(files.map(async (item) => {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Storage
        const { error: uploadError } = await supabase.storage
          .from('assets_bucket')
          .upload(filePath, item.file);

        if (uploadError) throw uploadError;

        // Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('assets_bucket')
          .getPublicUrl(filePath);

        // Database Insert
        const parsedPrice = parseFloat(item.price.replace(',', '.')) || 0;

        const { error: dbError } = await supabase
          .from('assets')
          .insert({
            title: item.name,
            description: '', // Opcjonalnie można dodać pole opisu
            price: parsedPrice,
            file_url: publicUrl,
            file_type: item.type,
            user_id: user.id
          });

        if (dbError) throw dbError;
      }));

      alert(`Pomyślnie dodano ${files.length} elementów do ula! 🐝`);
      setFiles([]); // Czyścimy grid
      router.refresh();

    } catch (error: unknown) {
      console.error('Upload error:', error);
      let msg = 'Wystąpił błąd';
      if (error instanceof Error) msg = error.message;
      alert('Błąd podczas wysyłania: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container} onDragEnter={handleDrag}>
      
      <div className={styles.header}>
        <h1 className={styles.title}>🐝 Dodaj swoje zasoby 🐝</h1>
        <p className={styles.subtitle}>Przeciągnij pliki lub kliknij plusik, aby dodać nowe assety!</p>
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        
        {/* KARTA "DODAJ" */}
        <div 
          className={`${styles.addCard} ${dragActive ? styles.active : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragActive(false);
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className={styles.hiddenInput}
            onChange={handleChange}
          />
          <svg className={styles.addIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className={styles.addText}>Dodaj pliki</span>
        </div>

        {/* KARTY PLIKÓW */}
        {files.map((item) => (
          <div key={item.id} className={styles.fileCard}>
            
            {/* Przycisk Usuwania */}
            <button className={styles.deleteBtn} onClick={() => requestDelete(item.id)} title="Usuń">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Podgląd */}
            <div className={styles.previewWrapper}>
              {item.type === 'image' ? (
                <Image 
                  src={item.preview} 
                  alt="Preview" 
                  fill 
                  className={styles.previewImage}
                  unoptimized 
                />
              ) : (
                <video src={item.preview} className={styles.previewVideo} muted loop autoPlay playsInline />
              )}
              <div className={styles.typeBadge}>
                {item.type === 'animation' ? 'Wideo' : 'Obraz'}
              </div>
            </div>

            {/* Formularz */}
            <div className={styles.cardForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Nazwa</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Nazwa assetu"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Cena (PLN)</label>
                <div className={styles.priceWrapper}>
                  <input 
                    type="number" 
                    className={styles.input} 
                    placeholder="0"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                  />
                  <span className={styles.currency}>zł</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DOLNY PASEK AKCJI (Pojawia się, gdy są pliki) */}
      {files.length > 0 && (
        <div className={styles.staticActions}>
           <button onClick={handleUploadAll} disabled={loading} className={styles.uploadBtn}>
             {loading ? (
                <>
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation: 'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                  Wysyłanie...
                </>
             ) : (
                <>Wrzucaj wszystko ({files.length}) 🚀</>
             )}
           </button>
        </div>
      )}

      {/* MODAL POTWIERDZENIA USUWANIA */}
      {deleteConfirmId && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialogBox}>
            <h3 className={styles.dialogTitle}>Usunąć ten plik?</h3>
            <p className={styles.dialogText}>Tej operacji nie można cofnąć.</p>
            <div className={styles.dialogButtons}>
              <button onClick={cancelDelete} className={styles.btnCancel}>Anuluj</button>
              <button onClick={confirmDelete} className={styles.btnConfirm}>Usuń</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}