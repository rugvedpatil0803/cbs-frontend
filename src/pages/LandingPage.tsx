import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    const baseButtonStyle = {
        padding: "10px 18px",
        background: "#fff",
        color: "#1e3a8a",
        borderRadius: "6px",
        border: "none",
        fontWeight: "bold",
        cursor: "pointer",
        marginLeft: "10px",
        transition: "all 0.25s ease",
    };

    const handleHover = (e: any) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
    };

    const handleLeave = (e: any) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
    };

    return (
        <div
            style={{
                position: "fixed",
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
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "20px",
                }}
            >
                <button
                    onClick={() => navigate("/register")}
                    style={baseButtonStyle}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleLeave}
                >
                    Register
                </button>

                <button
                    onClick={() => navigate("/login")}
                    style={baseButtonStyle}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleLeave}
                >
                    Login
                </button>
            </div>

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
                        style={{ width: "200px", marginTop: "20px" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;