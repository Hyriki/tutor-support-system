import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { validateOldPassword, findAccount } from "../../../lib/auth";

const formFields = [
  { id: "username", label: "Username/Email", type: "text" },
  { id: "oldPassword", label: "Old Password", type: "password" },
  { id: "newPassword", label: "New Password", type: "password" },
  { id: "confirmPassword", label: "Confirm Password", type: "password" },
];

export const ChangePassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    const account = findAccount(username);
    if (!account) {
      setError("Account not found");
      return;
    }

    if (!validateOldPassword(username, oldPassword)) {
      setError("Old password is incorrect");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from old password");
      return;
    }

    navigate("/confirmation");
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50"
      data-model-id="273:1500"
    >
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[888px] bg-white/90 backdrop-blur-sm shadow-[0px_4px_4px_#00000040] rounded-xl border border-black/10 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
          <div className="p-12">
            <h2 className="text-center [font-family:'Rubik_One-Regular',Helvetica] font-normal text-cyan-600 text-4xl tracking-[0] leading-[normal] mb-12 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
              Change Your Password
            </h2>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:900ms]">
                  {error}
                </div>
              )}

              {formFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[200px_1fr] gap-8 items-center translate-y-[-1rem] animate-fade-in opacity-0"
                  style={{
                    "--animation-delay": `${1000 + index * 200}ms`,
                  }}
                >
                  <label
                    htmlFor={field.id}
                    className="[font-family:'Rubik_One-Regular',Helvetica] font-normal text-cyan-600 text-[32px] tracking-[0] leading-[normal]"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    value={
                      field.id === "username"
                        ? username
                        : field.id === "oldPassword"
                          ? oldPassword
                          : field.id === "newPassword"
                            ? newPassword
                            : confirmPassword
                    }
                    onChange={(e) => {
                      if (field.id === "username") {
                        setUsername(e.target.value);
                      } else if (field.id === "oldPassword") {
                        setOldPassword(e.target.value);
                      } else if (field.id === "newPassword") {
                        setNewPassword(e.target.value);
                      } else {
                        setConfirmPassword(e.target.value);
                      }
                    }}
                    className="h-[67px] bg-[#eaeaea] rounded-lg border border-solid border-black shadow-[0px_4px_4px_#00000040] text-lg px-4"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}

              <div className="flex justify-center pt-8 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1800ms]">
                <button
                  type="submit"
                  className="w-[617px] h-[92px] bg-[#eaeaea] hover:bg-[#d5d5d5] rounded-lg border border-solid border-black shadow-[0px_4px_4px_#00000040] [text-shadow:0px_4px_4px_#00000040] [-webkit-text-stroke:1px_#000000] [font-family:'Noto_Sans',Helvetica] font-normal text-transparent text-xl tracking-[0] leading-[normal] transition-colors"
                >
                  Confirm
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:2000ms]">
                <p className="font-semibold mb-2 text-blue-900">Test Accounts:</p>
                <div className="space-y-1 text-blue-800">
                  <p><strong>Student:</strong> student / student123</p>
                  <p><strong>Tutor:</strong> tutor / tutor123</p>
                  <p><strong>Admin:</strong> admin / admin123</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
