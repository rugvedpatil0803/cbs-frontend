import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SwitchRole from "./SwitchRole";

const Header = () => {
  const navigate = useNavigate();

  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";

  const [currentTime, setCurrentTime] = useState(new Date());

  // ⏱️ Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Format date & time
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
  });

  return (
    <div
      style={{
        height: "60px",
        background: "linear-gradient(135deg, #1e3a8a, #6d28d9)", // bluish → purplish
        color: "#e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        borderRadius: "12px",
      }}
    >
      {/* Left Side */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
  }}
>
  {/* 👤 Profile Circle */}
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
    {/* You can later replace with image */}
    {firstName?.charAt(0)}
  </div>

  {/* 👋 Greeting */}
    <div
        style={{
        fontSize: "18px",
        fontWeight: "500",
        letterSpacing: "0.5px",
        }}
    >
        Hi, {firstName} {lastName}
    </div>
    </div>

      {/* Right Side */}
      <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
        
        {/* 📅 Date & Time */}
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

        <SwitchRole />

        {/* Logout */}
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
          onMouseOver={(e) => (e.target.style.opacity = "0.9")}
          onMouseOut={(e) => (e.target.style.opacity = "1")}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;