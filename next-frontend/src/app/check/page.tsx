"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar"; // Import your Navbar component

interface Match {
  block_index: number;
  timestamp: string;
}

export default function CheckImagePage() {
  const [file, setFile] = useState<File | null>(null); // Store the selected file
  const [loading, setLoading] = useState(false); // Loading state
  const [result, setResult] = useState<{ trained: boolean; matches?: Match[] } | null>(null); // Store the result from the API
  const [token, setToken] = useState<string | null>(null); // Store the token
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  useEffect(() => {
    // Retrieve the token from localStorage
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]); // Update the selected file
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      alert("Please select a file before submitting.");
      return;
    }

    if (!token) {
      alert("No token found. Please log in.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file); // Append the file to the form-data

      const response = await fetch("http://localhost:8080/api/check-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to check the image");
      }

      const data = await response.json();
      setResult(data); // Update the result with the API response
      setShowModal(true); // Show the modal
    } catch (error) {
      console.error(error);
      alert("An error occurred while checking the image.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-[#FFFFFF]">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="w-full max-w-md p-6 bg-[#1E1E1E] rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-[#00FFF7] text-center">Check Image</h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4 text-[#FFFFFF] file:bg-[#00FFF7] file:text-[#0F0F0F] file:rounded-lg file:px-4 file:py-2 file:cursor-pointer"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#00FFF7]  text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition disabled:opacity-50"
            >
              {loading ? "Checking..." : "Check Image"}
            </button>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-[#1E1E1E] p-6 rounded-lg shadow-lg w-full max-w-lg transform transition-all duration-300 scale-100"
            style={{ animation: "fadeIn 0.3s ease-in-out" }}
          >
            <h2 className="text-2xl font-bold text-[#00FFF7] mb-4 text-center">
              {result.trained ? "Image is Trained" : "Image is Not Trained"}
            </h2>
            {result.trained && result.matches && (
              <div className="space-y-4">
                <p className="text-[#CCCCCC] text-center">Matches Found:</p>
                <ul className="list-disc list-inside text-[#CCCCCC]">
                  {result.matches.map((match, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-bold">Block Index:</span> {match.block_index},{" "}
                      <span className="font-bold">Timestamp:</span>{" "}
                      {new Date(match.timestamp).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!result.trained && (
              <p className="text-[#CCCCCC] text-center">No matches found for this image.</p>
            )}
            <div className="mt-6 flex justify-center">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}