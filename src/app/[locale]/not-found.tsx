'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 1rem'
    }}>
      <h1 style={{
        fontSize: '8rem',
        fontWeight: 'bold',
        color: '#e5e7eb',
        marginBottom: '1rem',
        lineHeight: 1
      }}>404</h1>
      <h2 style={{
        fontSize: '1.875rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '1rem'
      }}>{t('title')}</h2>
      <p style={{
        color: '#4b5563',
        maxWidth: '28rem',
        marginBottom: '2rem'
      }}>
        {t('description')}
      </p>
      <Link 
        href="/"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          padding: '0.75rem 2rem',
          borderRadius: '9999px',
          fontWeight: '600',
          textDecoration: 'none',
          transition: 'opacity 0.2s'
        }}
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
