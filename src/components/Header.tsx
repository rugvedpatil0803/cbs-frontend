import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaHome } from "react-icons/fa";
import SwitchRole from "./SwitchRole";
import { redirectToDashboard } from "../utils/navigationUtils";
import Swal from "sweetalert2";

const Header = () => {
  const navigate = useNavigate();

  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, Logout",
    });

    if (result.isConfirmed) {
      // 🔵 Optional loader
      Swal.fire({
        title: "Logging out...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      setTimeout(() => {
        localStorage.clear();
        Swal.close();
        navigate("/login");
      }, 800); // smooth UX
    }
  };

  // 🏠 Home click handler
  const handleHomeClick = () => {
    const activeRole = localStorage.getItem("activeRole");

    if (activeRole) {
      redirectToDashboard(activeRole, navigate);
    } else {
      navigate("/login");
    }
  };

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "60px",
        zIndex: 1000,
        background: "linear-gradient(135deg, #1e3a8a, #6d28d9)",
        color: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          onClick={() => navigate("/user-profile")}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#fff",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.35)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
          }
        >
          {firstName?.charAt(0)}
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: "500",
            letterSpacing: "0.5px",
          }}
        >
          Hi, {firstName} {lastName} 👋
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "18px",
          alignItems: "center",
          paddingRight: "35px",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255, 255, 255, 0.08)",
            padding: "6px 10px",
            borderRadius: "8px",
          }}
        >
          <span style={{ opacity: 0.85 }}>{formattedDate}</span>
          <span style={{ fontWeight: "600" }}>{formattedTime}</span>
        </div>

        <div
          onClick={handleHomeClick}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.3)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
          }
          title="Go to Dashboard"
        >
          <FaHome color="white" size={16} />
        </div>

        <SwitchRole />

        <button
          onClick={handleLogout}
          style={{
            padding: "6px 14px",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            border: "none",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;