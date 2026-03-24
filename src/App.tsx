import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import UserProfile from "./pages/UserProfile";

import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Protected + Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/coach-dashboard" element={<CoachDashboard />} />
          <Route path="/participant-dashboard" element={<ParticipantDashboard />} />
          <Route path="/user-profile" element={<UserProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;