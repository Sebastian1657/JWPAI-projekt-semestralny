'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/zustand';
import EditModal from '@/app/components/edit/EditModal';
import styles from './account.module.css';

export default function Account() {
    const user = useUserStore((state) => state.user);
    const setGlobalUser = useUserStore((state) => state.setUser);
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    
    useEffect(() => {
        const initAuth = async () => {
            if (!user) {
                const { data: { user: sbUser } } = await supabase.auth.getUser();
                if (!sbUser) {
                    router.push('/');
                } else {
                    setGlobalUser(sbUser);
                }
            }
            setIsChecking(false);
        };

        initAuth();
    }, [user, router, setGlobalUser]);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Brak danych';
        return new Date(dateString).toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if(error) {
            console.error(error.message);
        }
        useUserStore((state) => null);
        router.push('/');
      };

    const toggleEditModal = async () => {
        setIsEditModalOpen(true);
    }

    const handleDeleteAccount = async () => {
        if (!isDeleteConfirming) {
            setIsDeleteConfirming(true);
            // Automatyczne anulowanie potwierdzenia po 10 sekundach, jeśli nic nie kliknie
            setTimeout(() => setIsDeleteConfirming(false), 10000);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/delete-user', { method: 'POST' });

            if (response.ok) {
                await supabase.auth.signOut();
                setGlobalUser(null);
                router.push('/');
            } else {
                alert('Błąd: Nie udało się usunąć konta.');
            }
        } catch (err) {
            console.error('Błąd usuwania:', err);
        } finally {
            setLoading(false);
            setIsDeleteConfirming(false);
        }
    };

    if (isChecking) {
        return <div className={styles.loadingScreen}>Ładowanie profilu...</div>;
    }

    if (!user) return null;

    return (
        <>
        <div className={styles.accountInfo}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
            <h2 className={styles.accountH2}>Dane konta</h2>
            <hr className={styles.lineTop} />
            <div className={styles.infoRow}>
                <h3 className={styles.categoryName}>Nazwa użytkownika: </h3>
                <p className={styles.categoryValue}>{user ? user.user_metadata?.display_name : ''}</p>
            </div>
            <div className={styles.infoRow}>
                <h3 className={styles.categoryName}>Email: </h3>
                <p className={styles.categoryValue}>{user ? user.email : ''}</p>
            </div>
            <div className={styles.infoRow}>
                <h3 className={styles.categoryName}>Hasło: </h3>
                <p className={styles.categoryValue}>********</p>
            </div>
            <div className={styles.infoRow}>
                <h3 className={styles.categoryName}>Członek od: </h3>
                <p className={styles.categoryValue}>{user ? formatDate(user.created_at) : ''}</p>
            </div>
            <div className={styles.infoRow}>
                <h3 className={styles.categoryName}>Ostatnio widziany: </h3>
                <p className={styles.categoryValue}>{user ? formatDate(user.last_sign_in_at) : ''}</p>
            </div>
            <div className={styles.infoRow}>
                <button className={styles.optionButton} onClick={toggleEditModal}>Edytuj dane</button>
                <button className={styles.optionButton} onClick={handleLogout}>Wyloguj się</button>
            </div>
        </div>
        <div className={styles.dangerZone}>
            <hr className={styles.lineBottom} />
            <h2 className={styles.accountH2}>Niebezpieczna strefa</h2>
            <div className={styles.infoRow}>
                <h3 className={styles.categoryNameRed}>Usuń swoje konto</h3>
                <button 
                    className={styles.optionButtonRed} 
                    onClick={handleDeleteAccount}
                    disabled={loading}
                >
                    {loading ? 'Usuwanie...' : isDeleteConfirming ? 'Czy jesteś tego pewny? Tej akcji nie da się cofnąć!' : 'Usuń konto'}
                </button>
            </div>
        </div>
        <main>
            <EditModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
            />
        </main>
        </>
    );
}