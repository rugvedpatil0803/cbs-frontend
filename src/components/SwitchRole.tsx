import { useNavigate } from "react-router-dom";
import { redirectToDashboard } from "../utils/navigationUtils";

const SwitchRole = () => {
  const navigate = useNavigate();

  let roles: string[] = [];
  try {
    roles = JSON.parse(localStorage.getItem("roles") || "[]");
  } catch {
    roles = [];
  }

  const activeRole = localStorage.getItem("activeRole") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;

    localStorage.setItem("activeRole", selectedRole);
    redirectToDashboard(selectedRole, navigate);
  };

  return (
    <select
      value={activeRole}
      onChange={handleChange}
      style={{
        padding: "6px 10px",
        borderRadius: "6px",
        border: "none",
        outline: "none",
        cursor: "pointer",
        fontWeight: "500",
      }}
    >
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
};

export default SwitchRole;