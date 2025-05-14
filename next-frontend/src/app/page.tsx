import Navbar from "../components/Navbar";
import Image from "next/image";
import "../styles/cyber-styles.css";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-0 sm:p-0 text-[#FFFFFF]">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
        src="/30200-380473759.mp4"
        autoPlay
        loop
        muted
      ></video>

      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <header className="w-full max-w-5xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 mt-15 text-[#00FFF7] neon-text">
          Blockchain-Powered AI Training for Image Generation
        </h1>
        <p className="text-lg sm:text-xl m-15 text-[#CCCCCC] glow-text">
          A cutting-edge prototype combining blockchain technology and AI to
          revolutionize image generation.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center gap-12 w-full max-w-5xl mx-auto">
        <section className="flex flex-col sm:flex-row items-center gap-8 bg-[#1E1E1E] p-6 rounded-lg cyber-card">
          <Image
            src="/blockchain.png"
            alt="Blockchain illustration"
            width={200}
            height={200}
            className="cyber-image"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold mb-2 text-[#00FFF7] neon-text">
              Blockchain System
            </h2>
            <p className="text-[#CCCCCC] glow-text">
              Built with Go, our blockchain ensures secure and transparent data
              storage for AI model training and image generation.
            </p>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row items-center gap-8 bg-[#1E1E1E] p-6 rounded-lg cyber-card">
          <Image
            src="/artificial-intelligence.png"
            alt="AI illustration"
            width={200}
            height={200}
            className="cyber-image"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold mb-2 text-[#FF00C8] neon-text-pink">
              AI Model Training
            </h2>
            <p className="text-[#CCCCCC] glow-text">
              Developed in Python using PyTorch, our AI component generates
              high-quality images through advanced training techniques.
            </p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-[#FF00C8] neon-text-pink">
            Get Started
          </h2>
          <p className="mb-4 text-[#CCCCCC] glow-text">
            Explore our prototype and experience the future of blockchain and AI
            integration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/train"
              className="px-6 py-3 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition neon-button"
            >
              Train-AI
            </a>
            <a
              href="/demo"
              className="px-6 py-3 bg-[#FF00C8] text-[#0F0F0F] rounded-lg hover:bg-[#E600B4] transition neon-button"
            >
              Try the Demo
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center mt-12">
        <p className="text-sm text-[#CCCCCC] glow-text">
          © {new Date().getFullYear()} Blockchain-AI Prototype. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
