"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="w-full max-w-lg p-10 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-700 text-center">
        <h1 className="text-3xl font-bold mb-6">🔍 Select Review Platform</h1>

        {/* Trustpilot Button */}
        <button
          onClick={() => router.push("/trustpilot")}
          className="w-full p-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition mb-4"
        >
          ⭐ Scrape Trustpilot Reviews
        </button>

        {/* Google Reviews Button */}
        <button
          onClick={() => router.push("/google")}
          className="w-full p-4 bg-green-600 rounded-xl font-bold hover:bg-green-500 transition"
        >
          🌍 Scrape Google Reviews
        </button>
      </div>
    </main>
  );
}