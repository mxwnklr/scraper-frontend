"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function GoogleScraper() {
  const router = useRouter();
  
  // ✅ State Variables (Now Includes Address)
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState(""); 
  const [includeRatings, setIncludeRatings] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ Track Google Login Status

  // ✅ Listen for OAuth Success Messages
  useEffect(() => {
    const handleOAuthSuccess = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data === "oauth_success") {
        alert("✅ Google Authentication Successful!");
        setIsAuthenticated(true);
      }
    };

    window.addEventListener("message", handleOAuthSuccess);

    return () => {
      window.removeEventListener("message", handleOAuthSuccess);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDownloadUrl("");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("business_name", businessName);
      formData.append("address", address);
      if (includeRatings) formData.append("include_ratings", includeRatings);
      if (keywords) formData.append("keywords", keywords);

      const response = await axios.post(
        "https://scraper-backend-fsrl.onrender.com/google",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: 'blob',
          timeout: 300000, // 5 minutes timeout
        }
      );

      // Check if the response is an error message
      if (response.data.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
          const error = JSON.parse(reader.result as string);
          setErrorMessage(error.error || "❌ An error occurred");
        };
        reader.readAsText(response.data);
        return;
      }

      // Handle successful response
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'google_reviews.xlsx';

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);

    } catch (error: any) {
      console.error("❌ API Request Failed:", error);
      if (error.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);
            setErrorMessage(errorData.error || "❌ Something went wrong");
          } catch {
            setErrorMessage("❌ Failed to process the response");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        setErrorMessage(error.message || "❌ Something went wrong");
      }
    }

    setLoading(false);
};

  // ✅ Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const page = "google";
      const response = await axios.get(`https://scraper-backend-fsrl.onrender.com/google-login?page=${page}`);
      
      // Open Google Login in a popup window (centered)
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const authWindow = window.open(
        response.data.auth_url,
        "Google Login",
        `width=${width},height=${height},left=${left},top=${top}`
      );
  
      if (!authWindow) {
        alert("❌ Popup blocked! Please allow popups and try again.");
        return;
      }
  
      // Check authentication status periodically
      const checkAuth = async () => {
        try {
          const statusResponse = await axios.get('https://scraper-backend-fsrl.onrender.com/auth-status');
          if (statusResponse.data.authenticated) {
            setIsAuthenticated(true);
            authWindow.close();
            alert("✅ Google Authentication Successful!");
          }
        } catch (error) {
          console.error("Failed to check auth status:", error);
        }
      };
  
      const authCheckInterval = setInterval(async () => {
        if (authWindow.closed) {
          clearInterval(authCheckInterval);
          await checkAuth();
        }
      }, 1000);
  
    } catch (error) {
      console.error("❌ Google Login Failed:", error);
      alert("❌ Failed to initiate Google Login.");
    }
  };

  // ✅ Handle Upload to Google Drive
  const handleGoogleDriveUpload = async () => {
    try {
      // Create a blob from the download URL
      const fileResponse = await fetch(downloadUrl);
      const fileBlob = await fileResponse.blob();
  
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', fileBlob, 'google_reviews.xlsx');
  
      const response = await axios.post(
        "https://scraper-backend-fsrl.onrender.com/google/upload",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert(response.data.message);
    } catch (error: any) {
      console.error("❌ Upload Failed:", error);
  
      if (error.response?.status === 401) {
        alert("❌ You need to log in with Google first.");
        setIsAuthenticated(false);
      } else {
        alert("❌ Failed to upload file to Google Drive.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="w-full min-w-[600px] max-w-[750px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-start gap-x-4">
          <button onClick={() => router.push("/")} className="bg-gray-700 hover:bg-gray-600 text-white text-lg font-bold py-2 px-4 rounded-xl flex items-center">
            Back
          </button>
          <div className="flex items-center gap-x-2">
            <span>🔍</span>
            <span>Scrape Google Reviews</span>
          </div>
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Business Name" 
              value={businessName} 
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
            />
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Business Address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full p-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition text-white mt-4" 
            disabled={loading}
          >
            {loading ? "Scraping..." : "Start Scraping"}
          </button>
        </form>

        {errorMessage && <div className="mt-4 p-4 text-red-500 text-center rounded-xl">{errorMessage}</div>}

        {downloadUrl && !errorMessage && (
          <div className="mt-6 flex gap-4">
            <a href={downloadUrl} download="google_reviews.xlsx" className="w-1/2 block p-4 bg-gray-700 rounded-xl font-bold text-center hover:bg-gray-600 transition">
              ⬇️ Download
            </a>

            {!isAuthenticated ? (
              <button className="w-1/2 p-4 bg-yellow-600 rounded-xl font-bold hover:bg-yellow-500 transition text-white" onClick={handleGoogleLogin}>
                🔑 Google Login
              </button>
            ) : (
              <button className="w-1/2 p-4 bg-green-600 rounded-xl font-bold hover:bg-green-500 transition text-white" onClick={handleGoogleDriveUpload}>
                ⬆️ Google Drive
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}