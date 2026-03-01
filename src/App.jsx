import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import CloudinaryTest from "./pages/CloudinaryTest";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Trending from "./pages/Trending";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddStory from "./pages/admin/AddStory";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StoryDetail from "./pages/StoryDetail";

import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register"];

  return (
    <AuthProvider>
      <Toaster position="top-right" />
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/story/:id" element={<ProtectedRoute><StoryDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/add" element={<AdminRoute><AddStory /></AdminRoute>} />
        <Route path="/cloudinary-test" element={<CloudinaryTest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;