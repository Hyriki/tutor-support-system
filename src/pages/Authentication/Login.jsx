import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";


export const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    let user;

    if (username === 'student' && password === 'student123') {
      user = { name: 'Nguyen Van Student', role: 'student' };
    } else if (username === 'tutor' && password === 'tutor123') {
      user = { name: 'Tran Van Tutor', role: 'tutor' };
    } else if (username === 'admin' && password === 'admin123') {
      user = { name: 'Le Thi Admin', role: 'admin' };
    }

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/');
    } else {
      alert('Invalid username or password');
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
                  htmlFor="username"
                  className="text-cyan-600 text-lg font-semibold"
                >
                  Username or Email Address
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
                <p className="font-semibold mb-2 text-blue-900">Test Accounts:</p>
                <div className="space-y-1 text-blue-800">
                  <p><strong>Student:</strong> student / student123</p>
                  <p><strong>Tutor:</strong> tutor / tutor123</p>
                  <p><strong>Admin:</strong> admin / admin123</p>
                </div>
              </div>
            </form>

            <div className="flex flex-col items-center gap-4 mt-4">
              <button
                onClick={() => navigate("/reset-password")}
                className="font-medium text-[#111111] text-base underline hover:opacity-80 transition-opacity"
              >
                Forget password?
              </button>

              <button
                onClick={() => navigate("/change-password")}
                className="w-full max-w-[300px] h-[50px] border-2 border-gray-300 rounded-lg font-medium text-[#111111] text-lg hover:bg-gray-100 transition-colors"
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
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
