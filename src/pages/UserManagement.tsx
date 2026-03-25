import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { userByList } from "./../services/userProfileService";

type User = {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
};

type UsersByRole = {
    ADMIN: User[];
    COACH: User[];
    PARTICIPANT: User[];
};

const UserManagement = () => {
    const [users, setUsers] = useState<UsersByRole>({
        ADMIN: [],
        COACH: [],
        PARTICIPANT: [],
    });

    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token || hasFetched.current) return;
        hasFetched.current = true;

        const fetchUsers = async () => {
            try {
                setLoading(true);

                const data = await userByList();
                setUsers(data);
            } catch (err: any) {
                console.error(err);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: typeof err === "string" ? err : "Failed to fetch users",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token]);

    const handleGetProfile = (userId: number) => {
        console.log("Get Profile for:", userId);
    };

    const handleGetHistory = (userId: number) => {
        console.log("Get History for:", userId);
    };

    const renderTable = (
        title: string,
        data: User[],
        showHistory: boolean = false
    ) => {
        const sortedData = [...data].sort((a, b) => a.userId - b.userId);

        return (
            <div style={{ marginBottom: "40px" }}>
                <h2>{title}</h2>

                {sortedData.length === 0 ? (
                    <p style={{ color: "#777" }}>No Users Found</p>
                ) : (
                    <div
                        className="custom-scroll"
                        style={{
                            maxHeight: "350px",
                            overflowY: "auto",
                            borderRadius: "10px",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                background: "rgba(34, 39, 75, 0.85)",
                                color: "#e2e8f0",
                                border: "1px solid rgba(255,255,255,0.1)",
                                textAlign: "center",
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <thead>
                                <tr >
                                    <th style={stickyTh}>UserID</th>
                                    <th style={stickyTh}>First Name</th>
                                    <th style={stickyTh}>Last Name</th>
                                    <th style={stickyTh}>Email ID</th>
                                    <th style={stickyTh}>Status</th>
                                    <th style={stickyTh}>Get Profile</th>
                                    {showHistory && <th style={stickyTh}>Get History</th>}
                                </tr>
                            </thead>

                            <tbody>
                                {sortedData.map((user) => (
                                    <tr
                                        key={user.userId}
                                        style={trStyle}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(124, 58, 237, 0.2)";

                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        <td style={tdStyle}>{user.userId}</td>
                                        <td style={tdStyle}>{user.firstName}</td>
                                        <td style={tdStyle}>{user.lastName}</td>
                                        <td style={tdStyle}>{user.email}</td>
                                        <td style={tdStyle}>
                                            {user.isActive ? "Active" : "Inactive"}
                                        </td>

                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => handleGetProfile(user.userId)}
                                                style={btnStyle}
                                            >
                                                View
                                            </button>
                                        </td>

                                        {showHistory && (
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => handleGetHistory(user.userId)}
                                                    style={btnStyle}
                                                >
                                                    History
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div
                style={{
                    height: "100vh",
                    width: "100%",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    backdropFilter: "blur(8px)",
                    background: "rgba(15, 23, 42, 0.6)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999,
                }}
            >
                <div
                    style={{
                        width: "60px",
                        height: "60px",
                        border: "6px solid rgba(255,255,255,0.2)",
                        borderTop: "6px solid #7c3aed",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        marginBottom: "16px",
                    }}
                />

                <p
                    style={{
                        color: "#e2e8f0",
                        fontSize: "18px",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                    }}
                >
                    Loading Users...
                </p>

                <style>
                    {`
            @keyframes spin {
                to {
                transform: rotate(360deg);
                }
            }
            `}
                </style>
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                .custom-scroll::-webkit-scrollbar {
                width: 6px;
                }

                .custom-scroll::-webkit-scrollbar-track {
                background: transparent;
                }

                .custom-scroll::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px;
                }

                .custom-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(99, 102, 241, 0.6);
                }

                .custom-scroll {
                scrollbar-width: thin;
                scrollbar-color: rgba(0,0,0,0.2) transparent;
                }
            `}
            </style>

            <div style={{ padding: "45px", marginTop: "70px", color: "white" }}>
                <h1>👥 User Management</h1>

                {renderTable("🎯 Participants", users.PARTICIPANT, true)}
                {renderTable("👨‍🏫 Coaches", users.COACH, true)}
                {renderTable("🛠️ Admins", users.ADMIN)}
            </div>
        </>
    );
};


const stickyTh = {
    padding: "14px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    position: "sticky" as const,
    top: 0,
    zIndex: 2,
    background: "#363197",
    fontWeight: 800,
    fontSize: "14px",
    letterSpacing: "0.4px",
    color: "#fff",
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    fontSize: "15px",
    color: "#ffffff",
};

const trStyle = {

};

const btnStyle = {
    padding: "4px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #275094, #4d4fb8)",
    color: "white",
    fontWeight: 600,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)",
};

export default UserManagement;