"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function GoogleScraper() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setDownloadUrl("");
  setErrorMessage("");

  if (!businessName) {
      setErrorMessage("❌ Business name is required.");
      setLoading(false);
      return;
  }

  console.log("🔍 Searching for business...");

  try {
      const formData = new FormData();
      formData.append("business_name", businessName);

      console.log("📡 Sending request to backend:", { business_name: businessName });

      const response = await axios.post(
          "https://scraper-backend-fsrl.onrender.com/google",
          formData,
          { headers: { "Content-Type": "multipart/form-data" }, responseType: "blob" }
      );

      console.log("✅ API Response received:", response);

      if (response.status === 404) {
          console.warn("⚠️ No reviews found.");
          setErrorMessage("❌ No reviews found.");
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
      <div className="w-full min-w-[500px] max-w-[750px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700">
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
            <span>🔍 Scrape Google</span>
          </div>
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Name */}
          <div className="relative">
            <input
              type="text"
              placeholder="Enter Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
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
                Go to Google Maps and search for the business, paste the exact name here
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition text-white mt-4"
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

        {/* ✅ Show download button */}
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