import axios from "axios";

const API_URL = "https://scraper-backend-fsrl.onrender.com";

export const processScraping = async (companyUrl: string, keywords: string, includeRatings: string) => {
    const formData = new FormData();
    formData.append("company_url", companyUrl);
    formData.append("keywords", keywords);
    formData.append("include_ratings", includeRatings);

    const response = await axios.post(`${API_URL}/process/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
    });

    return response.data;
};