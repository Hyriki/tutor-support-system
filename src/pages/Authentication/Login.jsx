import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

export const Login = () => {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    let user;

    // Test accounts - hỗ trợ cả username và email
    const testAccounts = [
      { username: 'student', email: 'student@tutorconnect.com', password: 'student123', name: 'Nguyen Van Student', role: 'student' },
      { username: 'tutor', email: 'tutor@tutorconnect.com', password: 'tutor123', name: 'Tran Van Tutor', role: 'tutor' },
      { username: 'admin', email: 'admin@tutorconnect.com', password: 'admin123', name: 'Le Thi Admin', role: 'admin' }
    ];

    // Tìm user theo username HOẶC email
    user = testAccounts.find(account => 
      (account.username === usernameOrEmail || account.email === usernameOrEmail) && 
      account.password === password
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/');
    } else {
      setError('Invalid username, email or password');
    }
  };

  return (
    <div className="bg-white w-full min-h-screen flex flex-col font-sans text-gray-800">
      <Header />

      <main className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16">
          <aside className="flex flex-col items-center gap-6">
            <div className="relative">
              <img
                className="w-[300px] h-auto"
                alt="BK TP.HCM Logo"
                src="https://c.animaapp.com/mhlx4t8jgDU4Ga/img/logo.png"
              />
            </div>
          </aside>

          <section className="flex flex-col gap-8 w-full max-w-[615px]">
            <h2 className="text-cyan-600 text-[28px] font-bold tracking-[0] leading-normal text-center">
              WELCOME TO TuTorConnect!
            </h2>

            <form className="flex flex-col gap-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <label
                  htmlFor="usernameOrEmail"
                  className="text-cyan-600 text-lg font-semibold"
                >
                  Username or Email Address
                </label>
                <input
                  id="usernameOrEmail"
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="h-[60px] bg-white rounded-lg border-2 border-gray-300 text-lg px-4 text-gray-900 placeholder-gray-500 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200"
                  placeholder="Enter username or email"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label
                  htmlFor="password"
                  className="text-cyan-600 text-lg font-semibold"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[60px] bg-white rounded-lg border-2 border-gray-300 text-lg px-4 text-gray-900 placeholder-gray-500 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200"
                  placeholder="Enter password"
                />
              </div>

              <button 
                type="submit"
                className="h-[60px] bg-[#2596be] hover:bg-[#1e7a9e] rounded-lg text-white text-xl font-bold transition-colors"
              >
                Login
              </button>
            </form>

            {/* Phần nút điều hướng - 2 nút ngang hàng */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <button
                  onClick={() => navigate("/reset-password")}
                  className="font-medium text-[#111111] text-base underline hover:opacity-80 transition-opacity"
                >
                  Forget password?
                </button>
                <span className="hidden sm:inline text-gray-500">|</span>
                <button
                  onClick={() => navigate("/register")}
                  className="font-medium text-[#111111] text-base underline hover:opacity-80 transition-opacity"
                >
                  Create Account
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate("/change-password")}
              className="w-full max-w-[300px] mx-auto h-[50px] border-2 border-gray-300 rounded-lg font-medium text-[#111111] text-lg hover:bg-gray-100 transition-colors"
            >
              Change password
            </button>

            <div className="flex items-center justify-center mt-4">
              <p className="font-normal text-xs text-center text-gray-600">
                Secure Login with reCAPTCHA subject to Google{" "}
                <a href="#" className="text-gray-800 underline hover:opacity-80">
                  Terms
                </a>
                {" & "}
                <a href="#" className="text-gray-800 underline hover:opacity-80">
                  Privacy
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
