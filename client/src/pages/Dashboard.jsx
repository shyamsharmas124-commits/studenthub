import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    API.get("/course").then((res) => setCourses(res.data));
  }, []);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-900 min-h-screen">
        <Navbar />

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <StatsCard title="Total Courses" value={courses.length} />
            <StatsCard title="Completed" value="0" />
            <StatsCard title="Progress" value="0%" />
          </div>

          {/* Courses */}
          <h2 className="text-2xl mb-4">Courses</h2>

          <div className="grid grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-gray-800 p-5 rounded-xl shadow hover:scale-105 transition"
              >
                <h3 className="text-xl mb-2">{c.title}</h3>

                <p className="text-sm text-gray-400 mb-2">
                  {c.category}
                </p>

                <a
                  href={c.link}
                  target="_blank"
                  className="text-blue-400"
                >
                  Go to Course →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}