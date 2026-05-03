"use client";
import styles from './Navbar.module.css';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <nav className={`glass-panel ${styles.navbar}`}>
      <div className={styles.logo}>
        <Link href="/">
          VoteSmart<span className={styles.dot}>.</span>
        </Link>
      </div>
      <div className={styles.actions}>
        <button onClick={toggleLanguage} className={`glass-button ${styles.langBtn}`}>
          {language === 'en' ? 'EN | HI' : 'HI | EN'}
        </button>
      </div>
    </nav>
  );
}
