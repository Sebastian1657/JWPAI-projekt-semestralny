'use client';

import { useState } from 'react';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logged, setLogged] = useState(false);

  const toggleLogin = () => {
    setLogged(!logged);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.container}>
      <aside 
        className={`${styles.sidebar} ${isExpanded ? styles.sidebarExpanded : styles.sidebarCollapsed}`}
      >
        {/* Hamburger na górze paska */}
        <div className={styles.sidebarHeader} style={{ justifyContent: isExpanded ? 'flex-end' : 'center' }}>
          <button onClick={toggleSidebar} className={styles.hamburgerBtn}>
            {/* Ikona Hamburgera / Strzałki */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isExpanded ? (
                <path d="M18 6L6 18M6 6l12 12" /> // Ikona X (zamknij)
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" /> // Ikona Hamburger
              )}
            </svg>
          </button>
        </div>

        {/* Nawigacja */}
        <nav className={styles.navList}>
          <NavItem icon={<HomeIcon />} label="Główna" expanded={isExpanded} />
          <NavItem icon={<PictureIcon />} label="Zdjęcia" expanded={isExpanded} />
          <NavItem icon={<AnimationIcon />} label="Animacje" expanded={isExpanded} />
          <NavItem icon={<UploadIcon />} label="Wrzutka" expanded={isExpanded} loggedIn={logged} />
          <NavItem icon={<BasketIcon />} label="Koszyk" expanded={isExpanded} loggedIn={logged} />
          <NavItem icon={<ContactIcon />} label="Kontakt" expanded={isExpanded} />
        </nav>

        <div className={styles.userProfile}>
            <div className={styles.avatar}>
               JK
            </div>
            
            {isExpanded && (
              <div className={styles.userInfo}>
                <div className={styles.userName}>Jan Kowalski</div>
                <div className={styles.userEmail}>jan@assets.hive</div>
              </div>
            )}
        </div>
      </aside>

      <main className={styles.main}>
        
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.accent}>⬢</span> AssetsHive
          </h1>
        </header>

        <div className={styles.content}>
          {children}
        </div>

        <footer className={styles.footer}>
          &copy; 2026 AssetsHive - Sebastian Miler - Szymon Muttka - Zbudowane z 💛 do Aplikacji Wysokopoziomowych w Aplikacjach Internetowych
        </footer>

      </main>
    </div>
  );
}

function NavItem({ icon, label, expanded, loggedIn = true}: { icon: React.ReactNode, label: string, expanded: boolean, loggedIn?: boolean}) {
  if (!loggedIn) {
    return null;
  }
  return (
    <div className={styles.navItem}>
      <div className={styles.navIcon}>
        {icon}
      </div>
      {expanded && <span className={styles.navLabel}>{label}</span>}
    </div>    
  );
}

// --- Proste Ikony SVG (Placeholdery) ---
function HomeIcon() {
  return <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
}
function PictureIcon() {
  return <svg width="800px" height="800px" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_901_1422)"><path d="M18 22.0315L11 15.0155C10.172 14.1875 9.836 14.1725 9 15.0085L1 23.0005V30.0005C1 30.5525 1.447 31.0005 2 31.0005H30C30.553 31.0005 31 30.5525 31 30.0005V2.00049C31 1.44749 30.553 1.00049 30 1.00049H2C1.447 1.00049 1 1.44749 1 2.00049V19.0005M16 24.0002L23 17.0002C23.836 16.1642 24.172 16.1722 25 17.0002L28 20.0002M23 9.00019C23 10.1042 22.104 11.0002 21 11.0002C19.896 11.0002 19 10.1042 19 9.00019C19 7.89619 19.896 7.00019 21 7.00019C22.104 7.00019 23 7.89619 23 9.00019Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_901_1422"><rect width="32" height="32" fill="white"/></clipPath></defs></svg>
}
function AnimationIcon() {
  return <svg fill="currentColor" stroke="none" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22,11H12a1,1,0,0,0-1,1V22a1,1,0,0,0,1,1H22a1,1,0,0,0,1-1V12A1,1,0,0,0,22,11ZM21,21H13V13h8ZM2,13a1,1,0,0,1-1-1V2A1,1,0,0,1,2,1H12a1,1,0,0,1,0,2H3v9A1,1,0,0,1,2,13ZM17,6a1,1,0,0,1,0,2H8v9a1,1,0,0,1-2,0V7A1,1,0,0,1,7,6Z"/></svg>
}
function UploadIcon() {
  return <svg fill="currentColor" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.71,7.71,11,5.41V15a1,1,0,0,0,2,0V5.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-4-4a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-4,4A1,1,0,1,0,8.71,7.71ZM21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V13a1,1,0,0,0-2,0v6a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12Z"/></svg>
}
function ContactIcon() {
  return <svg fill="currentColor" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.44,13c-.22,0-.45-.07-.67-.12a9.44,9.44,0,0,1-1.31-.39,2,2,0,0,0-2.48,1l-.22.45a12.18,12.18,0,0,1-2.66-2,12.18,12.18,0,0,1-2-2.66L10.52,9a2,2,0,0,0,1-2.48,10.33,10.33,0,0,1-.39-1.31c-.05-.22-.09-.45-.12-.68a3,3,0,0,0-3-2.49h-3a3,3,0,0,0-3,3.41A19,19,0,0,0,18.53,21.91l.38,0a3,3,0,0,0,2-.76,3,3,0,0,0,1-2.25v-3A3,3,0,0,0,19.44,13Zm.5,6a1,1,0,0,1-.34.75,1.05,1.05,0,0,1-.82.25A17,17,0,0,1,4.07,5.22a1.09,1.09,0,0,1,.25-.82,1,1,0,0,1,.75-.34h3a1,1,0,0,1,1,.79q.06.41.15.81a11.12,11.12,0,0,0,.46,1.55l-1.4.65a1,1,0,0,0-.49,1.33,14.49,14.49,0,0,0,7,7,1,1,0,0,0,.76,0,1,1,0,0,0,.57-.52l.62-1.4a13.69,13.69,0,0,0,1.58.46q.4.09.81.15a1,1,0,0,1,.79,1Z"/></svg>;
}
function BasketIcon() {
  return <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.31063 11.2425C2.15285 10.6114 2.63021 10 3.28078 10H20.7192C21.3698 10 21.8472 10.6114 21.6894 11.2425L19.8787 18.4851C19.6561 19.3754 18.8562 20 17.9384 20H6.06155C5.14382 20 4.34385 19.3754 4.12127 18.4851L2.31063 11.2425Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 10L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 10L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>;
}