import axios from "axios";

const API_URL = "https://scraper-backend-fsrl.onrender.com"; // Update with your actual backend URL

export const processScraping = async (platform: string, companyUrl: string, keywords: string, includeRatings: string) => {
    const formData = new FormData();
    formData.append("platform", platform);  // ✅ Added platform to match backend
    formData.append("company_url", companyUrl);
    formData.append("keywords", keywords);
    formData.append("include_ratings", includeRatings);

    const response = await axios.post(`${API_URL}/process/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
    });

    return response.data;
};