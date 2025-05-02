"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar"; // Import the Navbar component

function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setError("Unauthorized. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch user data.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
      <div className="min-h-screen bg-[#0F0F0F] text-[#FFFFFF] flex flex-col items-center justify-center p-4">
        <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          {/* User "Image" */}
          <div className="w-24 h-24 bg-[#00FFF7] text-[#0F0F0F] rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
            {userData?.username?.[0]?.toUpperCase() || "?"}
          </div>

          {/* User Info */}
          <h1 className="text-2xl font-bold mb-2">{userData?.username || "Unknown User"}</h1>
          <p className="text-[#CCCCCC] mb-4">{userData?.email || "No email available"}</p>

          {/* Additional Info */}
          <p className="text-sm text-[#CCCCCC]">User ID: {userData?.user_id || "N/A"}</p>
        </div>
      </div>
    </>
  );
}

export default Dashboard;