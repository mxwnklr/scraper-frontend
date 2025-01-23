"use client";

import { useEffect } from 'react';

useEffect(() => {
  if (window.opener) {
    window.opener.postMessage("oauth_success", "*");
    window.close();
  }
}, []);

export default function OAuthCallback() {
  return <div>Processing authentication...</div>;
}