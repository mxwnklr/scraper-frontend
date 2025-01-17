"use client";
import { useState } from "react";
import axios from "axios";

export default function GoogleReviewsForm() {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [minRating, setMinRating] = useState("");
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
      formData.append("business_name", businessName);
      formData.append("location", location);
      formData.append("min_rating", minRating);

      const response = await axios.post(
        "https://scraper-backend-fsrl.onrender.com/google",
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, responseType: "blob" }
      );

      if (response.status === 404) {
        setErrorMessage("❌ No reviews found for this business.");
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
      <div className="w-full max-w-2xl p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
          <span className="mr-2">🔍</span> Scrape Google Reviews
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Name */}
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

          {/* Location */}
          <div className="relative">
            <input
              type="text"
              placeholder="Location (City, Country)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Minimum Rating */}
          <div className="relative">
            <input
              type="number"
              placeholder="Minimum Rating (1-5)"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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