import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({});
  const nav = useNavigate();

  const handleSignup = async () => {
    try {
      await API.post("/auth/signup", form);
      nav("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE (Branding) */}
      <div className="w-1/2 bg-purple-600 text-white flex flex-col justify-center p-16">
        <h1 className="text-5xl font-bold mb-6">
          Learn. Teach. Grow.
        </h1>

        <p className="text-lg opacity-90">
          Join StudentHub — where students become teachers
          and share knowledge with the world.
        </p>
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-xl shadow-lg w-[400px]">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Create Account
          </h2>

          <input
            className="w-full p-3 mb-4 border rounded"
            placeholder="Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="w-full p-3 mb-4 border rounded"
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            className="w-full p-3 mb-4 border rounded"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button
            onClick={handleSignup}
            className="w-full bg-purple-600 text-white p-3 rounded font-semibold hover:bg-purple-700"
          >
            Sign Up
          </button>

          {/* 🔥 Login redirect */}
          <p className="text-sm text-center mt-4">
            Already a user?{" "}
            <span
              className="text-purple-600 cursor-pointer"
              onClick={() => nav("/login")}
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}