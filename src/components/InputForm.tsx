"use client";
import { useState } from "react";
import axios from "axios";

export default function InputForm() {
  const [companyUrl, setCompanyUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [includeRatings, setIncludeRatings] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDownloadUrl("");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("company_url", companyUrl);
      formData.append("keywords", keywords);
      formData.append("include_ratings", includeRatings);

      const response = await axios.post(
        "https://scraper-backend-fsrl.onrender.com/process/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, responseType: "blob" }
      );

      if (response.status === 404) {
        setErrorMessage("❌ No matching reviews found. Try different keywords or ratings.");
        setLoading(false);
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error: any) {
      console.error("Error processing request:", error);
      setErrorMessage("❌ Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="w-full max-w-[600px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
          <span className="mr-2">🔍</span> Scrape Trustpilot Reviews
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company URL */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="URL"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              className="w-full p-4 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="ml-3 relative group">
              <img
                src="/info-icon.svg"
                alt="Info"
                className="w-5 h-5 cursor-pointer"
              />
              <div className="hidden group-hover:block absolute bg-gray-800 text-white text-sm rounded-lg p-3 w-64 right-0 top-full mt-2 z-50 shadow-lg transition-opacity duration-300">
                Use `de.companyurl.com` for German reviews.
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full p-4 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="ml-3 relative group">
              <img
                src="/info-icon.svg"
                alt="Info"
                className="w-5 h-5 cursor-pointer"
              />
              <div className="hidden group-hover:block absolute bg-gray-800 text-white text-sm rounded-lg p-3 w-64 right-0 top-full mt-2 z-50 shadow-lg transition-opacity duration-300">
                Separate keywords with commas, e.g., `shipping, delay, refund`.
              </div>
            </div>
          </div>

          {/* Include Ratings */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Rating"
              value={includeRatings}
              onChange={(e) => setIncludeRatings(e.target.value)}
              className="w-full p-4 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="ml-3 relative group">
              <img
                src="/info-icon.svg"
                alt="Info"
                className="w-5 h-5 cursor-pointer"
              />
              <div className="hidden group-hover:block absolute bg-gray-800 text-white text-sm rounded-lg p-3 w-64 right-0 top-full mt-2 z-50 shadow-lg transition-opacity duration-300">
                Enter ratings like `1,2,3` without spaces.
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition"
            disabled={loading}
          >
            {loading ? (
              <span>
                Scraping<span className="animate-pulse">...</span>
              </span>
            ) : (
              "Start Scraping"
            )}
          </button>
        </form>

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
              download="scraped_reviews.xlsx"
              className="w-full block p-4 bg-gray-700 rounded-xl font-bold text-center hover:bg-gray-600 transition"
            >
              📥 Download Scraped Data
            </a>
          </div>
        )}
      </div>
    </div>
  );
}