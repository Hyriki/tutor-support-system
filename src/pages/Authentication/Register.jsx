import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

const formFields = [
  { id: "username", label: "Username", type: "text" },
  { id: "email", label: "Email", type: "email" },
  { id: "password", label: "Password", type: "password" },
  { id: "confirmPassword", label: "Confirm Password", type: "password" },
];

export const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword || !role) {
      setError("Please fill in all fields and select a role");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match");
      return;
    }

    navigate("/login");
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50 font-sans text-gray-800"
      data-model-id="273:1500"
    >
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[888px] bg-white/90 backdrop-blur-sm shadow-[0px_4px_4px_#00000040] rounded-xl border border-black/10 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
          <div className="p-12">
            <h2 className="text-center font-bold text-cyan-600 text-4xl tracking-[0] leading-[normal] mb-12 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
              Create Your Account
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
                    className="font-semibold text-cyan-600 text-[32px] tracking-[0] leading-[normal] whitespace-nowrap"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    value={
                      field.id === "username"
                        ? username
                        : field.id === "email"
                        ? email
                        : field.id === "password"
                        ? password
                        : confirmPassword
                    }
                    onChange={(e) => {
                      if (field.id === "username") {
                        setUsername(e.target.value);
                      } else if (field.id === "email") {
                        setEmail(e.target.value);
                      } else if (field.id === "password") {
                        setPassword(e.target.value);
                      } else {
                        setConfirmPassword(e.target.value);
                      }
                    }}
                    className="h-[56px] w-full max-w-[360px] justify-self-end bg-[#eaeaea] rounded-lg border border-solid border-black shadow-[0px_4px_4px_#00000040] text-lg px-4 text-gray-900 placeholder-gray-600"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}

              <div
                className="grid grid-cols-[200px_1fr] gap-8 items-center translate-y-[-1rem] animate-fade-in opacity-0"
                style={{ "--animation-delay": "1800ms" }}
              >
                <span className="font-semibold text-cyan-600 text-[32px] tracking-[0] leading-[normal] whitespace-nowrap">
                  Role
                </span>
                <div className="flex gap-8 justify-end">
                  <label className="flex items-center gap-2 text-lg text-gray-800">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={role === "Tutor"}
                      onChange={() =>
                        setRole((prev) => (prev === "Tutor" ? "" : "Tutor"))
                      }
                    />
                    <span>Tutor</span>
                  </label>
                  <label className="flex items-center gap-2 text-lg text-gray-800">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={role === "Student"}
                      onChange={() =>
                        setRole((prev) => (prev === "Student" ? "" : "Student"))
                      }
                    />
                    <span>Student</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-center pt-8 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:2000ms]">
                <button
                  type="submit"
                  className="w-[617px] h-[92px] bg-[#eaeaea] hover:bg-[#d5d5d5] rounded-lg border border-solid border-black shadow-[0px_4px_4px_#00000040] text-xl font-semibold text-black tracking-[0] leading-[normal] transition-colors"
                >
                  Register
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
