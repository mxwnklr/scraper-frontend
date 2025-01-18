"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function GoogleScraper() {
  const router = useRouter();

  // ✅ State Variables
  const [businessName, setBusinessName] = useState(""); // Previously googleUrl
  const [includeRatings, setIncludeRatings] = useState(""); // Previously minRating
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState("⏳ Waiting for response...");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDownloadUrl("");
    setErrorMessage("");
    setProgress("⏳ Scraping started...");

    if (!businessName) {
      setErrorMessage("❌ Business name is required.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("business_name", businessName);
      if (includeRatings) formData.append("include_ratings", includeRatings);
      if (keywords) formData.append("keywords", keywords);

      console.log("📡 Sending request to backend:", {
        business_name: businessName,
        include_ratings: includeRatings,
        keywords: keywords
      });

      // ✅ Axios request with long timeout (to prevent frontend timeout)
      const response = await axios.post(
        "https://scraper-backend-fsrl.onrender.com/google",
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" }, 
          responseType: "blob",
          timeout: 600000 // ⏳ 10-minute timeout
        }
      );

      console.log("✅ API Response received:", response);

      if (response.status === 404) {
        setErrorMessage("❌ No matching reviews found.");
        setLoading(false);
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error: any) {
      console.error("❌ API Request Failed:", error);
      setErrorMessage("❌ Something went wrong. Please try again.");
    }

    setLoading(false);
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="w-full min-w-[600px] max-w-[750px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700">
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
            <span>Scrape Google Reviews</span>
          </div>
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Name Input */}
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

          {/* Include Ratings Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Include Ratings (e.g. 1,5) - Leave empty for all"
              value={includeRatings}
              onChange={(e) => setIncludeRatings(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Keywords Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Keywords (e.g. shipping, customer) - Leave empty for all"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition text-white mt-4"
            disabled={loading}
          >
            {loading ? (
              <span>
                {progress} <span className="animate-pulse">...</span>
              </span>
            ) : (
              "Start Scraping"
            )}
          </button>
        </form>

        {/* ✅ Show Progress Message */}
        {loading && (
          <div className="mt-4 p-4 text-yellow-500 text-center rounded-xl">
            {progress}
          </div>
        )}

        {/* ✅ Show error message if no reviews found */}
        {errorMessage && (
          <div className="mt-4 p-4 text-red-500 text-center rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* ✅ Show download button only if there is a file */}
        {downloadUrl && !errorMessage && (
          <div className="mt-6">
            <a
              href={downloadUrl}
              download="google_reviews.xlsx"
              className="w-full block p-4 bg-gray-700 rounded-xl font-bold text-center hover:bg-gray-600 transition"
            >
              ⬇️ Download Scraped Data
            </a>
          </div>
        )}
      </div>
    </div>
  );
}