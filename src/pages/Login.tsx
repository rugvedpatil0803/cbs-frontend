import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, loginWithPassword } from "../services/authService";
import { getHighestRole } from "../utils/roleUtils";
import { redirectToDashboard } from "../utils/navigationUtils";

const Login = () => {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleEmailNext = async () => {
    try {
      await loginWithEmail(email);
      setStep("password");
      setMessage("Enter password");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordLogin = async () => {
    try {
      const res = await loginWithPassword(email, password);
      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("roles", JSON.stringify(data.roles));
      localStorage.setItem("userId", data.userId.toString());
      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("lastName", data.lastName);

      const highestRole = getHighestRole(data.roles);
      localStorage.setItem("activeRole", highestRole!);

      redirectToDashboard(highestRole!, navigate);

    } catch (err: any) {
      setError(err.message);
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
            <button onClick={handleEmailNext}>Next</button>
          </>
        )}

        {step === "password" && (
          <>
            <p>{email} <span onClick={() => setStep("email")}>change</span></p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button onClick={handlePasswordLogin}>Login</button>
          </>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
      </div>
    </div>
  );
};

export default Login;