"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

function CheckModelPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modelPath, setModelPath] = useState("");
  const [creator, setCreator] = useState("");
  const [modelName, setModelName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select an image to upload.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authorization token not found.");
        return;
      }

      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post("http://localhost:5000/extract", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      if (data.block_hash) {
        const segments = data.block_hash.split("/").filter(Boolean);
        if (segments.length === 2) {
          setCreator(segments[0]);
          setModelName(segments[1]);
          setModelPath(`/generate/${segments[0]}/${segments[1]}`);
          setModalVisible(true);
        } else {
          setErrorMessage("Invalid block hash format.");
        }
      }
    } catch (error: any) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  const handleModalConfirm = () => {
    setModalVisible(false);
    router.push(modelPath);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-[#0F0F0F] text-[#FFFFFF]">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <header className="text-center mb-8 mt-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#00FFF7] neon-text">
          Check Your Model
        </h1>
        <p className="text-lg sm:text-xl text-[#CCCCCC] glow-text">
          Upload an image to verify and use your AI model.
        </p>
      </header>

      {/* File Upload Section */}
      <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-lg flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 text-[#FFFFFF] file:bg-[#00FFF7] file:text-[#0F0F0F] file:rounded-lg file:px-4 file:py-2 file:cursor-pointer"
        />
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition neon-button"
        >
          Upload and Check
        </button>
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-[#00FFF7] neon-text mb-4">
              Model Found
            </h2>
            <p className="text-[#CCCCCC] glow-text mb-2">
              Creator: <span className="text-[#FF00C8] font-semibold">{creator}</span>
            </p>
            <p className="text-[#CCCCCC] glow-text mb-4">
              Model Name: <span className="text-[#FF00C8] font-semibold">{modelName}</span>
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleModalCancel}
                className="px-4 py-2 bg-gray-300 text-[#0F0F0F] rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleModalConfirm}
                className="px-4 py-2 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition neon-button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default CheckModelPage;
