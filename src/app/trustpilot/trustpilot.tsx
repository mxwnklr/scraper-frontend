"use client";
import { useState } from "react";
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
              className="w-full block p-4 bg-gray-700 rounded-xl font-bold text-center hover:bg-gray-600 transition"
            >
              ⬇️ Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}