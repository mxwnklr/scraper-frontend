"use client";
import { useState } from "react";
import axios from "axios";

export default function OpenAIInteraction({ outputFile }: { outputFile: string }) {  // Accept outputFile as a prop
  const [userPrompt, setUserPrompt] = useState("");
  const [openAIResponse, setOpenAIResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpenAIRequest = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/openai", {
        userPrompt,
        outputFile,  // Include outputFile in the request
      });
      setOpenAIResponse(response.data.message);
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="w-full min-w-[600px] max-w-[750px] p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6">OpenAI Interaction</h2>
        <textarea
          placeholder="Enter your prompt here..."
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          className="w-full p-4 bg-[#262626] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleOpenAIRequest}
          className="w-full p-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition text-white mt-4"
          disabled={loading}
        >
          {loading ? "Processing..." : "Get OpenAI Response"}
        </button>
        {openAIResponse && (
          <div className="mt-4 p-4 bg-gray-700 rounded-xl">
            <h3 className="font-bold">OpenAI Response:</h3>
            <p>{openAIResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}