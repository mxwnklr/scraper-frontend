"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function InputForm() {
  const [companyUrl, setCompanyUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [includeRatings, setIncludeRatings] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [dots, setDots] = useState("");

  // Animate loading dots
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots((prev) => (prev === "..." ? "" : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots("");
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDownloadUrl("");

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

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error("Error processing request:", error);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#121212] text-white">
      {/* 🔹 Wider Card */}
      <div className="w-full max-w-xl p-10 rounded-2xl shadow-xl border border-gray-700">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
          <span className="mr-2">🔍</span> Scrape Trustpilot Reviews
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Fields */}
          <input
            type="text"
            placeholder="Company URL (use de.companyurl.com for German reviews)"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            className="w-full p-3 bg-[#1E1E1E] rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            placeholder="Keywords (comma-separated, no comma after last word)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full p-3 bg-[#1E1E1E] rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            placeholder="Include Ratings (e.g., 1,2,3 ; no comma after last number)"
            value={includeRatings}
            onChange={(e) => setIncludeRatings(e.target.value)}
            className="w-full p-3 bg-[#1E1E1E] rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Submit Button with Animated Dots */}
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition"
            disabled={loading}
          >
            {loading ? `Scraping${dots}` : "Start Scraping"}
          </button>
        </form>

        {/* Subtle Download Button */}
        {downloadUrl && (
          <div className="mt-6 text-center">
            <a
              href={downloadUrl}
              download="scraped_reviews.xlsx"
              className="w-full block p-3 bg-gray-700 text-white rounded-xl font-bold text-center hover:bg-gray-600 transition"
            >
              ⬇️ Download Scraped Data
            </a>
          </div>
        )}
      </div>
    </div>
  );
}