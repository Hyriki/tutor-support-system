import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { accountExists } from "../../../lib/auth";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (accountExists(username) || accountExists(email)) {
      navigate("/password-reset-notification");
    } else {
      setError("Account not found. Please check your credentials.");
    }
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50 font-sans text-gray-800"
      data-model-id="260:1248"
    >
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-[888px] bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border-0 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
          <div className="p-16">
            <h2 className="text-center font-bold text-cyan-600 text-4xl tracking-[0] leading-[normal] mb-16 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
              Reset Password
            </h2>

            <form className="space-y-12" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1000ms]">
                <label
                  htmlFor="username"
                  className="font-semibold text-cyan-600 text-[32px] tracking-[0] leading-[normal]"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-[67px] bg-[#eaeaea] rounded-lg border border-solid border-black shadow-[0px_4px_4px_#00000040] text-lg px-4 text-gray-900 placeholder-gray-600"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-4 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1200ms]">
                <label
                  htmlFor="email"
                  className="font-semibold text-cyan-600 text-[32px] tracking-[0] leading-[normal]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[67px] bg-[#eaeaea] rounded-lg border border-solid border-black shadow-[0px_4px_4px_#00000040] text-lg px-4 text-gray-900 placeholder-gray-600"
                  placeholder="Enter your email"
                />
              </div>

              <div className="flex justify-center pt-8 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1400ms]">
                <button
                  type="submit"
                  className="w-[617px] h-[92px] bg-[#eaeaea] rounded-lg border border-solid border-black shadow-[0px_4px_4px_#00000040] hover:bg-[#d5d5d5] transition-colors text-xl font-semibold text-black tracking-[0] leading-[normal]"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
