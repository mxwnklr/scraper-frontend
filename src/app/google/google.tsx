"use client";
import { useState } from "react";
import axios from "axios";

export default function GoogleScraper() {
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setDownloadUrl("");

    try {
        const formData = new FormData();
        formData.append("business_name", businessName);
        formData.append("address", address);

        const response = await axios.post(
            "https://scraper-backend-fsrl.onrender.com/google",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 300000, // 5 minutes timeout
            }
        );

        const { filename, review_count, error } = response.data;
        
        if (error) {
            setMessage(`❌ ${error}`);
        } else {
            setMessage(`✅ Found ${review_count} reviews.`);
            // Set download URL
            setDownloadUrl(`https://scraper-backend-fsrl.onrender.com/${filename}`);
        }

    } catch (error: any) {
        console.error("❌ API Request Failed:", error);
        setMessage(error.response?.data?.error || "❌ Something went wrong");
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

        {message && <div className="mt-4 p-4 text-center rounded-xl">{message}</div>}
        {downloadUrl && !message.includes("❌") && (
          <div className="mt-6 flex gap-4">
            <a
              href={downloadUrl}
              download="google_reviews.xlsx"
              className="w-full block p-4 bg-gray-700 rounded-xl font-bold text-center hover:bg-gray-600 transition"
            >
              ⬇️ Download Excel File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}