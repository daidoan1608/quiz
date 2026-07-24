import React from 'react';
import logoSchoolUrl from '../../../assets/images/logoschool.png';

export const AuthCard = ({
  children,
  navigate,
  subtitle,
  title,
}) => (
  <div className="auth-page min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="auth-card w-full max-w-md space-y-8 p-10 rounded-2xl shadow-xl">
      <div className="text-center">
        <img
          src={logoSchoolUrl}
          alt="Logo"
          className="mx-auto h-16 w-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        />
        <h2 className="aura-text-primary text-3xl font-extrabold tracking-tight">
          {title}
        </h2>
        <p className="aura-text-subtle mt-2 text-sm">
          {subtitle}
        </p>
      </div>

      {children}
    </div>
  </div>
);
