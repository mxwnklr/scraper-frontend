"use client";

import React, { useState, useEffect } from "react";
import { processScraping } from "@/api";
import { Card } from "@/components/ui/card";

const InputForm: React.FC = () => {
    const [platform, setPlatform] = useState("trustpilot");
    const [companyUrl, setCompanyUrl] = useState("");
    const [keywords, setKeywords] = useState("");
    const [includeRatings, setIncludeRatings] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [dots, setDots] = useState("");

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading) {
            interval = setInterval(() => {
                setDots((prev) => (prev.length < 3 ? prev + "." : ""));
            }, 500);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyUrl || !keywords || !includeRatings) {
            alert("Please fill out all fields.");
            return;
        }

        setLoading(true);

        try {
            const outputBlob = await processScraping(platform, companyUrl, keywords, includeRatings);  // ✅ FIXED ARGUMENTS
            const url = window.URL.createObjectURL(new Blob([outputBlob]));
            setDownloadUrl(url);
        } catch (error) {
            console.error("Error processing request:", error);
            alert("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <Card className="card">
                <h2 className="text-3xl font-bold mb-6">🔍 Scrape Reviews</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <select 
                        className="w-full p-3 rounded-xl bg-[#2A2A2A] text-white border border-gray-600"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                    >
                        <option value="trustpilot">Trustpilot</option>
                        <option value="google">Google Reviews</option>
                    </select>

                    <input 
                        type="text"
                        placeholder="Company URL (use de.companyurl.com for German reviews)"
                        value={companyUrl}
                        onChange={(e) => setCompanyUrl(e.target.value)}
                    />
                    <input 
                        type="text"
                        placeholder="Keywords (comma-separated, no comma after last word)"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                    />
                    <input 
                        type="text"
                        placeholder="Include Ratings (e.g., 1,2,3 ; no comma after last number)"
                        value={includeRatings}
                        onChange={(e) => setIncludeRatings(e.target.value)}
                    />

                    <button type="submit" className="button" disabled={loading}>
                        {loading ? `Scraping${dots}` : "Start Scraping"}
                    </button>
                </form>

                {downloadUrl && (
                    <a href={downloadUrl} download="scraped_reviews.xlsx" className="button-secondary">
                        ⬇️ Download Scraped Data
                    </a>
                )}
            </Card>
        </div>
    );
};

export default InputForm;