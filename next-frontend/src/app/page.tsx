import Navbar from "../components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-0 sm:p-0 bg-[#0F0F0F] text-[#FFFFFF]">
      <Navbar />
      <header className="w-full max-w-5xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 mt-15  text-[#00FFF7] ">
          Blockchain-Powered AI Training for Image Generation
        </h1>
        <p className="text-lg sm:text-xl m-15 text-[#CCCCCC]">
          A cutting-edge prototype combining blockchain technology and AI to revolutionize image generation.
        </p>
      </header>

      <main className="flex flex-col items-center gap-12 w-full max-w-5xl mx-auto">
        <section className="flex flex-col sm:flex-row items-center gap-8 bg-[#1E1E1E] p-6 rounded-lg">
          <Image
            src="/blockchain.png"
            alt="Blockchain illustration"
            width={200}
            height={200}
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold mb-2 text-[#00FFF7]">Blockchain System</h2>
            <p className="text-[#CCCCCC]">
              Built with Go, our blockchain ensures secure and transparent data
              storage for AI model training and image generation.
            </p>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row items-center gap-8 bg-[#1E1E1E] p-6 rounded-lg">
          <Image
            src="/artificial-intelligence.png"
            alt="AI illustration"
            width={200}
            height={200}
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold mb-2 text-[#FF00C8]">AI Model Training</h2>
            <p className="text-[#CCCCCC]">
              Developed in Python using PyTorch, our AI component generates
              high-quality images through advanced training techniques.
            </p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-[#00FFF7]">Get Started</h2>
          <p className="mb-4 text-[#CCCCCC]">
            Explore our prototype and experience the future of blockchain and AI integration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/train"
              className="px-6 py-3 bg-[#00FFF7] text-[#0F0F0F] rounded-lg hover:bg-[#00E6DF] transition"
            >
              Train-AI
            </a>
            <a
              href="/demo"
              className="px-6 py-3 bg-[#FF00C8] text-[#0F0F0F] rounded-lg hover:bg-[#E600B4] transition"
            >
              Try the Demo
            </a>
          </div>
        </section>
      </main>

      <footer className="w-full max-w-5xl mx-auto text-center mt-12">
        <p className="text-sm text-[#CCCCCC]">
          © {new Date().getFullYear()} Blockchain-AI Prototype. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
