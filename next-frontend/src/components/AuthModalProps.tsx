"use client";

import { useState } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2
import "sweetalert2/dist/sweetalert2.min.css"; // Import SweetAlert2 styles

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (username: string) => void; // New prop
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage("");

    const endpoint = isLogin
      ? `${process.env.NEXT_PUBLIC_API_URL}/auth/login`
      : `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;

    const body = isLogin
      ? { username, password }
      : { username, email, password }; // Include email for registration

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Save the token to local storage
          localStorage.setItem("token", data.token);

          // Notify parent component of login success
          onLoginSuccess(username);

          // Show success message
          Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: `Welcome back, ${username}!`,
            confirmButtonColor: "#00FFF7",
          });

          // Redirect the user (example: to a dashboard page)
          window.location.href = "/dashboard";
        } else {
          // Show success message for registration
          Swal.fire({
            icon: "success",
            title: "Registration Successful",
            text: "Your account has been created successfully.",
            confirmButtonColor: "#00FFF7",
          });
        }

        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Something went wrong. Please try again.",
          confirmButtonColor: "#FF0000",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "An unexpected error occurred. Please try again.",
        confirmButtonColor: "#FF0000",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1E1E1E] text-[#FFFFFF] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {isLogin ? "Login" : "Register"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded bg-[#1E1E1E] text-[#FFFFFF] border border-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#00FFF7]"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-[#1E1E1E] text-[#FFFFFF] border border-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#00FFF7]"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-[#1E1E1E] text-[#FFFFFF] border border-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#00FFF7]"
              required
            />
          </div>
          {errorMessage && (
            <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full py-2 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#00FFF7] hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#CCCCCC] hover:text-[#FFFFFF]"
        >
          ✕
        </button>
      </div>
    </div>
  );
}