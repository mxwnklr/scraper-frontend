"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function TrustpilotScraper() {
  const router = useRouter();
  const [companyUrl, setCompanyUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [includeRatings, setIncludeRatings] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ✅ Listen for OAuth success messages
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

    if (!companyUrl) {
      setErrorMessage("❌ Trustpilot URL is required.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("company_url", companyUrl);
      formData.append("keywords", keywords);
      formData.append("include_ratings", includeRatings);

      console.log("📡 Sending request to backend:", {
        company_url: companyUrl,
        keywords,
        include_ratings: includeRatings,
      });

      const response = await axios.post(
        "https://scraper-backend-fsrl.onrender.com/trustpilot",
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, responseType: "blob" }
      );

      console.log("✅ API Response received:", response);

      if (response.status === 404) {
        console.warn("⚠️ No matching reviews found.");
        setErrorMessage("❌ No matching reviews found. Try different keywords or ratings.");
        setLoading(false);
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error: any) {
      console.error("❌ API Request Failed:", error);

      if (error.response?.status === 404) {
        setErrorMessage("❌ No matching reviews found. Try different keywords or ratings.");
      } else {
        setErrorMessage("❌ Something went wrong. Please try again.");
      }
    }

    setLoading(false);
  };

  // ✅ Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const page = "trustpilot";
      const response = await axios.get(`https://scraper-backend-fsrl.onrender.com/google-login?page=${page}`);

      // ✅ Open Google Login in a new tab
      const authWindow = window.open(response.data.auth_url, "_blank", "width=500,height=600");

      if (!authWindow) {
        alert("❌ Popup blocked! Please allow popups and try again.");
        return;
      }

      // ✅ Polling method to detect when the login window closes
      const checkAuthInterval = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkAuthInterval);
          console.log("🔄 Checking authentication status...");
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
      const response = await axios.post("https://scraper-backend-fsrl.onrender.com/google/upload");
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
      <div className="w-full min-w-[600px] max-w-[750px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700 relative">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-start gap-x-4">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="bg-gray-700 hover:bg-gray-600 text-white text-lg font-bold py-2 px-4 rounded-xl flex items-center"
          >
            Back
          </button>

          <div className="flex items-center gap-x-2">
            <span>🔍</span>
            <span>Scrape Trustpilot Reviews</span>
          </div>
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Company URL"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Keywords (Optional)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Include Ratings (Optional)"
              value={includeRatings}
              onChange={(e) => setIncludeRatings(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {errorMessage && (
          <div className="mt-4 p-4 text-red-500 text-center rounded-xl">
            {errorMessage}
          </div>
        )}

        {downloadUrl && !errorMessage && (
          <div className="mt-6 flex gap-4">
            <a
              href={downloadUrl}
              download="trustpilot_reviews.xlsx"
              className="w-1/2 block p-4 bg-gray-700 rounded-xl font-bold text-center hover:bg-gray-600 transition"
            >
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