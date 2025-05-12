"use client";

import { useEffect, useState } from "react";
import { Block } from "@/types/blockchain"; // Adjust the path if necessary
import Navbar from "@/components/Navbar"; // Import the Navbar component

export default function DisplayChain() {
  const [chain, setChain] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedBlocks, setExpandedBlocks] = useState<number[]>([]);

  useEffect(() => {
    const fetchChain = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from local storage
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chain`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Attach token as Bearer token
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch blockchain data");
        }
        const data = await response.json();
        setChain(data.chain);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChain();
  }, []);

  const toggleExpandBlock = (index: number) => {
    setExpandedBlocks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-[#FFFFFF]">
      {/* Add Navbar */}
      <Navbar />
      <div className="flex flex-col items-center p-4">
        <h1 className="text-4xl font-bold mb-8 text-[#00FFF7]">Blockchain Data</h1>
        <div className="flex items-center  p-4 w-full overflow-x-auto">
          {chain.map((block, index) => (
            <div key={block.index} className="flex items-center">
              {/* Block */}
              <div className="flex-shrink-0 w-80 h-[60vh] bg-[#1E1E1E] p-6 rounded-lg shadow-lg overflow-hidden hover:overflow-auto transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-[#00FFF7]">
                  Block {block.index}
                </h2>
                <p className="text-[#CCCCCC]">
                  <strong>Timestamp:</strong> {new Date(block.timestamp).toLocaleString()}
                </p>
                <p className="text-[#CCCCCC]">
                  <strong>Previous Hash:</strong> {block.prev_hash}
                </p>
                <p className="text-[#CCCCCC]">
                  <strong>Hash:</strong> {block.hash}
                </p>
                <p className="text-[#CCCCCC]">
                  <strong>Proof:</strong> {block.proof}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[#FF00C8]">Transactions:</h3>
                {block.transactions && block.transactions.length > 0 ? (
                  <ul className="list-disc pl-6 text-[#CCCCCC] max-h-[20vh] overflow-hidden hover:overflow-auto transition-all">
                    {block.transactions
                      .slice(0, expandedBlocks.includes(block.index) ? block.transactions.length : 5)
                      .map((tx, index) => (
                        <li key={index} className="mb-2">
                          <p>
                            <strong>Sender:</strong> {tx.sender}
                          </p>
                          <p>
                            <strong>Receiver:</strong> {tx.receiver}
                          </p>
                          <p>
                            <strong>Amount:</strong> {tx.amount}
                          </p>
                          <p>
                            <strong>Image Hash:</strong> {tx.image_hash}
                          </p>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-[#CCCCCC]">No transactions in this block.</p>
                )}
                {block.transactions && block.transactions.length > 5 && (
                  <button
                    onClick={() => toggleExpandBlock(block.index)}
                    className="mt-4 px-4 py-2 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition"
                  >
                    {expandedBlocks.includes(block.index) ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>

              {/* Connector */}
              {index < chain.length - 1 && (
                <div className="w-16 h-1 bg-[#00FFF7] mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}