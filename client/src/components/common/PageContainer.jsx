import React from 'react';

export const PageContainer = ({
  as: Component = 'main',
  children,
  className = '',
}) => (
  <Component
    className={`mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8 ${className}`}
  >
    {children}
  </Component>
);
