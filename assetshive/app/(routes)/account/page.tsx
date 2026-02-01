'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/zustand';
import styles from './account.module.css';

export default function Account() {
    const user = useUserStore((state) => state.user);
    const router = useRouter();
    
    const checkIfSignedIn = async () => {
        if(user === null)
            router.push('/');
    }

    checkIfSignedIn();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if(error) {
            console.error(error.message);
        }
        useUserStore((state) => null);
        router.push('/');
      };

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
                <h3 className={styles.categoryName}>Łączne zarobki: </h3>
                <p className={styles.categoryValue}>-.-- zł</p>
            </div>
            <div className={styles.infoRow}>
                <button className={styles.optionButton}>Edytuj dane</button>
                <button className={styles.optionButton} onClick={handleLogout}>Wyloguj się</button>
            </div>
        </div>
        <div className={styles.dangerZone}>
            <hr className={styles.lineBottom} />
            <h2 className={styles.accountH2}>Niebezpieczna strefa</h2>
            <div className={styles.infoRow}>
                <h3 className={styles.categoryNameRed}>Usuń swoje konto</h3>
                <button className={styles.optionButtonRed}>Usuń konto</button>
            </div>
        </div>
        </>
    );
}