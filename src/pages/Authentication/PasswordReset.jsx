import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

export const PasswordReset = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="bg-white border-2 border-solid border-black w-full max-w-md rounded-2xl shadow-[0px_4px_12px_#00000020] opacity-0 translate-y-[-1rem] animate-fade-in"
          data-model-id="277:1537"
        >
          <div className="flex flex-col items-center gap-6 p-8">
            <p className="w-full [font-family:'Roboto',Helvetica] font-normal text-black text-xl text-center tracking-[0] leading-[normal] opacity-0 translate-y-[-1rem] animate-fade-in [--animation-delay:200ms]">
              Your password has been sent to your email.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-[163px] h-[47px] bg-[#d9d9d9] rounded-lg border border-solid border-black shadow-[0px_4px_4px_#00000040] [text-shadow:0px_4px_4px_#00000040] [-webkit-text-stroke:1px_#000000] [font-family:'Noto_Sans',Helvetica] font-normal text-transparent text-xl hover:bg-[#c9c9c9] transition-colors opacity-0 translate-y-[-1rem] animate-fade-in [--animation-delay:400ms]"
            >
              Done
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
