import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { userByList, getUserProfile, deactivateUser, getUserBookingHistory } from "./../services/userProfileService";


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
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

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

    const swalDarkTheme = {
        background: "linear-gradient(135deg, #1e293b, #312e81)",
        color: "#ffffff",
    };

    const handleGetProfile = async (userId: any) => {
        try {
            // 🔄 LOADER
            Swal.fire({
                title: "Fetching Profile...",
                text: "Please wait",
                allowOutsideClick: false,
                ...swalDarkTheme,
                didOpen: () => Swal.showLoading(),
            });

            const profile = await getUserProfile(userId);

            Swal.close();

            // 👉 Find current status from list
            const allUsers = [
                ...users.ADMIN,
                ...users.COACH,
                ...users.PARTICIPANT,
            ];
            const currentUser = allUsers.find(u => u.userId === userId);

            const isActive = currentUser?.isActive;

            const result = await Swal.fire({
                title: "👤 User Profile",
                html: `
                <div style="text-align:left; font-size:14px">
                    <p><b>User ID:</b> ${profile.userId}</p>
                    <p><b>Name:</b> ${profile.firstName} ${profile.lastName}</p>
                    <p><b>Email:</b> ${profile.email}</p>
                    <p><b>Contact:</b> ${profile.contactNumber || "-"}</p>
                    <p><b>Address:</b> ${profile.address || "-"}</p>
                    <p><b>Address:</b> ${profile.bio || "-"}</p>
                    <p><b>Address:</b> ${profile.motivation || "-"}</p>
                    <p><b>Address:</b> ${profile.reason || "-"}</p>
                    <p><b>Address:</b> ${profile.preferredSessionDuration || "-"}</p>
                    <p><b>Status:</b> ${isActive ? "Active" : "Inactive"}</p>
                </div>
            `,
                showCancelButton: true,
                confirmButtonText: isActive ? "Deactivate" : "Activate",
                cancelButtonText: "Close",
                confirmButtonColor: isActive ? "#e11d48" : "#22c55e", // red / green
                width: "500px",
                ...swalDarkTheme,
            });

            if (result.isConfirmed) {

                // ⚠️ Confirmation
                const confirm = await Swal.fire({
                    title: `Are you sure?`,
                    text: `User will be ${isActive ? "deactivated" : "activated"}`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: `Yes, ${isActive ? "Deactivate" : "Activate"}`,
                    cancelButtonText: "Cancel",
                    confirmButtonColor: isActive ? "#e11d48" : "#22c55e",
                    ...swalDarkTheme,
                });

                if (!confirm.isConfirmed) return;

                // 🔄 Loader
                Swal.fire({
                    title: isActive ? "Deactivating..." : "Activating...",
                    allowOutsideClick: false,
                    ...swalDarkTheme,
                    didOpen: () => Swal.showLoading(),
                });

                // 👉 SAME API
                await deactivateUser(userId);

                Swal.fire({
                    title: "Success",
                    text: `User ${isActive ? "deactivated" : "activated"} successfully`,
                    icon: "success",
                    ...swalDarkTheme,
                });

                // 🔄 Refresh list
                hasFetched.current = false;
                const data = await userByList();
                setUsers(data);
            }

        } catch (err: any) {
            Swal.close();
            Swal.fire({
                title: "Error",
                text: err || "Something went wrong",
                icon: "error",
                ...swalDarkTheme,
            });
        }
    };

    const handleGetHistory = async (userId: number) => {
        try {
            setHistoryLoading(true);
            setHistoryOpen(true);

            const bookings = await getUserBookingHistory(userId);

            setHistoryData(bookings || []);
        } catch (err: any) {
            Swal.fire("Error", err, "error"); // keep only error swal
        } finally {
            setHistoryLoading(false);
        }
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
                                            <span
                                                style={{
                                                    padding: "4px 10px",
                                                    borderRadius: "20px",
                                                    fontWeight: 600,
                                                    fontSize: "13px",
                                                    color: "#fff",
                                                    background: user.isActive
                                                        ? "linear-gradient(135deg, #0f7033, #105228)"   // green
                                                        : "linear-gradient(135deg, #a01919, #972828)", // red
                                                    boxShadow: user.isActive
                                                        ? "0 2px 8px rgba(34,197,94,0.4)"
                                                        : "0 2px 8px rgba(239,68,68,0.4)",
                                                }}
                                            >
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
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
            {historyOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{
                            width: "90%",
                            maxWidth: "1000px",
                            maxHeight: "80vh",
                            background: "linear-gradient(135deg, #1e293b, #312e81)",
                            borderRadius: "12px",
                            padding: "20px",
                            overflow: "hidden",
                            color: "#fff",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                            <h2>📚 Booking History</h2>
                            <button
                                onClick={() => setHistoryOpen(false)}
                                style={{
                                    background: "red",
                                    border: "none",
                                    color: "#fff",
                                    padding: "5px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    height: "30px"
                                }}
                            >
                                Close
                            </button>
                        </div>

                        {historyLoading ? (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "40px",
                                    gap: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        border: "5px solid rgba(255,255,255,0.2)",
                                        borderTop: "5px solid #7c3aed",
                                        borderRadius: "50%",
                                        animation: "spin 1s linear infinite",
                                    }}
                                />

                                <p style={{ color: "#e2e8f0", fontWeight: 500 }}>
                                    Loading history...
                                </p>

                                <style>
                                    {`
                                        @keyframes spin {
                                            0% { transform: rotate(0deg); }
                                            100% { transform: rotate(360deg); }
                                        }
                                    `}
                                </style>
                            </div>
                        ) : historyData.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px" }}>
                                No Data found
                            </div>
                        ) : (
                            <div
                                style={{
                                    maxHeight: "60vh",
                                    overflowY: "auto",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(15, 23, 42, 0.65)",
                                    backdropFilter: "blur(10px)",
                                }}
                            >
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        textAlign: "center",
                                        color: "#e2e8f0",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={stickyTh}>Booking ID</th>
                                            <th style={stickyTh}>Booking Time</th>
                                            <th style={stickyTh}>Session Name</th>
                                            <th style={stickyTh}>Start</th>
                                            <th style={stickyTh}>End</th>
                                            <th style={stickyTh}>Coach</th>
                                            <th style={stickyTh}>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {historyData.map((b, index) => (
                                            <tr
                                                key={b.bookingId}
                                                style={{
                                                    background:
                                                        index % 2 === 0
                                                            ? "rgba(99,102,241,0.08)"
                                                            : "transparent",
                                                    transition: "all 0.2s ease",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background =
                                                        "rgba(124,58,237,0.25)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background =
                                                        index % 2 === 0
                                                            ? "rgba(99,102,241,0.08)"
                                                            : "transparent";
                                                }}
                                            >
                                                <td style={tdStyle}>{b.bookingId}</td>
                                                <td style={tdStyle}>{b.bookingTime}</td>
                                                <td style={tdStyle}>{b.sessionName}</td>
                                                <td style={tdStyle}>
                                                    {b.startDay} <br /> {b.startTime}
                                                </td>
                                                <td style={tdStyle}>
                                                    {b.endDay} <br /> {b.endTime}
                                                </td>
                                                <td style={tdStyle}>{b.coachName}</td>
                                                <td style={tdStyle}>
                                                    <span
                                                        style={{
                                                            padding: "4px 10px",
                                                            borderRadius: "20px",
                                                            fontWeight: 600,
                                                            fontSize: "13px",
                                                            color: "#fff",
                                                            background: b.isActive
                                                                ? "linear-gradient(135deg, #16a34a, #15803d)"
                                                                : "linear-gradient(135deg, #dc2626, #991b1b)",
                                                            boxShadow: b.isActive
                                                                ? "0 2px 8px rgba(34,197,94,0.4)"
                                                                : "0 2px 8px rgba(239,68,68,0.4)",
                                                        }}
                                                    >
                                                        {b.isActive ? "Enrolled" : "Unrolled"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
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

// const stickyTh = {
//     padding: "14px",
//     position: "sticky" as const,
//     top: 0,
//     zIndex: 5,
//     background: "linear-gradient(135deg, #4338ca, #312e81)",
//     borderBottom: "1px solid rgba(255,255,255,0.2)",
//     fontWeight: 700,
//     fontSize: "14px",
// };

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