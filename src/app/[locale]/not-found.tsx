'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('title')}</h2>
      <p className="text-gray-600 max-w-md mb-8">
        {t('description')}
      </p>
      <Link 
        href="/"
        className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
