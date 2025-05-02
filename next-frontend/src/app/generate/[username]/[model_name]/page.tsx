"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar"; // Import your Navbar component

export default function GeneratePage() {
  const params = useParams();
  const username = Array.isArray(params?.username) ? params.username.join("") : params?.username;
  const model_name = Array.isArray(params?.model_name) ? params.model_name.join("") : params?.model_name;
  const [images, setImages] = useState<string[]>([]); // Store multiple image URLs
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    if (!username || !model_name) {
      console.error("Username or model name is missing.");
      return;
    }

    setLoading(true);
    const generatedImages: string[] = [];

    try {
      for (let i = 0; i < 10; i++) {
        // Create form data
        const formData = new FormData();
        formData.append("username", username);
        formData.append("model_name", model_name);

        const response = await fetch("http://127.0.0.1:5000/generate", {
          method: "POST",
          body: formData, // Send form data
        });

        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        generatedImages.push(url); // Add the generated image URL to the array
      }

      setImages(generatedImages); // Update state with all generated images
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "generated_image.png"; // Default filename
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-[#FFFFFF]">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="w-full max-w-5xl p-6 bg-[#1E1E1E] rounded-lg shadow-lg mt-2.5 mb-2.5">
          <h1 className="text-4xl font-bold mb-6 text-[#00FFF7] text-center">Generate Images</h1>
          <p className="text-lg text-center text-[#CCCCCC] mb-4">
            <strong>Username:</strong> {username || "N/A"}
          </p>
          <p className="text-lg text-center text-[#CCCCCC] mb-6">
            <strong>Model Name:</strong> {model_name || "N/A"}
          </p>
          <button
            onClick={fetchImages}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate 10 Images"}
          </button>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {images.map((url, index) => (
              <div key={index} className="relative bg-[#2E2E2E] p-4 rounded-lg">
                <img
                  src={url}
                  alt={`Generated ${index + 1}`}
                  className="w-32 h-32 object-cover rounded cursor-pointer" // Smaller size
                  onClick={() => downloadImage(url)} // Download on click
                />
                <p className="text-center text-sm mt-2 text-[#CCCCCC]">Image {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}