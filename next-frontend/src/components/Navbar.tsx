"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthModal from "./AuthModalProps";
import BurgerButton from "./BurgerButton";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setUser(null);
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
          setUser({ username: data.username });
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
  };

  if (loading) {
    return (
      <nav className="w-full bg-[#1E1E1E] text-[#FFFFFF] p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#00FFF7]">Blockchain-AI</h1>
          <div className="text-[#CCCCCC]">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav className="w-full bg-[#1E1E1E] text-[#FFFFFF] p-4 sticky top-0 z-50">
        <div className="max-w-8xl mx-auto flex justify-between items-center relative">
          {/* BurgerButton on the left */}
          <div  className="flex items-center">
            <BurgerButton />
            <Link href="/" className="text-2xl font-bold text-[#00FFF7] ml-10">
              Blockchain-AI
            </Link>
          </div>
          {user ? (
            <div className="relative">
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="w-10 h-10 bg-[#00FFF7] text-[#0F0F0F] rounded-full flex items-center justify-center text-xl font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-[#FFFFFF] font-semibold">{user.username}</span>
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1E1E1E] text-[#FFFFFF] rounded-lg shadow-lg">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-[#00FFF7] hover:text-[#0F0F0F] transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-[#00FFF7] hover:text-[#0F0F0F] transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {isModalOpen && (
        <AuthModal
          onClose={() => setIsModalOpen(false)}
          onLoginSuccess={(username: string) => setUser({ username })}
        />
      )}
    </>
  );
}