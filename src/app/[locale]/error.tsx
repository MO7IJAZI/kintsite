'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

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
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          padding: '0.75rem 2rem',
          borderRadius: '9999px',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
          transition: 'opacity 0.2s'
        }}
      >
        {t('retry')}
      </button>
    </div>
  );
}
