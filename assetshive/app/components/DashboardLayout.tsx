'use client';

import { useState } from 'react';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
                <path d="M3 12h18M3 6h18M3 18h18" /> // Ikona Hamburger (otwórz)
              )}
            </svg>
          </button>
        </div>

        {/* Nawigacja */}
        <nav className={styles.navList}>
          <NavItem icon={<HomeIcon />} label="Główna" expanded={isExpanded} />
          <NavItem icon={<CubeIcon />} label="Moje Assety" expanded={isExpanded} />
          <NavItem icon={<HeartIcon />} label="Ulubione" expanded={isExpanded} />
          <NavItem icon={<SettingsIcon />} label="Ustawienia" expanded={isExpanded} />
        </nav>
      </aside>


      {/* --- PRAWY OBSZAR (MAIN) --- */}
      <main className={styles.main}>
        
        {/* Nagłówek z nazwą projektu */}
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.accent}>⬢</span> AssetsHive
          </h1>
        </header>

        {/* Miejsce na treść podstrony */}
        <div className={styles.content}>
          {children}
        </div>

        {/* Stopka */}
        <footer className={styles.footer}>
          &copy; 2026 AssetsHive - Sebastian Miler - Szymon Muttka - Zbudowane z 💛 do Aplikacji Wysokopoziomowych w Aplikacjach Internetowych.
        </footer>

      </main>
    </div>
  );
}

function NavItem({ icon, label, expanded }: { icon: React.ReactNode, label: string, expanded: boolean }) {
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
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
}
function CubeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
}
function HeartIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
}
function SettingsIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
}