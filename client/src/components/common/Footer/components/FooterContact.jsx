import React from 'react';

export default function FooterContact({ t }) {
  return (
    <div className="lg:col-span-5">
      <h3 className="mt-1.5 text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-white mb-4 h-6 flex items-center">
        {t('footer.contact')}
      </h3>
      <ul className="space-y-4">
        <li className="flex items-start gap-3">
          <span className="material-symbols-outlined w-5 h-5 mt-[2px] text-blue-600 shrink-0">
            location_on
          </span>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {t('footer.address')}:{' '}
            </span>
            P316, Tầng 3 Nhà Hành chính, Học viện Nông nghiệp Việt Nam
          </div>
        </li>

        <li className="flex items-start gap-3">
          <span className="material-symbols-outlined w-5 h-5 mt-[2px] text-blue-600 shrink-0">
            call
          </span>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {t('footer.hotline')}:{' '}
            </span>
            (024) 62617701
          </div>
        </li>

        <li className="flex items-start gap-3">
          <span className="material-symbols-outlined w-5 h-5 mt-[2px] text-blue-600 shrink-0">
            mail
          </span>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              Email:{' '}
            </span>
            cntt@vnua.edu.vn
          </div>
        </li>
      </ul>
    </div>
  );
}
