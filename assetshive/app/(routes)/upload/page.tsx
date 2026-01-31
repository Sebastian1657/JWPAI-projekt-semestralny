'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './upload.module.css';

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  // Formularz
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

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
    // Prosta walidacja typu (możesz rozszerzyć o video)
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      alert('Proszę wrzucić plik graficzny lub wideo.');
      return;
    }

    setFile(selectedFile);

    // Generowanie podglądu
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    
    // --- MIEJSCE NA LOGIKĘ SUPABASE ---
    console.log('Wysyłanie:', { file, title, description });
    
    // Symulacja opóźnienia
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    alert('Pliki dodane do ula! 🐝');
    
    // Reset
    removeFile();
    setTitle('');
    setDescription('');
  };

  // Helper do formatowania rozmiaru pliku
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
             Wyślij plik
          </h1>
          <p className={styles.subtitle}>
            Wyślij swoje pliki! Obsługiwane formaty: JPG, PNG, GIF, MP4.
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
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
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
                  <Image src={preview} alt="Preview" className={styles.previewImage} />
                ) : (
                  <div className={styles.iconWrapper} style={{width: 48, height: 48, margin: 0}}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  </div>
                )}
                <div>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileSize}>{formatBytes(file.size)}</p>
                </div>
              </div>
              
              <button type="button" onClick={removeFile} className={styles.removeBtn} title="Usuń plik">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}

          <div className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Tytuł assetu</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Złote plastry miodu"
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
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation: 'spin 1s linear infinite'}}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  Wysyłanie pilków...
                </>
              ) : (
                <>Wrzucaj!</>
              )}
            </button>
          </div>

        </form>
      </div>
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}