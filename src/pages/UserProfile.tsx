import { useEffect, useState } from "react";
import Swal from "sweetalert2";


const UserProfile = () => {
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `http://localhost:8080/api/user/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        setUser(result.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Handle input change
  const handleChange = (key: string, value: any) => {
    setUser((prev) => ({
      ...prev!,
      [key]: value,
    }));
  };

  // ✅ Update API call
const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      Swal.fire({
        title: "Updating...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await fetch(
        `http://localhost:8080/api/user/profile/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: user?.firstName,
            lastName: user?.lastName,
            contactNumber: user?.contactNumber,
            address: user?.address,
            motivation: user?.motivation,
            reason: user?.reason,
            preferredSessionDuration: user?.preferredSessionDuration,
            bio: user?.bio,
          }),
        }
      );

      const result = await response.json();

      Swal.close();

      if (result.status === "success") {
        setUser(result.data);
        setIsEditing(false);

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Profile updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update profile", "error");
    }
  };


  const fields = [
    ["firstName", "lastName"],
    ["contactNumber", "email"],
    ["address", "bio"],
    ["motivation"],
    ["reason"],
    ["preferredSessionDuration"],
  ];

  const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  if (!user) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div
      style={{
        padding: "30px",
        paddingTop:"40px",
        background: "linear-gradient(135deg, #0f172a, #1e3a8a, #312e81)",
        color: "white",
        borderRadius: "12px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2>User Profile</h2>

        {/* Buttons */}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={btnStyle("#3b82f6")}
          >
            Edit Profile
          </button>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleUpdate} style={btnStyle("#22c55e")}>
              Update
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                fetchUserProfile(); // reset changes
              }}
              style={btnStyle("#ef4444")}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {fields.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: row.length === 2 ? "1fr 1fr" : "1fr",
              gap: "20px",
            }}
          >
            {row.map((key) => (
              <div key={key} style={{ display: "flex", flexDirection: "column" }}>
                <label>{formatLabel(key)}</label>

                {key === "motivation" ||
                key === "reason" ||
                key === "bio" ? (
                  <textarea
                    value={user[key] || ""}
                    disabled={!isEditing}
                    onChange={(e) => handleChange(key, e.target.value)}
                    rows={3}
                    style={inputStyle}
                  />
                ) : (
                  <input
                    type="text"
                    value={user[key] || ""}
                    disabled={!isEditing || key === "email"} // email not editable
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// 🔥 Reusable styles
const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "rgba(255,255,255,0.1)",
  color: "white",
};

const btnStyle = (color: string) => ({
  padding: "8px 16px",
  background: color,
  border: "none",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
});

export default UserProfile;