"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar"; // Import the Navbar component

function TrainPage() {
  const [epochs, setEpochs] = useState("");
  const [modelName, setModelName] = useState("");
  const [images, setImages] = useState<File[]>([]); // Updated to handle multiple files
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [modalData, setModalData] = useState<any>(null); // State for modal data

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setModalData(null);

    const formData = new FormData();
    formData.append("epochs", epochs);
    formData.append("model_name", modelName);
    images.forEach((image, index) => {
      formData.append(`images`, image); // Append each image
    });

    // Debugging: Log FormData contents
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const token = localStorage.getItem("token"); // Retrieve the token from localStorage
      if (!token) {
        setMessage("Error: Authorization token is missing. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8080/api/mine", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Add the Authorization header
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setModalData(data); // Set the modal data with the response
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || "Failed to send data."}`);
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files)); // Convert FileList to an array
    }
  };

  const closeModal = () => {
    setModalData(null); // Close the modal by clearing the modal data
  };

  return (
    <>
      <Navbar /> {/* Add Navbar here */}
      <div className="min-h-screen bg-[#0F0F0F] text-[#FFFFFF] flex items-center justify-center p-4">
        <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Train Model</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="epochs" className="block text-sm mb-2">
                Epochs
              </label>
              <input
                type="text"
                id="epochs"
                value={epochs}
                onChange={(e) => setEpochs(e.target.value)}
                className="w-full p-2 rounded bg-[#1E1E1E] text-[#FFFFFF] border border-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#00FFF7]"
                required
              />
            </div>
            <div>
              <label htmlFor="model_name" className="block text-sm mb-2">
                Model Name
              </label>
              <input
                type="text"
                id="model_name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full p-2 rounded bg-[#1E1E1E] text-[#FFFFFF] border border-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#00FFF7]"
                required
              />
            </div>
            <div>
              <label htmlFor="images" className="block text-sm mb-2">
                Images
              </label>
              <input
                type="file"
                id="images"
                accept="image/*" // Restrict to image files
                onChange={handleFileChange}
                className="w-full p-2 rounded bg-[#1E1E1E] text-[#FFFFFF] border border-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#00FFF7]"
                required
                multiple
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
          {message && (
            <p
              className={`mt-4 text-center ${
                message.startsWith("Success") ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] text-[#FFFFFF] p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Training Success</h2>
            <p className="mb-2">
              <strong>Index:</strong> {modalData.index}
            </p>
            <p className="mb-2">
              <strong>Timestamp:</strong> {modalData.timestamp}
            </p>
            <p className="mb-2">
              <strong>Hash:</strong> {modalData.hash}
            </p>
            <p className="mb-4">
              <strong>Proof:</strong> {modalData.proof}
            </p>
            <button
              onClick={closeModal}
              className="w-full py-2 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default TrainPage;