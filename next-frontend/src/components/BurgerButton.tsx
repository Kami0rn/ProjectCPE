import React, { useState } from "react";
import Link from "next/link";

function BurgerButton() {
  const [menuOpen, setMenuOpen] = useState(false); // State for sidebar visibility

  return (
    <>
      {/* Burger Icon */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex flex-col justify-between w-8 h-6 bg-transparent border-none cursor-pointer focus:outline-none z-50 relative"
        aria-label="Toggle menu"
      >
        <span className="block w-full h-1 bg-[#FFFFFF] rounded"></span>
        <span className="block w-full h-1 bg-[#FFFFFF] rounded"></span>
        <span className="block w-full h-1 bg-[#FFFFFF] rounded"></span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-[calc(100%-4rem)]  w-64 bg-[#1E1E1E] text-[#FFFFFF] shadow-lg transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-40`}
      >
        {/* Sidebar Header */}
        <div className="p-4 bg-[#313131] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#00FFF7]">Menu</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-[#FFFFFF] hover:text-[#00FFF7] transition"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Links */}
        <ul className="flex flex-col gap-4 p-4">
          <li>
            <Link
              href="/generate/select_model"
              className="block px-4 py-2 rounded-lg hover:bg-[#00FFF7] hover:text-[#0F0F0F] transition"
            >
              Use AI
            </Link>
          </li>
          <li>
            <Link
              href="/check"
              className="block px-4 py-2 rounded-lg hover:bg-[#00FFF7] hover:text-[#0F0F0F] transition"
            >
              Check Image
            </Link>
          </li>
          <li>
            <Link
              href="/check/model"
              className="block px-4 py-2 rounded-lg hover:bg-[#00FFF7] hover:text-[#0F0F0F] transition"
            >
              Track Image
            </Link>
          </li>
          <li>
            <Link
              href="/check/display"
              className="block px-4 py-2 rounded-lg hover:bg-[#00FFF7] hover:text-[#0F0F0F] transition"
            >
              Blockchain
            </Link>
          </li>
          <li>
            <Link
              href="/train"
              className="block px-4 py-2 rounded-lg hover:bg-[#00FFF7] hover:text-[#0F0F0F] transition"
            >
              Train
            </Link>
          </li>
        </ul>

        {/* Sidebar Footer */}
        <div className="mt-auto p-4 bg-[#313131] text-center">
          <p className="text-sm text-[#CCCCCC]">© 2025 Blockchain-AI</p>
        </div>
      </div>
    </>
  );
}

export default BurgerButton;