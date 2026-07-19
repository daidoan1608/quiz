import React from 'react';
import { useLanguage } from 'context/language/LanguageProvider';
import FooterBottom from './components/FooterBottom';
import FooterBrand from './components/FooterBrand';
import FooterContact from './components/FooterContact';
import FooterMenu from './components/FooterMenu';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <FooterBrand t={t} />
          <FooterMenu t={t} />
          <FooterContact t={t} />
        </div>

        <FooterBottom currentYear={currentYear} t={t} />
      </div>
    </footer>
  );
};

export default Footer;
