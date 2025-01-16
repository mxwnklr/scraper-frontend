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
  
      // ✅ Detect if response is an error (JSON instead of a file)
      if (response.headers["content-type"].includes("application/json")) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const json = JSON.parse(reader.result as string);
            setErrorMessage(json.error || "❌ No matching reviews found.");
          } catch (err) {
            setErrorMessage("❌ Unknown error occurred.");
          }
        };
        reader.readAsText(response.data);
        return;
      }
  
      // ✅ If response is a valid file, create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error: any) {
      console.error("Error processing request:", error);
  
      if (error.response?.status === 404) {
        setErrorMessage("❌ No matching reviews found. Try different keywords or ratings.");
      } else if (error.response?.status === 422) {
        setErrorMessage("❌ Invalid input. Please check your entries.");
      } else {
        setErrorMessage("❌ Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="w-full min-w-[600px] max-w-[750px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
          <span className="mr-2">🔍</span> Scrape Trustpilot Reviews
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company URL */}
          <div className="relative">
            <input
              type="text"
              placeholder="URL"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
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
                Use "de.companyurl.com" for German reviews
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="relative">
            <input
              type="text"
              placeholder="Keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
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
                Separate keywords with commas, e.g. "shipping, delay, refund", no comma after last keyword
              </div>
            </div>
          </div>

          {/* Include Ratings */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rating"
              value={includeRatings}
              onChange={(e) => setIncludeRatings(e.target.value)}
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
                Enter ratings like "1,2,3", no comma after last rating
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
              ⬇️ Download Scraped Data
            </a>
          </div>
        )}
      </div>
    </div>
  );
}