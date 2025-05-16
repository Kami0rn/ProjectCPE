"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function GeneratePage() {
  const params = useParams();
  const username = Array.isArray(params?.username) ? params.username.join("") : params?.username;
  const model_name = Array.isArray(params?.model_name) ? params.model_name.join("") : params?.model_name;

  const [model, setModel] = useState<any>(null);
  const [sampleImages, setSampleImages] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch model details and sample images
  useEffect(() => {
    const fetchModelDetails = async () => {
      if (!username || !model_name) {
        console.error("Username or model name is missing.");
        return;
      }

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch("http://127.0.0.1:8080/api/model", {
          method: "POST", // <-- Change to POST
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            username: username,
            model_name: model_name,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch model details");
        }

        const data = await response.json();
        setModel(data.model);
        setSampleImages(data.sample_images || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchModelDetails();
  }, [username, model_name]);

  // Fetch generated images
  const fetchImages = async () => {
    if (!username || !model_name) {
      console.error("Username or model name is missing.");
      return;
    }

    setLoading(true);
    const images: string[] = [];

    try {
      for (let i = 0; i < 9; i++) {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("model_name", model_name);
        formData.append("block_hash", `/${username}/${model_name}`);

        const response = await fetch("http://127.0.0.1:5000/generate", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        images.push(url);
      }

      setGeneratedImages(images); // Update state with all generated images
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
        <div className="w-full max-w-5xl p-6 bg-[#1E1E1E] rounded-lg shadow-lg mt-2.5 mb-2.5 max-w-xl">
          <h1 className="text-4xl font-bold mb-6 text-[#00FFF7] text-center">Generate Images</h1>
          <p className="text-lg text-center text-[#CCCCCC] mb-4">
            <strong>Username:</strong> {username || "N/A"}
          </p>
          <p className="text-lg text-center text-[#CCCCCC] mb-6 flex items-center justify-center gap-3">
            {/* Circle icon with first letter of model name */}
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#00FFF7] text-[#0F0F0F] font-bold text-2xl shadow-md">
              {model_name ? model_name[0].toUpperCase() : "?"}
            </span>
            <span>
              <strong>Model Name:</strong> {model_name || "N/A"}
            </span>
          </p>

          {/* Model Details */}
          {model && (
            <div className="text-center text-[#CCCCCC] mb-6">
              <p>
                <strong>Model ID:</strong> {model.id}
              </p>
              <p>
                <strong>Created By:</strong> {model.created_by}
              </p>
              <p>
                <strong>Hash:</strong> {model.hash}
              </p>
            </div>
          )}

          {/* Sample Images */}
          <p>
            <strong >Sample Datasets</strong>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {sampleImages.map((base64Image, index) => (
              <img
                key={index}
                src={`data:image/jpeg;base64,${base64Image}`}
                alt={`Sample ${index + 1}`}
                className="w-32 h-32 object-cover rounded shadow-md"
              />
            ))}
          </div>

          {/* Generate Button */}
          <div className="flex justify-center w-full mb-4">
            <button
              onClick={fetchImages}
              disabled={loading}
              className="px-6 py-3 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate 9 Images"}
            </button>
          </div>

          {/* Generated Images */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {generatedImages.map((url, index) => (
              <div key={index} className="relative bg-[#2E2E2E] p-4 rounded-lg">
                <img
                  src={url}
                  alt={`Generated ${index + 1}`}
                  className="w-32 h-32 object-cover rounded cursor-pointer"
                  onClick={() => downloadImage(url)}
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