import { useState } from "react";

const UserProfile = () => {
  const [user, setUser] = useState({
    firstName: "Sanjay",
    lastName: "Sharma",
    email: "Sanjay@gmail.com",
    password: "Password@123",
    contactNumber: "9876543210",
    address: "Pune",
    motivation: "Want guidance",
    reason: "Career growth",
    preferredSessionDuration: 60,
    bio: "",
  });

  return (
    <div
      style={{
        minHeight: "200px",
        padding: "30px",
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

        {/* 👤 Profile Circle */}
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {user.firstName.charAt(0)}
        </div>
      </div>

      {/* Form */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        {Object.keys(user).map((key) => (
          <div key={key} style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "6px", fontSize: "14px" }}>
              {key}
            </label>

            <input
              type={key === "password" ? "password" : "text"}
              value={user[key as keyof typeof user]}
              readOnly
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                outline: "none",
                background: "rgba(255,255,255,0.1)",
                color: "white",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;