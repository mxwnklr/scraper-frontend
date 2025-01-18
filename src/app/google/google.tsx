"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function GoogleScraper() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [includeRatings, setIncludeRatings] = useState("");
  const [keywords, setKeywords] = useState("");
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

  try {
      const formData = new FormData();
      formData.append("business_name", businessName);
      formData.append("include_ratings", includeRatings);
      formData.append("keywords", keywords);

      console.log("📡 Sending request to backend:", {
          business_name: businessName,
          include_ratings: includeRatings,
          keywords: keywords
      });

      const response = await axios.post(
          "https://scraper-backend-fsrl.onrender.com/google",
          formData,
          { headers: { "Content-Type": "multipart/form-data" }, responseType: "blob" }
      );

      console.log("✅ API Response received:", response);

      if (response.status === 404) {
          console.warn("⚠️ No matching reviews found.");
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
    <div className="w-full min-w-[600px] max-w-[750px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700 relative">
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
          <div className="absolute right-4 top-4 group">
              <img
                src="/info-icon.svg"
                alt="Info"
                className="w-5 h-5 text-white opacity-75 cursor-pointer"
              />
              <div className="hidden group-hover:block absolute bg-gray-500 text-white text-sm rounded-xl p-3 w-64 right-0 top-full mt-2 z-50 shadow-lg">
                Go to Google Maps and put the exact business name here
              </div>
            </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Include Ratings (e.g. 1,5) - Leave empty for all"
            value={includeRatings}
            onChange={(e) => setIncludeRatings(e.target.value)}
          />
          <div className="absolute right-4 top-4 group">
            <img
              src="/info-icon.svg"
              alt="Info"
              className="w-5 h-5 text-white opacity-75 cursor-pointer"
            />
            <div className="hidden group-hover:block absolute bg-gray-500 text-white text-sm rounded-xl p-3 w-64 right-0 top-full mt-2 z-50 shadow-lg">
              Enter Ratings like this: 1,2,3. Leave empty to scrape all ratings.
            </div>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Keywords (e.g. shipping, customer) - Leave empty for all"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <div className="absolute right-4 top-4 group">
            <img
              src="/info-icon.svg"
              alt="Info"
              className="w-5 h-5 text-white opacity-75 cursor-pointer"
            />
            <div className="hidden group-hover:block absolute bg-gray-500 text-white text-sm rounded-xl p-3 w-64 right-0 top-full mt-2 z-50 shadow-lg">
              Enter Keywords separated by commas (e.g., "shipping, refund"). Leave empty to scrape all reviews.
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading}>Start Scraping</button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
      {downloadUrl && <a href={downloadUrl} download>Download Scraped Data</a>}
    </div>
  </div>
);
}