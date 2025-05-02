"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Model {
  id: number;
  name: string;
  created_by: string;
  created_at: string;
  hash: string;
}

export default function SelectModelPage() {
  const [models, setModels] = useState<Model[]>([]); // Store models
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8080/models"); // Replace with your backend URL
        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        const data = await response.json();
        setModels(data.models); // Update state with models
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const handleSelectModel = (modelName: string, createdBy: string) => {
    // Redirect to /generate/{username}/{model_name}
    router.push(`/generate/${createdBy}/${modelName}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-[#FFFFFF]">
      <div className="w-full max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-[#00FFF7] text-center">Select a Model</h1>
        {loading ? (
          <p className="text-center text-lg text-[#CCCCCC]">Loading models...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6"> {/* Ensure 1 model per row */}
            {models.map((model) => (
              <div
                key={model.id}
                className="p-4 bg-[#1E1E1E] rounded-lg shadow-lg hover:bg-[#2E2E2E] cursor-pointer transition"
                onClick={() => handleSelectModel(model.name, model.created_by)}
              >
                <h2 className="text-xl font-bold text-[#00FFF7]">{model.name}</h2>
                <p className="text-sm text-[#CCCCCC]">Created by: {model.created_by}</p>
                <p className="text-sm text-[#CCCCCC]">Created at: {new Date(model.created_at).toLocaleString()}</p>
                <p className="text-xs text-[#AAAAAA] mt-2">Hash: {model.hash}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}