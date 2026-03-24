import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginWithEmail,
  loginWithPassword,
  requestOtp,
  resetPassword,
} from "../services/authService";
import { getHighestRole } from "../utils/roleUtils";
import { redirectToDashboard } from "../utils/navigationUtils";
import { encryptData } from "../utils/cryptoUtils";
import Swal from "sweetalert2";

const Login = () => {
  const [step, setStep] = useState<
    "email" | "password" | "forgot-email" | "reset-password"
  >("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  const handleEmailNext = async () => {
    if (!email.trim()) return setError("Please enter email");

    try {
      setError("");
      setMessage("");
      setLoading(true);

      const res = await loginWithEmail(email);

      setStep("password");
      setMessage(res?.message || "Enter your password");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Email verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!password.trim()) return setError("Please enter password");

    try {
      setError("");
      setLoading(true);

      const data = await loginWithPassword(email, password);

      localStorage.setItem("token", encryptData(data.token));
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", encryptData(data.refreshToken));
      }

      localStorage.setItem("roles", JSON.stringify(data.roles || []));
      localStorage.setItem("userId", String(data.userId || ""));
      localStorage.setItem("firstName", data.firstName || "");
      localStorage.setItem("lastName", data.lastName || "");

      const highestRole = getHighestRole(data.roles || []);
      localStorage.setItem("activeRole", highestRole);

      redirectToDashboard(highestRole, navigate);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed";

      setError(errorMessage);

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };


  const handleRequestOtp = async () => {
    if (!email.trim()) return setError("Enter email");

    try {
      setError("");
      setMessage("");
      setLoading(true);

      const res = await requestOtp(email);

      setMessage(res.message);
      setStep("reset-password");
    } catch (err: any) {
      setMessage("");
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      setMessage("");
      return setError("Enter OTP and new password");
    }

    try {
      setError("");
      setMessage("");
      setLoading(true);

      const res = await resetPassword(email, otp, newPassword);

      setMessage(res.message);

      // ✅ Reset state + redirect
      setTimeout(() => {
        setStep("email");
        setOtp("");
        setNewPassword("");
        setPassword("");
        setError("");
        setMessage("");
        navigate("/login");
      }, 1200);

    } catch (err: any) {
      setMessage("");
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "5px" }}>
          Welcome Back
        </h2>

        {(step === "password" || step === "reset-password") && (
          <p style={emailStyle}>{email}</p>
        )}

        <p style={subtitleStyle}>
          {step === "email" && "Enter your email"}
          {step === "password" && "Enter your password"}
          {step === "forgot-email" && "Enter your email to receive OTP"}
          {step === "reset-password" && "Enter OTP and new password"}
        </p>

        {step === "email" && (
          <>
            <input
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              onKeyDown={(e) => e.key === "Enter" && handleEmailNext()}
            />

            <button style={buttonStyle} onClick={handleEmailNext} disabled={loading}>
              {loading ? "Please wait..." : "Next →"}
            </button>
          </>
        )}

        {step === "password" && (
          <>
            <button style={backBtn} onClick={() => setStep("email")}>
              ← Back
            </button>

            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
            />

            <button style={buttonStyle} onClick={handlePasswordLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p style={linkStyle} onClick={() => setStep("forgot-email")}>
              Forgot Password?
            </p>
          </>
        )}

        {step === "forgot-email" && (
          <>
            <button style={backBtn} onClick={() => setStep("password")}>
              ← Back
            </button>

            <input
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
            />

            <button style={buttonStyle} onClick={handleRequestOtp} disabled={loading}>
              {loading ? "Sending..." : "Request OTP"}
            </button>
          </>
        )}

        {step === "reset-password" && (
          <>
            <input
              style={inputStyle}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
            />

            <input
              style={inputStyle}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
            />

            <button style={buttonStyle} onClick={handleResetPassword} disabled={loading}>
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </>
        )}

        {error && !message && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        {message && !error && (
          <p style={{ color: "green", textAlign: "center" }}>{message}</p>
        )}
      </div>
    </div>
  );
};

const containerStyle = {
  position: "fixed" as const,
  top: 0, left: 0, right: 0, bottom: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #1e3a8a, #6d28d9)",
};

const cardStyle = {
  width: "360px",
  padding: "30px",
  borderRadius: "12px",
  background: "white",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: "14px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "white",
  border: "none",
  borderRadius: "8px",
};

const backBtn = {
  background: "none",
  border: "none",
  color: "#6d28d9",
  marginBottom: "10px",
  cursor: "pointer",
};

const linkStyle = {
  textAlign: "center" as const,
  color: "#6d28d9",
  marginTop: "10px",
  cursor: "pointer",
};

const subtitleStyle = {
  textAlign: "center" as const,
  color: "#6b7280",
  marginBottom: "20px",
};

const emailStyle = {
  textAlign: "center" as const,
  fontWeight: "600",
  color: "#071b44",
  marginBottom: "15px",
};

export default Login;