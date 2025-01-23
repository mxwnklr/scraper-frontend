"use client";
import { useEffect } from "react";

export default function OAuthCallback() {
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Verify authentication before closing
        const response = await fetch('https://scraper-backend-fsrl.onrender.com/auth-status');
        const data = await response.json();
        
        if (data.authenticated) {
          if (window.opener) {
            window.opener.postMessage("oauth_success", "*");
            window.close();
          }
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
      }
    };

    verifyAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="text-center">
        <h1 className="text-xl mb-4">Authentication Successful</h1>
        <p>You can close this window now.</p>
      </div>
    </div>
  );
}