"use client";
import { useState } from "react";
import axios from "axios";

export default function GoogleForm() {
  const [placeUrl, setPlaceUrl] = useState("");
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
      formData.append("place_url", placeUrl);
      formData.append("min_rating", minRating);

      const response = await axios.post(
        "https://scraper-backend-fsrl.onrender.com/google",
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, responseType: "blob" }
      );

      if (response.headers["content-type"].includes("application/json")) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorJson = JSON.parse(reader.result as string);
            if (errorJson.error) {
              setErrorMessage(errorJson.error);
              setLoading(false);
            }
          } catch (err) {
            setErrorMessage("❌ Unexpected error. Please try again.");
          }
        };
        reader.readAsText(response.data);
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
      <div className="w-full max-w-[750px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
          <span className="mr-2">🔍</span> Scrape Google Reviews
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Google Maps URL Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Google Maps URL"
              value={placeUrl}
              onChange={(e) => setPlaceUrl(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="absolute right-4 top-4 group">
              <img
                src="/info-icon.svg"
                alt="Info"
                className="w-5 h-5 text-white opacity-75 cursor-pointer"
              />
              <div className="hidden group-hover:block absolute bg-gray-500 text-white text-sm rounded-xl p-3 w-64 right-0 top-full mt-2 z-50 shadow-lg">
                Paste the Google Maps share link (e.g., https://maps.app.goo.gl/... or full URL)
              </div>
            </div>
          </div>

          {/* Minimum Rating Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Minimum Rating (1-5)"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="absolute right-4 top-4 group">
              <img
                src="/info-icon.svg"
                alt="Info"
                className="w-5 h-5 text-white opacity-75 cursor-pointer"
              />
              <div className="hidden group-hover:block absolute bg-gray-500 text-white text-sm rounded-xl p-3 w-64 right-0 top-full mt-2 z-50 shadow-lg">
                Enter a minimum rating (e.g., "4" for reviews with 4+ stars)
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