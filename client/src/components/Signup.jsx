import React, { useState } from "react";
import "../App.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaWaveSquare, FaUser } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const modernVisualStyles = `
  .vinyl-record {
    position: relative;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: linear-gradient(145deg, #0f0f0f, #1a1a1a);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
    animation: spin 20s linear infinite;
    z-index: 10;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .vinyl-grooves {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    overflow: hidden;
  }
  
  .vinyl-groove {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .vinyl-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(145deg, #202020, #333333);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
  }
  
  .vinyl-hole {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #000;
    border: 3px solid rgba(255, 255, 255, 0.2);
    z-index: 2;
  }
  
  .vinyl-dot {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    opacity: 0.7;
  }

  .circular-wave {
    position: absolute;
    border-radius: 50%;
    border: 2px solid #6366f1;
    animation: wave-animation 5s infinite ease-in-out;
    opacity: 0.7;
  }
  
  @keyframes wave-animation {
    0%, 100% {
      transform: scale(1);
      border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
      opacity: 0.7;
    }
    25% {
      transform: scale(1.05);
      border-radius: 60% 40% 60% 40% / 50% 60% 40% 50%;
      opacity: 0.5;
    }
    50% {
      transform: scale(1.1);
      border-radius: 40% 60% 40% 60% / 60% 40% 60% 40%;
      opacity: 0.3;
    }
    75% {
      transform: scale(1.15);
      border-radius: 60% 40% 60% 40% / 40% 60% 40% 60%;
      opacity: 0.1;
    }
  }
  
  .geometric-shape {
    position: absolute;
    background: linear-gradient(var(--angle, 135deg), var(--color-start, #6366f1), var(--color-end, #a855f7));
    border-radius: var(--radius, 8px);
    opacity: var(--opacity, 0.2);
    transform: rotate(var(--rotate, 0deg));
    filter: blur(var(--blur, 0px));
    animation: drift var(--duration, 30s) infinite alternate ease-in-out;
    animation-delay: var(--delay, 0s);
  }
  
  @keyframes drift {
    0% { transform: translate(0, 0) rotate(var(--rotate, 0deg)); }
    100% { transform: translate(var(--x, 10px), var(--y, 10px)) rotate(calc(var(--rotate, 0deg) + var(--rotate-end, 10deg))); }
  }
  
  .glow {
    filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.8));
  }
`;

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    axios
      .post(`${API_URL}/auth/signup`, {
        username,
        email,
        password,
      })
      .then((response) => {
        if (response.data.status) {
          navigate("/login");
        }
      })
      .catch((err) => {
        console.log(err);
        setError(
          err.response?.data?.message || "Signup failed. Please try again."
        );
        setIsLoading(false);
      });
  };

  const generateVinylGrooves = () => {
    const grooves = [];

    for (let i = 1; i <= 20; i++) {
      const size = 10 + i * 9;
      grooves.push(
        <div
          key={i}
          className="vinyl-groove"
          style={{
            width: `${size}%`,
            height: `${size}%`,
            top: `${(100 - size) / 2}%`,
            left: `${(100 - size) / 2}%`,
          }}
        />
      );
    }

    return grooves;
  };

  const generateCircularWaves = () => {
    const waves = [];
    const totalWaves = 4;

    for (let i = 0; i < totalWaves; i++) {
      const size = 330 + i * 30;
      const delay = i * 1.2;

      waves.push(
        <div
          key={i}
          className="circular-wave"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `calc(50% - ${size / 2}px)`,
            left: `calc(50% - ${size / 2}px)`,
            animationDelay: `${delay}s`,
            borderColor: `rgba(99, 102, 241, ${0.8 - i * 0.15})`,
          }}
        />
      );
    }

    return waves;
  };

  const generateGeometricShapes = () => {
    const shapes = [];
    const colors = [
      ["#6366f1", "#a855f7"], 
      ["#a855f7", "#ec4899"],
    ];

    for (let i = 0; i < 4; i++) {
      const colorPair = colors[Math.floor(Math.random() * colors.length)];
      const size = 80 + Math.random() * 200;
      const x = Math.random() * 40 - 20;
      const y = Math.random() * 40 - 20;
      const opacity = 0.05 + Math.random() * 0.15;
      const rotate = Math.random() * 180;
      const rotateEnd = Math.random() * 40 - 20;
      const duration = 20 + Math.random() * 20;
      const delay = Math.random() * 10;
      const blur = Math.random() < 0.5 ? 40 + Math.random() * 60 : 0;
      const radius = Math.random() < 0.5 ? "50%" : `${Math.random() * 30}%`;

      shapes.push(
        <div
          key={i}
          className="geometric-shape"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            "--color-start": colorPair[0],
            "--color-end": colorPair[1],
            "--opacity": opacity,
            "--rotate": `${rotate}deg`,
            "--rotate-end": `${rotateEnd}deg`,
            "--x": `${x}px`,
            "--y": `${y}px`,
            "--duration": `${duration}s`,
            "--delay": `${delay}s`,
            "--blur": `${blur}px`,
            "--radius": radius,
            "--angle": `${Math.random() * 360}deg`,
          }}
        />
      );
    }

    return shapes;
  };

  return (
    <>
      <style>{modernVisualStyles}</style>
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="hidden lg:block lg:w-1/2 relative bg-gray-900 text-white overflow-hidden">
          {generateGeometricShapes()}

          <div className="relative z-30 w-full h-full flex flex-col p-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 mr-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg glow">
                  <FaWaveSquare className="text-white text-3xl" />
                </div>
                <h1 className="text-4xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                    DTunes
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex-grow flex items-center justify-center relative">
              {generateCircularWaves()}

              <div className="vinyl-record">
                <div className="vinyl-grooves">{generateVinylGrooves()}</div>
                <div className="vinyl-label">
                  <div
                    className="vinyl-dot"
                    style={{ top: "20px", left: "30px" }}
                  ></div>
                  <div
                    className="vinyl-dot"
                    style={{ bottom: "20px", right: "30px" }}
                  ></div>
                </div>
                <div className="vinyl-hole"></div>
              </div>
            </div>

            <div className="mt-auto z-30">
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm p-5 rounded-xl border border-indigo-800/30">
                <p className="italic text-gray-300 leading-relaxed text-center">
                  "Music gives a soul to the universe, wings to the mind."
                </p>
                <p className="text-center text-sm text-indigo-400 mt-2">
                  ― Plato
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="h-12 w-12 mr-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <FaWaveSquare className="text-white text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">DTunes</h1>
            </div>

            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Create Your Account
              </h2>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center mb-5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    I agree to the{" "}
                    <span className="text-indigo-600">Terms</span> and{" "}
                    <span className="text-indigo-600">Privacy Policy</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              By signing up, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
