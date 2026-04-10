import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const nav = useNavigate();

  return (
    <div className="w-64 bg-gray-800 h-screen p-5">
      <h1 className="text-2xl font-bold mb-10">StudentHub</h1>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => nav("/dashboard")}
          className="text-left hover:bg-gray-700 p-2 rounded"
        >
          Dashboard
        </button>

        <button
          onClick={() => nav("/add-course")}
          className="text-left hover:bg-gray-700 p-2 rounded"
        >
          Add Course
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            nav("/");
          }}
          className="text-left hover:bg-red-600 p-2 rounded mt-10"
        >
          Logout
        </button>
      </div>
    </div>
  );
}