import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);

      nav("/role");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE (Branding) */}
      <div className="w-1/2 bg-blue-600 text-white flex flex-col justify-center p-16">
        <h1 className="text-5xl font-bold mb-6">
          Welcome Back 👋
        </h1>

        <p className="text-lg opacity-90">
          Continue learning and growing your skills with StudentHub.
        </p>
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-xl shadow-lg w-[400px]">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Login
          </h2>

          <input
            className="w-full p-3 mb-4 border rounded"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 mb-4 border rounded"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700"
          >
            Login
          </button>

          {/* ✅ FIXED LINK */}
          <p className="text-sm text-center mt-4">
            New here?{" "}
            <Link
              to="/"
              className="text-blue-600 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}