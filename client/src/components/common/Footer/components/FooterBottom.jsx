import React from 'react';
import { Link } from 'react-router-dom';

export default function FooterBottom({ currentYear, t }) {
  return (
    <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 text-center md:flex md:justify-between md:items-center md:text-left">
      <p className="text-xs text-gray-400 dark:text-gray-500">
        &copy; {currentYear} {t('footer.copyright')}
      </p>
      <div className="mt-2 md:mt-0 flex justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
        <Link
          to="/terms"
          className="hover:text-blue-600 !no-underline transition-colors dark:hover:text-blue-400"
        >
          {t('footer.terms')}
        </Link>
        <Link
          to="/privacy"
          className="hover:text-blue-600 !no-underline transition-colors dark:hover:text-blue-400"
        >
          {t('footer.privacy')}
        </Link>
      </div>
    </div>
  );
}
