'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Upewnij się, że masz ten plik
import styles from './page.module.css';
import { User } from '@supabase/supabase-js';

export default function UploadPage() {
  // Stan Auth
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Stan UI/Formularza
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // --- 1. OCHRONA TRASY (REDIRECT JEŚLI NIEZALOGOWANY) ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Jeśli brak sesji -> przekieruj do logowania
        router.replace('/logowanie'); 
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router]);

  // --- HANDLERS (UI) ---

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      alert('Proszę wrzucić plik graficzny lub wideo.');
      return;
    }
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  // --- 2. LOGIKA UPLOADU DO SUPABASE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);

    try {
      // A. Przygotowanie ścieżki: USER_ID / TIMESTAMP.EXT
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; 

      // B. Upload pliku do Storage
      const { error: uploadError } = await supabase.storage
        .from('assets_bucket') // <--- Upewnij się, że tak nazwałeś bucket w panelu
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // C. Pobranie publicznego URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets_bucket')
        .getPublicUrl(filePath);

      // D. Zapis metadanych w bazie (tabela 'assets')
      const { error: dbError } = await supabase
        .from('assets')
        .insert({
          title: title,
          description: description,
          file_url: publicUrl,
          file_type: file.type.startsWith('image') ? 'image' : 'animation',
          user_id: user.id
        });

      if (dbError) throw dbError;

      alert('Wrzutka udana! 🐝');
      
      // Reset formularza
      removeFile();
      setTitle('');
      setDescription('');
      
      // Opcjonalnie: przekieruj do "Moich Rzeczy"
      // router.push('/my-stuff');

    } catch (error: unknown) {
      console.error('Błąd uploadu:', error);
      
      let message = 'Wystąpił nieznany błąd';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }

      alert('Nie udało się wysłać pliku: ' + message);
    } finally {
      setLoading(false);
    }
  };

  // Jeśli user nie jest jeszcze załadowany (trwa sprawdzanie sesji), 
  // nie pokazuj formularza, żeby nie mignął przed przekierowaniem.
  if (!user) {
    return null; // Lub prosty spinner ładowania
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dodaj Wrzutkę 🐝</h1>
          <p className={styles.subtitle}>
            Podziel się swoimi zasobami z rojem. Obsługujemy JPG, PNG, MP4.
          </p>
        </div>

        <form onSubmit={handleSubmit} onDragEnter={handleDrag}>
          
          {/* DRAG & DROP AREA */}
          {!file ? (
            <div
              className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                className={styles.hiddenInput}
                onChange={handleChange}
                accept="image/*,video/*"
              />
              <div className={styles.dropzoneContent}>
                <div className={styles.iconWrapper}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <div>
                  <p className={styles.dropTextMain}>Kliknij lub przeciągnij plik tutaj</p>
                  <p className={styles.dropTextSub}>Maksymalny rozmiar: 10MB</p>
                </div>
              </div>
            </div>
          ) : (
            /* FILE PREVIEW */
            <div className={styles.previewContainer}>
              <div className={styles.fileInfo}>
                {preview && file?.type.startsWith('image/') ? (
                  <Image 
                    src={preview} 
                    alt="Preview" 
                    width={48} 
                    height={48} 
                    className={styles.previewImage} 
                    unoptimized 
                  />
                ) : (
                  <div className={styles.iconWrapper} style={{width: 48, height: 48, margin: 0}}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  </div>
                )}
                <div>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={(file.size > 10 * 1024 * 1024) ? styles.errorText : styles.fileSize}>
                    {(file.size / (1024*1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button type="button" onClick={removeFile} className={styles.removeBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
            </div>
          )}

          {/* INPUT FIELDS */}
          <div className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Tytuł assetu</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="np. Złote plastry miodu 3D"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Opis (opcjonalnie)</label>
              <textarea 
                className={styles.textarea} 
                placeholder="Opisz co zawiera ten plik..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading || !file}>
              {loading ? (
                <>
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation: 'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                  Wysyłanie do ula...
                </>
              ) : (
                <>Wrzucaj!</>
              )}
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}