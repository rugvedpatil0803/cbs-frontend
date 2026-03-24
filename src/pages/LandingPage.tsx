import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                position: "fixed",   // or "absolute" (fixed is better for full screen)
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 3,

                background: "linear-gradient(135deg, #1e3a8a, #6d28d9)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "20px",
                }}
            >
                <button
                    onClick={() => navigate("/login")}
                    style={{
                        background: "#fff",
                        color: "#1e3a8a",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Login
                </button>
            </div>

            {/* Content */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "20px",
                }}
            >
                <div>
                    <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>
                        Welcome to Coach Booking System
                    </h1>

                    <p style={{ fontSize: "18px", opacity: 0.8 }}>
                        Manage bookings, sessions, and users efficiently.
                    </p>

                    <img
                        src="https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
                        alt="diagram"
                        style={{ width: "200px" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;