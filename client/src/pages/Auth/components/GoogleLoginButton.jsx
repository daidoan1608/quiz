import React from 'react';
import { GoogleOutlined } from '@ant-design/icons';
import { appMessage } from 'utils/appMessage';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from 'config/env';

export const GoogleLoginButton = ({ onSuccess }) => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <div
      className="social-login-btn google-login-btn relative overflow-hidden"
      aria-label="Đăng nhập với Google"
    >
      <span className="google-login-fallback" aria-hidden="true">
        <GoogleOutlined />
      </span>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const idToken = credentialResponse.credential;
          await onSuccess(idToken);
        }}
        onError={() => {
          appMessage.error('Đăng nhập Google thất bại!');
        }}
        useOneTap
        type="icon"
        shape="circle"
        size="large"
      />
    </div>

    <style>{`
      .social-login-btn {
        width: 48px !important;
        min-width: 48px !important;
        height: 48px !important;
        padding: 0 !important;
        border-radius: 9999px !important;
        border: 1px solid var(--aura-border) !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: var(--aura-canvas) !important;
        color: var(--aura-text) !important;
        line-height: 1 !important;
        transition: background-color 0.2s ease, border-color 0.2s ease;
      }

      .social-login-btn:hover {
        background: var(--aura-primary-soft) !important;
        border-color: var(--aura-primary) !important;
      }

      .google-login-fallback {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        color: #ea4335;
        pointer-events: none;
        z-index: 1;
      }

      .social-login-btn iframe,
      .social-login-btn > div,
      .social-login-btn [role="button"] {
        width: 48px !important;
        min-width: 48px !important;
        max-width: 48px !important;
        height: 48px !important;
        border-radius: 9999px !important;
      }

      .google-login-btn iframe,
      .google-login-btn > div,
      .google-login-btn [role="button"] {
        opacity: 0 !important;
        position: relative !important;
        z-index: 2 !important;
      }
    `}</style>
  </GoogleOAuthProvider>
);

