import React from 'react';
import { Link } from 'react-router-dom';

const menuItems = [
  { labelKey: 'nav.home', to: '/' },
  { labelKey: 'nav.subjects', to: '/subjects' },
  { labelKey: 'nav.documents', to: '/documents' },
  { labelKey: 'nav.rank', to: '/rank' },
];

export default function FooterMenu({ t }) {
  return (
    <div className="lg:col-span-3 lg:pl-8">
      <h3 className="mt-1.5 text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-white mb-4 h-6 flex items-center">
        {t('footer.menu')}
      </h3>
      <ul className="space-y-3">
        {menuItems.map((item) => (
          <li key={item.to}>
            <Link
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 !no-underline transition"
              to={item.to}
            >
              {t(item.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
