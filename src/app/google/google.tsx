"use client";
import { useState } from "react";
import axios from "axios";

export default function GoogleScraper() {
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState(""); 
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
        formData.append("address", address);

        console.log("📡 Sending request to backend:", {
          business_name: businessName,
          address,
        });

        const response = await axios.post(
            "https://scraper-backend-fsrl.onrender.com/google",
            formData,
            { headers: { "Content-Type": "multipart/form-data" }, responseType: "blob" }
        );

        console.log("✅ API Response received:", response);

        if (response.status === 200) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            setDownloadUrl(url);
        } else {
            console.warn("⚠️ No reviews found.");
            setErrorMessage("❌ No reviews found.");
        }
    } catch (error: any) {
        console.error("❌ API Request Failed:", error);

        if (error.response?.status === 404) {
            setErrorMessage("❌ No reviews found.");
        } else {
            setErrorMessage("❌ Something went wrong. Please try again.");
        }
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="w-full min-w-[600px] max-w-[750px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6">Scrape Google Reviews</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="relative">
            <input 
              type="text" 
              placeholder="Business Address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
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
              download="google_reviews.xlsx"
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