import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

export const useHeaderNavigation = ({ language, location, navigate, t }) => {
  const navRef = useRef(null);
  const navItemRefs = useRef({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activePill, setActivePill] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navItems = useMemo(
    () => [
      { name: t('nav.home'), link: '/' },
      { name: t('nav.subjects'), link: '/subjects' },
      { name: t('nav.documents'), link: '/documents' },
      { name: t('nav.rank'), link: '/rank' },
    ],
    [t]
  );

  const isActive = useCallback(
    (path) =>
      path === '/'
        ? location.pathname === '/'
        : location.pathname === path ||
          location.pathname.startsWith(`${path}/`),
    [location.pathname]
  );

  useLayoutEffect(() => {
    const activePath = navItems.find((item) => isActive(item.link))?.link;
    const activeItem = activePath ? navItemRefs.current[activePath] : null;
    const nav = navRef.current;

    if (!activeItem || !nav) {
      setActivePill((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    setActivePill({
      left: itemRect.left - navRect.left,
      width: itemRect.width,
      opacity: 1,
    });
  }, [location.pathname, language, navItems, isActive]);

  const handleMobileNavClick = useCallback(
    (link) => {
      navigate(link);
      setShowMobileMenu(false);
    },
    [navigate]
  );

  return {
    activePill,
    handleMobileNavClick,
    isActive,
    navItemRefs,
    navItems,
    navRef,
    setShowMobileMenu,
    showMobileMenu,
  };
};
