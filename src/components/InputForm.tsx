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
        { responseType: "blob" }
      );
  
      // ✅ Check if response is an Excel file
      const contentType = response.headers["content-type"];
  
      if (!contentType.includes("spreadsheet")) {
        // ❌ If response is NOT an Excel file, it's likely an error message
        const errorText = await response.data.text();
        console.error("Error response:", errorText);
        setErrorMessage("❌ No matching reviews found. Try different keywords or ratings.");
        setLoading(false);
        return;
      }
  
      // ✅ If response is valid, create download link
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
      <div className="w-full max-w-md md:max-w-lg p-8 bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-700">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
          <span className="mr-2">🔍</span> Scrape Trustpilot Reviews
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Company URL (use de.companyurl.com for German reviews)"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            className="w-full p-3 bg-[#262626] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            placeholder="Keywords (comma-separated, no comma after last word)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full p-3 bg-[#262626] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            placeholder="Include Ratings (e.g., 1,2,3 ; no comma after last number)"
            value={includeRatings}
            onChange={(e) => setIncludeRatings(e.target.value)}
            className="w-full p-3 bg-[#262626] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition"
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
          <div className="mt-4 p-3 bg-red-500 text-white text-center rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* ✅ Show download button only if there is a file */}
        {downloadUrl && !errorMessage && (
          <div className="mt-6">
            <a
              href={downloadUrl}
              download="scraped_reviews.xlsx"
              className="w-full block p-3 bg-gray-700 rounded-lg font-bold text-center hover:bg-gray-600 transition"
            >
              📥 Download Scraped Data
            </a>
          </div>
        )}
      </div>
    </div>
  );
}