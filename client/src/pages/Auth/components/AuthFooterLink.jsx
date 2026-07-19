import React from 'react';
import { Link } from 'react-router-dom';

export const AuthFooterLink = ({ label, linkText, to }) => (
  <div className="auth-footer text-center mt-6 pt-4">
    <span className="aura-text-muted">{label} </span>
    <Link
      to={to}
      className="auth-link font-medium hover:underline transition-colors"
    >
      {linkText}
    </Link>
  </div>
);
