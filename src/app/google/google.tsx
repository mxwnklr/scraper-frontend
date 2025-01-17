"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function GoogleReviewsForm() {
  const router = useRouter();
  const [googleUrl, setGoogleUrl] = useState("");
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
      formData.append("google_maps_url", googleUrl);
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
      setErrorMessage("❌ No reviews found. Please try another URL.");
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
          🔍 Scrape Google Reviews
        </h2>

        {/* Input Fields */}
        <input type="text" placeholder="Google Maps URL" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} required />
        <input type="text" placeholder="Min Rating (Optional)" value={minRating} onChange={(e) => setMinRating(e.target.value)} />

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Scraping..." : "Start Scraping"}
        </button>

        {/* Error Handling */}
        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      </div>
    </div>
  );
}