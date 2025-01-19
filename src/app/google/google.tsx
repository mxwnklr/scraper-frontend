"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function GoogleScraper() {
  const router = useRouter();

  // ✅ State Variables (Now Includes Address)
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState(""); 
  const [includeRatings, setIncludeRatings] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ Track Google Login Status

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDownloadUrl("");
    setErrorMessage("");

    // ✅ Validation (Ensure both business name and address are provided)
    if (!businessName || !address) {
      setErrorMessage("❌ Business name and address are required.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("business_name", businessName);
      formData.append("address", address); // ✅ Include Address in API Call
      if (includeRatings) formData.append("include_ratings", includeRatings);
      if (keywords) formData.append("keywords", keywords);

      console.log("📡 Sending request to backend:", {
        business_name: businessName,
        address: address,
        include_ratings: includeRatings,
        keywords: keywords,
      });

      const response = await axios.post(
        "https://scraper-backend-fsrl.onrender.com/google",
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, responseType: "blob", timeout: 900000 }
      );

      console.log("✅ API Response received:", response);

      if (response.status === 404) {
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

  // ✅ Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get("https://scraper-backend-fsrl.onrender.com/google-login");
      window.location.href = response.data.auth_url; // ✅ Redirect user to Google login
    } catch (error) {
      console.error("❌ Google Login Failed:", error);
      alert("❌ Failed to authenticate with Google. Try again.");
    }
  };

  // ✅ Handle Upload to Google Drive
  const handleGoogleDriveUpload = async () => {
    try {
      const response = await axios.post("https://scraper-backend-fsrl.onrender.com/google/upload");
      alert(response.data.message);
    } catch (error: any) {
      console.error("❌ Upload Failed:", error);

      if (error.response?.status === 401) {
        alert("❌ You need to log in with Google first.");
        setIsAuthenticated(false); // Mark as not authenticated
      } else {
        alert("❌ Failed to upload file to Google Drive.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="w-full min-w-[600px] max-w-[750px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700">
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
            <span>Scrape Google Reviews</span>
          </div>
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Name Input */}
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

          {/* Address Input */}
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

          {/* Include Ratings Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Included Ratings (not working rn)"
              value={includeRatings}
              onChange={(e) => setIncludeRatings(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={true}
            />
          </div>

          {/* Keywords Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Keywords (not working rn)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full p-4 pr-12 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={true}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition text-white mt-4"
            disabled={loading}
          >
            {loading ? "Scraping..." : "Start Scraping"}
          </button>
        </form>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-4 text-red-500 text-center rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Buttons for Download & Upload */}
        {downloadUrl && !errorMessage && (
          <div className="mt-6 flex gap-4">
            {/* ✅ Download Button */}
            <a
              href={downloadUrl}
              download="google_reviews.xlsx"
              className="w-1/2 block p-4 bg-gray-700 rounded-xl font-bold text-center hover:bg-gray-600 transition"
            >
              ⬇️ Download
            </a>

            {/* ✅ Upload to Google Drive Button */}
            {!isAuthenticated ? (
              <button
                className="w-1/2 p-4 bg-yellow-600 rounded-xl font-bold hover:bg-yellow-500 transition text-white"
                onClick={handleGoogleLogin}
              >
                🔑 Google Login
              </button>
            ) : (
              <button
                className="w-1/2 p-4 bg-green-600 rounded-xl font-bold hover:bg-green-500 transition text-white"
                onClick={handleGoogleDriveUpload}
              >
                ⬆️ Google Drive
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}