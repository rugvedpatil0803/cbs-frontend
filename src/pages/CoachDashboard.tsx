import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import {
    myAllSessions,
    getSessionDetails,
    createSession,
    updateSession,
    deleteSession,
} from "../services/coachDashboardService";

type SessionItem = {
    sessionId: number;
    name: string;
    description: string;
    coachName: string;
    startDay: string;
    endDay: string;
    startTime: string;
    endTime: string;
    maxSeat: number;
    occupiedSeats: number;
    noOfSeats?: number;
};

type Participant = {
    bookingId: number;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    address: string;
};

type CreateFormData = {
    name: string;
    description: string;
    startDay: string;
    endDay: string;
    startTime: string;
    endTime: string;
    noOfSeats: number;
};


const CoachDashboard = () => {
    const [upcoming, setUpcoming] = useState<SessionItem[]>([]);
    const [ongoing, setOngoing] = useState<SessionItem[]>([]);
    const [completed, setCompleted] = useState<SessionItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalData, setModalData] = useState<SessionItem[]>([]);
    const [modalTitle, setModalTitle] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState<string>("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

    const [formData, setFormData] = useState<CreateFormData>({
        name: "",
        description: "",
        startDay: "",
        endDay: "",
        startTime: "",
        endTime: "",
        noOfSeats: 1,
    });

    const [editFormData, setEditFormData] = useState({
        name: "",
        description: "",
        startDay: "",
        endDay: "",
        startTime: "",
        endTime: "",
        noOfSeats: 1,
    });

    const hasFetched = useRef(false);

    const getTodayDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const getTimeHHMM = (date: Date) => date.toTimeString().slice(0, 5);

    const addHours = (date: Date, hours: number) => {
        const copy = new Date(date);
        copy.setHours(copy.getHours() + hours);
        return copy;
    };

    const getStartTimeMin = () => {
        const today = getTodayDate();
        if (formData.startDay === today) {
            return getTimeHHMM(addHours(new Date(), 1));
        }
        return "00:00";
    };

    const getEndDayMin = () => {
        return formData.startDay || getTodayDate();
    };

    const getEndTimeMin = () => {
        if (formData.startDay && formData.endDay && formData.startDay === formData.endDay) {
            const [h, m] = (formData.startTime || "00:00").split(":").map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            d.setHours(d.getHours() + 1);
            return getTimeHHMM(d);
        }
        return "00:00";
    };

    const refreshSessions = async () => {
        const res = await myAllSessions();
        setUpcoming(res?.upcoming || []);
        setOngoing(res?.ongoing || []);
        setCompleted(res?.completed || []);
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchSessions = async () => {
            try {
                setLoading(true);
                await refreshSessions();
            } catch (err) {
                console.error(err);
                Swal.fire("Error", "Failed to load sessions", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(`${dateStr}T00:00:00`);
        return date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const openCreateModal = () => {
        const today = getTodayDate();
        const start = addHours(new Date(), 1);
        const end = addHours(new Date(), 2);

        setFormData({
            name: "",
            description: "",
            startDay: today,
            endDay: today,
            startTime: getTimeHHMM(start),
            endTime: getTimeHHMM(end),
            noOfSeats: 1,
        });

        setShowCreateModal(true);
    };

    const handleCreateSession = async () => {
        const {
            name,
            description,
            startDay,
            endDay,
            startTime,
            endTime,
            noOfSeats,
        } = formData;

        if (
            !name.trim() ||
            !description.trim() ||
            !startDay ||
            !endDay ||
            !startTime ||
            !endTime
        ) {
            Swal.fire("Validation Error", "All fields are required", "warning");
            return;
        }

        if (noOfSeats < 1) {
            Swal.fire("Validation Error", "Minimum 1 seat required", "warning");
            return;
        }

        const today = getTodayDate();
        if (startDay < today) {
            Swal.fire("Validation Error", "Start day cannot be in the past", "warning");
            return;
        }

        if (endDay < startDay) {
            Swal.fire("Validation Error", "End day cannot be before start day", "warning");
            return;
        }

        const nowPlusOneHour = addHours(new Date(), 1);
        const selectedStart = new Date(`${startDay}T${startTime}`);
        if (startDay === today && selectedStart < nowPlusOneHour) {
            Swal.fire("Validation Error", "Start time must be at least 1 hour from now", "warning");
            return;
        }

        if (startDay === endDay && startTime >= endTime) {
            Swal.fire("Validation Error", "End time must be after start time", "warning");
            return;
        }

        try {
            Swal.fire({
                title: "Creating...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await createSession(formData);
            Swal.close();

            if (res?.status === "success") {
                Swal.fire("Success", "Session created!", "success");
                setShowCreateModal(false);

                setFormData({
                    name: "",
                    description: "",
                    startDay: "",
                    endDay: "",
                    startTime: "",
                    endTime: "",
                    noOfSeats: 1,
                });

                await refreshSessions();
            } else {
                Swal.fire("Error", res?.message || "Failed", "error");
            }
        } catch (err: any) {
            Swal.close();
            Swal.fire(
                "Error",
                err?.response?.data?.message || "Something went wrong",
                "error"
            );
        }
    };

    const handleViewParticipants = async (sessionId: number, name: string) => {
        try {
            Swal.fire({
                title: "Loading...",
                text: "Fetching participants",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const data = await getSessionDetails(sessionId);
            Swal.close();

            setParticipants(data?.participants || []);
            setSelectedSession(name);
            setShowParticipantsModal(true);
        } catch (err: any) {
            console.error(err);
            Swal.close();
            Swal.fire("Error", "Failed to load session details", "error");
        }
    };

    const openEditModal = (session: SessionItem) => {
        setSelectedSessionId(session.sessionId);

        setEditFormData({
            name: session.name,
            description: session.description,
            startDay: session.startDay,
            endDay: session.endDay,
            startTime: session.startTime,
            endTime: session.endTime,
            noOfSeats: session.maxSeat,
        });

        setShowEditModal(true);
    };

    const handleUpdateSession = async () => {
        if (!selectedSessionId) return;

        const {
            name,
            description,
            startDay,
            endDay,
            startTime,
            endTime,
            noOfSeats,
        } = editFormData;

        // 🔴 Validation same as create
        if (
            !name.trim() ||
            !description.trim() ||
            !startDay ||
            !endDay ||
            !startTime ||
            !endTime
        ) {
            Swal.fire("Validation Error", "All fields are required", "warning");
            return;
        }

        if (noOfSeats < 1) {
            Swal.fire("Validation Error", "Minimum 1 seat required", "warning");
            return;
        }

        try {
            const confirm = await Swal.fire({
                title: "Update session?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Update",
            });

            if (!confirm.isConfirmed) return;

            Swal.fire({
                title: "Updating...",
                didOpen: () => Swal.showLoading(),
                allowOutsideClick: false,
            });

            const res = await updateSession(selectedSessionId, editFormData);

            Swal.close();

            if (res?.status === "success") {
                Swal.fire("Success", "Session updated!", "success");

                setShowEditModal(false);
                await refreshSessions();
            } else {
                Swal.fire("Error", res?.message || "Failed", "error");
            }
        } catch (err: any) {
            Swal.close();
            Swal.fire(
                "Error",
                err?.response?.data?.message || "Something went wrong",
                "error"
            );
        }
    };

    const handleDeleteSession = async () => {
        if (selectedSessionId === null) {
            Swal.fire("Error", "No session selected", "error");
            return;
        }

        try {
            const result = await Swal.fire({
                title: "Delete session?",
                text: "This action cannot be undone",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#dc2626",
                cancelButtonColor: "#334155",
            });

            if (!result.isConfirmed) return;

            Swal.fire({
                title: "Deleting...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await deleteSession(selectedSessionId);
            Swal.close();

            if (res?.status === "success") {
                Swal.fire("Deleted", "Session deleted successfully", "success");
                setShowEditModal(false);
                setSelectedSessionId(null);
                await refreshSessions();
            } else {
                Swal.fire("Error", res?.message || "Delete failed", "error");
            }
        } catch (err: any) {
            Swal.close();
            Swal.fire(
                "Error",
                err?.response?.data?.message || "Something went wrong",
                "error"
            );
        }
    };

    const openModal = (title: string, data: SessionItem[]) => {
        setModalTitle(title);
        setModalData(data);
        setShowModal(true);
    };

    const renderRow = (title: string, data: SessionItem[]) => (
        <div style={{ marginBottom: "30px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                    gap: "12px",
                }}
            >
                <h2 style={{ margin: 0 }}>{title}</h2>

                <button
                    onClick={() => openModal(title, data)}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#6366f1",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    Show All
                </button>
            </div>

            <div style={{ display: "flex", gap: "15px", overflowX: "auto", paddingBottom: "10px" }}>
                {data.length === 0 ? (
                    <p style={{ color: "#94a3b8" }}>No sessions</p>
                ) : (
                    data.slice(0, 10).map((session) => (
                        <div
                            key={session.sessionId}
                            style={{
                                minWidth: "280px",
                                background: "linear-gradient(135deg, #1e293b, #0f172a)",
                                color: "white",
                                padding: "16px",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>{session.name}</h3>
                            <p>{session.description}</p>

                            <p>👨‍🏫 {session.coachName}</p>
                            <p>
                                📅 {formatDate(session.startDay)} → {formatDate(session.endDay)}
                            </p>
                            <p>
                                ⏰ {session.startTime} - {session.endTime}
                            </p>
                            <p>
                                👥 {session.occupiedSeats} / {session.maxSeat}
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "14px",
                                }}
                            >
                                <button
                                    onClick={() =>
                                        handleViewParticipants(session.sessionId, session.name)
                                    }
                                    style={{
                                        flex: 1,
                                        padding: "8px 10px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                        color: "white",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                >
                                    View Participants
                                </button>

                                {!title.includes("Completed") && (
                                    <button
                                        onClick={() => openEditModal(session)}
                                        style={{
                                            flex: 1,
                                            padding: "8px 10px",
                                            borderRadius: "8px",
                                            border: "none",
                                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                            color: "white",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

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
                    Loading Coach Dashboard...
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

    const today = getTodayDate();

    return (
        <div style={{ padding: "20px", marginTop: "70px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <h1 style={{ margin: 0 }}>🏋️ Coach Dashboard</h1>

                <button
                    onClick={openCreateModal}
                    style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        color: "white",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: "0 6px 16px rgba(34,197,94,0.35)",
                    }}
                >
                    + Create Session
                </button>
            </div>

            {renderRow("🚀 Upcoming Sessions", upcoming)}
            {renderRow("🔥 Ongoing Sessions", ongoing)}
            {renderRow("✅ Completed Sessions", completed)}

            {showModal && (
                <div
                    onClick={() => setShowModal(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "80%",
                            maxHeight: "80%",
                            overflowY: "auto",
                            background: "#1e293b",
                            padding: "20px",
                            borderRadius: "12px",
                            color: "white",
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>{modalTitle}</h2>

                        {modalData.length === 0 ? (
                            <p>No sessions</p>
                        ) : (
                            modalData.map((session) => (
                                <div
                                    key={session.sessionId}
                                    style={{
                                        marginBottom: "10px",
                                        padding: "12px",
                                        background: "#0f172a",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <h3>{session.name}</h3>
                                    <p>👥 {session.occupiedSeats}/{session.maxSeat} booked</p>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            marginTop: "12px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                handleViewParticipants(session.sessionId, session.name)
                                            }
                                            style={{
                                                padding: "8px 12px",
                                                borderRadius: "8px",
                                                border: "none",
                                                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                                color: "white",
                                                fontWeight: 700,
                                                cursor: "pointer",
                                            }}
                                        >
                                            View Participants
                                        </button>

                                        <button
                                            onClick={() => openEditModal(session)}
                                            style={{
                                                padding: "8px 12px",
                                                borderRadius: "8px",
                                                border: "none",
                                                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                                color: "white",
                                                fontWeight: 700,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {showParticipantsModal && (
                <div
                    onClick={() => setShowParticipantsModal(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 2000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "90%",
                            maxWidth: "900px",
                            maxHeight: "80%",
                            overflowY: "auto",
                            background: "#0f172a",
                            padding: "20px",
                            borderRadius: "12px",
                            color: "white",
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>Participants - {selectedSession}</h2>

                        {participants.length === 0 ? (
                            <p>No participants</p>
                        ) : (
                            participants.map((p) => (
                                <div
                                    key={p.bookingId}
                                    style={{
                                        padding: "12px",
                                        marginBottom: "10px",
                                        background: "#1e293b",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <h3>
                                        {p.firstName} {p.lastName}
                                    </h3>
                                    <p>📧 {p.email}</p>
                                    <p>📞 {p.contactNumber}</p>
                                    <p>📍 {p.address}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div
                    onClick={() => setShowCreateModal(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 3,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "420px",
                            background: "#0f172a",
                            borderRadius: "16px",
                            color: "white",
                            padding: "24px",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <h2 style={{ marginBottom: "16px" }}>Create Session</h2>

                        <div style={{ marginBottom: "14px" }}>
                            <label>Name <span style={{ color: "red" }}>*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                style={{
                                    width: "95%",
                                    marginTop: "6px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #334155",
                                    background: "#020617",
                                    color: "white",
                                    outline: "none",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label>Description <span style={{ color: "red" }}>*</span></label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                style={{
                                    width: "95%",
                                    marginTop: "6px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #334155",
                                    background: "#020617",
                                    color: "white",
                                    outline: "none",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label>Start Day <span style={{ color: "red" }}>*</span></label>
                            <input
                                type="date"
                                min={today}
                                value={formData.startDay}
                                onChange={(e) =>
                                    setFormData({ ...formData, startDay: e.target.value })
                                }
                                style={{
                                    width: "95%",
                                    marginTop: "6px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #334155",
                                    background: "#020617",
                                    color: "white",
                                    outline: "none",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label>End Day <span style={{ color: "red" }}>*</span></label>
                            <input
                                type="date"
                                min={getEndDayMin()}
                                value={formData.endDay}
                                onChange={(e) =>
                                    setFormData({ ...formData, endDay: e.target.value })
                                }
                                style={{
                                    width: "95%",
                                    marginTop: "6px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #334155",
                                    background: "#020617",
                                    color: "white",
                                    outline: "none",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label>Start Time <span style={{ color: "red" }}>*</span></label>
                            <input
                                type="time"
                                min={getStartTimeMin()}
                                value={formData.startTime}
                                onChange={(e) =>
                                    setFormData({ ...formData, startTime: e.target.value })
                                }
                                style={{
                                    width: "95%",
                                    marginTop: "6px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #334155",
                                    background: "#020617",
                                    color: "white",
                                    outline: "none",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label>End Time <span style={{ color: "red" }}>*</span></label>
                            <input
                                type="time"
                                min={getEndTimeMin()}
                                value={formData.endTime}
                                onChange={(e) =>
                                    setFormData({ ...formData, endTime: e.target.value })
                                }
                                style={{
                                    width: "95%",
                                    marginTop: "6px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #334155",
                                    background: "#020617",
                                    color: "white",
                                    outline: "none",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label>Seats <span style={{ color: "red" }}>*</span></label>
                            <input
                                type="number"
                                min={1}
                                value={formData.noOfSeats}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        noOfSeats: Math.max(1, Number(e.target.value)),
                                    })
                                }
                                style={{
                                    width: "95%",
                                    marginTop: "6px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #334155",
                                    background: "#020617",
                                    color: "white",
                                    outline: "none",
                                }}
                            />
                        </div>

                        <div
                            style={{
                                marginTop: "18px",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "10px",
                            }}
                        >
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "#334155",
                                    color: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreateSession}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                    color: "white",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div
                    onClick={() => setShowEditModal(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 3,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "420px",
                            background: "#0f172a",
                            borderRadius: "16px",
                            color: "white",
                            padding: "24px",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <h2 style={{ marginBottom: "16px" }}>Edit Session</h2>

                        {[
                            { label: "Name", key: "name" },
                            { label: "Description", key: "description" },
                            { label: "Start Day", key: "startDay", type: "date" },
                            { label: "End Day", key: "endDay", type: "date" },
                            { label: "Start Time", key: "startTime", type: "time" },
                            { label: "End Time", key: "endTime", type: "time" },
                            { label: "Seats", key: "noOfSeats", type: "number" },
                        ].map((field) => {
                            const today = new Date().toISOString().split("T")[0];

                            const minStartTime =
                                editFormData.startDay === today
                                    ? new Date(Date.now() + 60 * 60 * 1000)
                                        .toTimeString()
                                        .slice(0, 5)
                                    : "00:00";

                            const minEndDay = editFormData.startDay || today;

                            let minEndTime = "00:00";
                            if (
                                editFormData.startDay &&
                                editFormData.endDay &&
                                editFormData.startDay === editFormData.endDay
                            ) {
                                const start = new Date(
                                    `2000-01-01T${editFormData.startTime || "00:00"}`
                                );
                                start.setHours(start.getHours() + 1);
                                minEndTime = start.toTimeString().slice(0, 5);
                            }

                            return (
                                <div key={field.key} style={{ marginBottom: "14px" }}>
                                    <label>
                                        {field.label} <span style={{ color: "red" }}>*</span>
                                    </label>

                                    <input
                                        type={field.type || "text"}
                                        min={
                                            field.key === "startDay"
                                                ? today
                                                : field.key === "endDay"
                                                    ? minEndDay
                                                    : field.key === "startTime"
                                                        ? minStartTime
                                                        : field.key === "endTime"
                                                            ? minEndTime
                                                            : field.key === "noOfSeats"
                                                                ? 1
                                                                : undefined
                                        }
                                        value={(editFormData as any)[field.key]}
                                        onChange={(e) =>
                                            setEditFormData({
                                                ...editFormData,
                                                [field.key]:
                                                    field.key === "noOfSeats"
                                                        ? Math.max(1, Number(e.target.value))
                                                        : e.target.value,
                                            })
                                        }
                                        style={{
                                            width: "96%",
                                            marginTop: "6px",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid #334155",
                                            background: "#020617",
                                            color: "white",
                                            outline: "none",
                                        }}
                                    />
                                </div>
                            );
                        })}

                        {/* BUTTONS */}
                        <div
                            style={{
                                marginTop: "18px",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "10px",
                            }}
                        >
                            <button
                                onClick={() => setShowEditModal(false)}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "#334155",
                                    color: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteSession}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                    color: "white",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Delete
                            </button>

                            <button
                                onClick={handleUpdateSession}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background:
                                        "linear-gradient(135deg, #22c55e, #16a34a)",
                                    color: "white",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachDashboard;