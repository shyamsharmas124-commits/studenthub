import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleSelect from "./pages/RoleSelect";
import Dashboard from "./pages/Dashboard";
import AddCourse from "./pages/AddCourse";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/role"
          element={
            <ProtectedRoute>
              <RoleSelect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-course"
          element={
            <ProtectedRoute>
              <AddCourse />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
