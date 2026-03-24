import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, loginWithPassword } from "../services/authService";
import { getHighestRole } from "../utils/roleUtils";
import { redirectToDashboard } from "../utils/navigationUtils";
import { encryptData } from "../utils/cryptoUtils";

const Login = () => {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleEmailNext = async () => {
    try {
      setError("");
      setMessage("");
      setLoading(true);

      const res = await loginWithEmail(email);

      setStep("password");
      setMessage(res?.message || "Enter password");

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
    try {
      setError("");
      setLoading(true);

      const data = await loginWithPassword(email, password);

      if (!data?.token) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("token", encryptData(data.token));

      if (data.refreshToken) {
        localStorage.setItem(
          "refreshToken",
          encryptData(data.refreshToken)
        );
      }

      localStorage.setItem("roles", JSON.stringify(data.roles || []));
      localStorage.setItem("userId", String(data.userId || ""));
      localStorage.setItem("firstName", data.firstName || "");
      localStorage.setItem("lastName", data.lastName || "");

      const highestRole = getHighestRole(data.roles || []);

      if (!highestRole) {
        throw new Error("No role assigned to user");
      }

      localStorage.setItem("activeRole", highestRole);

      redirectToDashboard(highestRole, navigate);

    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ padding: "20px" }}>
      <div style={{ width: "300px", margin: "100px auto" }}>
        <h2>Login</h2>

        {step === "email" && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <button onClick={handleEmailNext} disabled={loading}>
              {loading ? "Please wait..." : "Next"}
            </button>
          </>
        )}

        {step === "password" && (
          <>
            <p>
              {email}{" "}
              <span
                onClick={() => setStep("email")}
                style={{ color: "blue", cursor: "pointer" }}
              >
                change
              </span>
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />

            <button onClick={handlePasswordLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
      </div>
    </div>
  );
};

export default Login;