import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const setRole = async (role) => {
    try {
      setLoading(true);
      await API.patch("/user/role", { role });
      nav("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to set role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[600px] text-center">
        <h1 className="text-3xl font-bold mb-8">
          Choose Your Role
        </h1>

        <div className="flex gap-6">
          {/* STUDENT CARD */}
          <div
            onClick={() => !loading && setRole("STUDENT")}
            className="flex-1 border rounded-xl p-6 cursor-pointer 
            hover:shadow-xl hover:scale-105 transition duration-200"
          >
            <h2 className="text-xl font-semibold mb-2">
              🎓 Student
            </h2>
            <p className="text-gray-500 text-sm">
              Learn courses and track your progress
            </p>
          </div>

          {/* TEACHER CARD */}
          <div
            onClick={() => !loading && setRole("TEACHER")}
            className="flex-1 border rounded-xl p-6 cursor-pointer 
            hover:shadow-xl hover:scale-105 transition duration-200"
          >
            <h2 className="text-xl font-semibold mb-2">
              👨‍🏫 Teacher
            </h2>
            <p className="text-gray-500 text-sm">
              Share courses and teach others
            </p>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <p className="mt-6 text-purple-600 font-medium">
            Setting your role...
          </p>
        )}
      </div>
    </div>
  );
}