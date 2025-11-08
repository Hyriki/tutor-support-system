import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

export const Confirmation = () => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white w-full min-h-screen flex flex-col"
      data-model-id="273:1426"
    >
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <img
            className="w-[407px] h-[404px] object-cover"
            alt="Success confirmation illustration"
            src="https://c.animaapp.com/mhlx4t8jgDU4Ga/img/image-4.png"
          />
        </div>

        <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
          <img
            className="w-[100px] h-[100px]"
            alt="Checkmark icon"
            src="https://c.animaapp.com/mhlx4t8jgDU4Ga/img/frame-1000001980.png"
          />
        </div>

        <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
          <img
            className="max-w-[897px] h-auto"
            alt="Your password has been updated successfully!"
            src="https://c.animaapp.com/mhlx4t8jgDU4Ga/img/your-password-has-been-updated-sucessfully-.png"
          />
        </div>

        <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
          <button
            onClick={() => navigate("/login")}
            className="px-12 py-6 text-3xl font-bold bg-transparent hover:opacity-80 transition-opacity"
          >
            DONE!
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};
