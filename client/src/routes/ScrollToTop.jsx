import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search, hash, key } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;

    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    document
      .querySelectorAll('main, [data-scroll-container]')
      .forEach((element) => {
        element.scrollTop = 0;
      });
  }, [pathname, search, hash, key]);

  return null;
};

export default ScrollToTop;
