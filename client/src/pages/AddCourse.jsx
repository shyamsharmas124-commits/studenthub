import { useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function AddCourse() {
  const [form, setForm] = useState({});

  const submit = async () => {
    await API.post("/course", form);
    alert("Course added");
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-xl w-96">
          <h2 className="text-2xl mb-6">Add Course</h2>

          <input
            className="w-full p-3 mb-4 bg-gray-700 rounded"
            placeholder="Title"
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <input
            className="w-full p-3 mb-4 bg-gray-700 rounded"
            placeholder="Link"
            onChange={(e) =>
              setForm({ ...form, link: e.target.value })
            }
          />

          <input
            className="w-full p-3 mb-4 bg-gray-700 rounded"
            placeholder="Category"
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          />

          <button
            onClick={submit}
            className="w-full bg-purple-600 p-3 rounded"
          >
            Add Course
          </button>
        </div>
      </div>
    </div>
  );
}