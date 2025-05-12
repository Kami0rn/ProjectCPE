"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar"; // Import the Navbar component
import { useRouter } from "next/navigation";

interface Model {
  id: number;
  name: string;
  created_by: string;
  created_at: string;
  hash: string;
}

function Dashboard() {
  const [userData, setUserData] = useState<any>(null); // Store user data
  const [models, setModels] = useState<Model[]>([]); // Store all models
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state
  const router = useRouter();

  useEffect(() => {
    const fetchUserDataAndModels = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setError("Unauthorized. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch user data
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          setError(errorData.error || "Failed to fetch user data.");
          setLoading(false);
          return;
        }

        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch all models
        const modelsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/models`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!modelsResponse.ok) {
          const errorData = await modelsResponse.json();
          setError(errorData.error || "Failed to fetch models.");
          setLoading(false);
          return;
        }

        const modelsData = await modelsResponse.json();
        const userModels = modelsData.models.filter(
          (model: Model) => model.created_by === userData.username
        ); // Filter models created by the logged-in user
        setModels(userModels);
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndModels();
  }, []);

  const handleModelClick = (modelName: string) => {
    if (userData?.username) {
      router.push(`/generate/${userData.username}/${modelName}`);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center text-[#CCCCCC]">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="text-center text-red-500">{error}</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0F0F0F] text-[#FFFFFF] flex flex-col p-4">
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl mx-auto">
          {/* Left: User Profile */}
          <div className="w-full md:w-1/3 bg-[#1E1E1E] p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#00FFF7] mb-4">User Profile</h2>
            {userData ? (
              <div className="space-y-4">
                <p>
                  <strong>Username:</strong> {userData.username}
                </p>
                <p>
                  <strong>Email:</strong> {userData.email}
                </p>
                <p>
                  <strong>Joined:</strong> {new Date(userData.created_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-[#CCCCCC]">No user data available.</p>
            )}
          </div>

          {/* Right: AI Dashboard */}
          <div className="w-full md:w-2/3 bg-[#1E1E1E] p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#00FFF7] mb-4">My AI Models</h2>
            {models.length === 0 ? (
              <p className="text-center text-[#CCCCCC]">No models found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="p-4 bg-[#2E2E2E] rounded-lg shadow-lg hover:bg-[#3E3E3E] cursor-pointer transition"
                    onClick={() => handleModelClick(model.name)}
                  >
                    <h3 className="text-xl font-bold text-[#00FFF7]">{model.name}</h3>
                    <p className="text-sm text-[#CCCCCC]">Created at: {new Date(model.created_at).toLocaleString()}</p>
                    <p className="text-xs text-[#AAAAAA] mt-2">Hash: {model.hash}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;