import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import {
    fetchUpcoming,
    fetchOngoing,
    fetchCompleted,
    fetchBookings,
    fetchMyFeedbacks,
    createBooking,
    unenrollBooking,
    createFeedback
} from "../services/dashboardService";


type SessionItem = {
    sessionId: number;
    name: string;
    description: string;
    coachName: string;
    startDay: string;
    endDay: string;
    startTime: string;
    endTime: string;
    availableSeats: number;
    maxSeat: number;
};

type BookingItem = {
    bookingId: number;
    bookingTime: string;
    sessionId: number;
    sessionName: string;
    sessionDescription: string;
    startDay: string;
    endDay: string;
    startTime: string;
    endTime: string;
    metaData: string;
    coachId: number;
    coachName: string;
    participantId: number;
    participantName: string;
};

type FeedbackItem = {
    feedbackId: number;
    sessionId: number;
    rating: number;
    feedbackDesc: string;
};

const ParticipantDashboard = () => {
    const [myFeedbacks, setMyFeedbacks] = useState<FeedbackItem[]>([]);
    const [upcoming, setUpcoming] = useState<SessionItem[]>([]);
    const [ongoing, setOngoing] = useState<SessionItem[]>([]);
    const [completed, setCompleted] = useState<SessionItem[]>([]);

    const [enrolledSessionIds, setEnrolledSessionIds] = useState<number[]>([]);

    const [modalData, setModalData] = useState<SessionItem[]>([]);
    const [modalTitle, setModalTitle] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
    const [myEnrollments, setMyEnrollments] = useState<BookingItem[]>([]);
    const [unrolledBookingIds, setUnrolledBookingIds] = useState<number[]>([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [rating, setRating] = useState(0);
    const [feedbackDesc, setFeedbackDesc] = useState("");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    const hasFetched = useRef(false);
    useEffect(() => {
        if (!token || hasFetched.current) return;

        hasFetched.current = true;

        const fetchAll = async () => {
            try {
                setLoading(true);

                const [upcomingData, ongoingData, completedData, bookingsData] =
                    await Promise.all([
                        fetchUpcoming(),
                        fetchOngoing(),
                        fetchCompleted(),
                        fetchBookings(),
                    ]);

                setUpcoming(upcomingData);
                setOngoing(ongoingData);
                setCompleted(completedData);

                const enrolledIds =
                    bookingsData?.map((b: BookingItem) => b.sessionId) || [];

                setEnrolledSessionIds(enrolledIds);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [token]);


    const getBookingStatus = (booking: BookingItem) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = parseDateOnly(booking.startDay);
        const end = parseDateOnly(booking.endDay);

        if (today < start) return "Upcoming";
        if (today > end) return "Completed";
        return "Ongoing";
    };

    const fetchMyEnrollments = async () => {
        try {
            setLoadingEnrollments(true);

            Swal.fire({
                title: "Loading...",
                text: "Fetching your enrollments",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // ✅ Use service functions (axios + interceptor)
            const [bookings, feedbacks] = await Promise.all([
                fetchBookings(),
                fetchMyFeedbacks(),
            ]);

            // ✅ Directly set data (already cleaned in service)
            setMyEnrollments(bookings);
            setMyFeedbacks(feedbacks);

            setShowEnrollmentsModal(true);

            Swal.close();

        } catch (error) {
            console.error("Error fetching enrollments:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "❌ Failed to fetch enrollments",
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setLoadingEnrollments(false);
        }
    };

    const handleEnroll = async (sessionId: number) => {
        try {
            Swal.fire({
                title: "Enrolling...",
                text: "Please wait",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const data = await createBooking(sessionId);

            Swal.close();

            if (data?.status === "success") {
                setEnrolledSessionIds((prev) => [...prev, sessionId]);

                Swal.fire({
                    icon: "success",
                    title: "Enrolled!",
                    text: "You have successfully enrolled",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text: data?.message || "Enrollment failed",
                });
            }

        } catch (err: any) {
            console.error(err);

            Swal.close();

            Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.response?.data?.message || "Something went wrong",
            });
        }
    };

    const handleUnenroll = async (booking: BookingItem) => {
        try {
            // 🟡 Confirmation
            const confirm = await Swal.fire({
                title: "Are you sure?",
                text: "You want to unenroll from this session",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ef4444",
                cancelButtonColor: "#334155",
                confirmButtonText: "Yes, Unenroll",
            });

            if (!confirm.isConfirmed) return;

            // 🔵 Loader
            Swal.fire({
                title: "Unenrolling...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            // ✅ Call service
            const data = await unenrollBooking(booking.sessionId);

            Swal.close();

            if (data?.status === "success") {
                // ✅ Update UI state
                setUnrolledBookingIds((prev) => [...prev, booking.bookingId]);

                setEnrolledSessionIds((prev) =>
                    prev.filter((id) => id !== booking.sessionId)
                );

                // ✅ Success toast
                Swal.fire({
                    icon: "success",
                    title: "Unenrolled",
                    text: "You have been removed from session",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text: data?.message || "Unenroll failed",
                });
            }

        } catch (err: any) {
            console.error(err);

            Swal.close();

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    err?.response?.data?.message ||
                    "Something went wrong while unenrolling",
            });
        }
    };

    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
        setSelectedSessionId(null);
        setRating(0);
        setFeedbackDesc("");
    };

    const handleSubmitFeedback = async () => {
        if (selectedSessionId === null) {
            alert("❌ Please select a session first");
            return;
        }

        try {
            const data = await createFeedback(
                selectedSessionId,
                rating,
                feedbackDesc
            );

            if (data?.status === "success") {
                alert("✅ Feedback submitted!");

                // ✅ Update UI
                setMyFeedbacks((prev) => [
                    ...prev,
                    {
                        feedbackId: Date.now(), // temp id
                        sessionId: selectedSessionId,
                        rating,
                        feedbackDesc,
                    },
                ]);

                closeFeedbackModal();
            } else {
                alert("❌ " + (data?.message || "Failed to submit feedback"));
            }

        } catch (err: any) {
            console.error(err);

            alert(
                "❌ " +
                (err?.response?.data?.message || "Failed to submit feedback")
            );
        }
    };

    const renderRow = (title: string, data: SessionItem[]) => (
        <div style={{ marginBottom: "30px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                }}
            >
                <h2>{title}</h2>

                <button
                    onClick={() => openModal(title, data)}
                    style={{
                        padding: "5px 12px",
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

            {data.length === 0 ? (
                <p style={{ color: "#777" }}>No Sessions For Now</p>
            ) : (
                <div
                    style={{
                        display: "flex",
                        gap: "15px",
                        overflowX: "auto",
                        paddingBottom: "10px",
                    }}
                >
                    {data.slice(0, 10).map((session) => {
                        const isCompleted = title.includes("Completed");
                        const isEnrolled = enrolledSessionIds.includes(session.sessionId);
                        const isFull = session.availableSeats === 0;

                        return (
                            <div
                                key={session.sessionId}
                                style={{
                                    minWidth: "280px",
                                    background: "linear-gradient(135deg, #1e293b, #0f172a)",
                                    color: "white",
                                    padding: "16px",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow =
                                        "0 0 0 2px #a855f7, 0 0 15px #a855f7";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow =
                                        "0 4px 12px rgba(0,0,0,0.3)";
                                }}
                            >
                                <h3>{session.name}</h3>
                                <p style={{ fontSize: "13px", color: "#cbd5f5" }}>
                                    {session.description}
                                </p>

                                <div style={{ marginTop: "10px", fontSize: "13px" }}>
                                    <p>👨‍🏫 {session.coachName}</p>
                                    <p>
                                        📅 {formatDate(session.startDay)} → {formatDate(session.endDay)}
                                    </p>
                                    <p>
                                        ⏰ {session.startTime} - {session.endTime}
                                    </p>
                                </div>

                                {!isCompleted && (
                                    <div style={{ marginTop: "10px", fontSize: "13px" }}>
                                        <p>🎟 Total: {session.maxSeat}</p>
                                        <p>✅ Available: {session.availableSeats}</p>
                                    </div>
                                )}

                                {!isCompleted && (
                                    <button
                                        disabled={isFull || isEnrolled}
                                        onClick={() => handleEnroll(session.sessionId)}
                                        style={{
                                            marginTop: "12px",
                                            width: "30%",
                                            padding: "8px",
                                            borderRadius: "8px",
                                            border: "none",
                                            background: isEnrolled
                                                ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                                                : isFull
                                                    ? "#64748b"
                                                    : "linear-gradient(135deg, #22c55e, #16a34a)",
                                            color: "white",
                                            fontWeight: "600",
                                            cursor: isFull || isEnrolled ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        {isEnrolled ? "Enrolled" : isFull ? "Full" : "Enroll"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );



    const statusBadgeStyle = (status: string) => {
        if (status === "Upcoming") {
            return {
                background: "#1d4ed8",
                color: "white",
            };
        }
        if (status === "Ongoing") {
            return {
                background: "#16a34a",
                color: "white",
            };
        }
        if (status === "Completed") {
            return {
                background: "#475569",
                color: "white",
            };
        }
        return {
            background: "#7c3aed",
            color: "white",
        };
    };

    const openModal = (title: string, data: SessionItem[]) => {
        setModalTitle(title);
        setModalData(data);
        setShowModal(true);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(`${dateStr}T00:00:00`);
        return date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const parseDateOnly = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
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
                    background: "rgba(15, 23, 42, 0.6)", // glass effect
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999,
                }}
            >
                {/* Spinner */}
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

                {/* Text */}
                <p
                    style={{
                        color: "#e2e8f0",
                        fontSize: "18px",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                    }}
                >
                    Loading Dashboard...
                </p>

                {/* Animation */}
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
        <div style={{ padding: "20px", marginTop: "70px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                }}
            >
                <h1 style={{ margin: 0 }}>🎯 Participant Dashboard</h1>

                <button
                    onClick={fetchMyEnrollments}
                    disabled={loadingEnrollments}
                    style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        color: "white",
                        fontWeight: "700",
                        cursor: loadingEnrollments ? "wait" : "pointer",
                        boxShadow: "0 6px 16px rgba(79, 70, 229, 0.35)",
                    }}
                >
                    {loadingEnrollments ? "Loading..." : "My Enrollments"}
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
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
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
                            width: "80%",
                            maxHeight: "80%",
                            overflowY: "auto",
                            background: "#1e293b",
                            padding: "20px",
                            borderRadius: "12px",
                            color: "white",
                        }}
                    >
                        <h2 style={{ marginBottom: "15px" }}>{modalTitle}</h2>

                        {modalData.length === 0 ? (
                            <p style={{ color: "#cbd5e1" }}>No Sessions For Now</p>
                        ) : (
                            modalData.map((session) => {
                                const isCompleted = modalTitle.includes("Completed");
                                const isEnrolled = enrolledSessionIds.includes(session.sessionId);
                                const isFull = session.availableSeats === 0;

                                return (
                                    <div
                                        key={session.sessionId}
                                        style={{
                                            padding: "12px",
                                            marginBottom: "10px",
                                            background: "#0f172a",
                                            borderRadius: "8px",
                                            transition: "all 0.3s ease",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow =
                                                "0 0 0 2px #a855f7, 0 0 15px #a855f7";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <h3>{session.name}</h3>
                                        <p>{session.description}</p>
                                        <p>👨‍🏫 {session.coachName}</p>
                                        <p>
                                            📅 {formatDate(session.startDay)} →{" "}
                                            {formatDate(session.endDay)}
                                        </p>
                                        <p>
                                            ⏰ {session.startTime} - {session.endTime}
                                        </p>

                                        {!isCompleted && (
                                            <p>
                                                🎟 {session.availableSeats}/{session.maxSeat}
                                            </p>
                                        )}

                                        {!isCompleted && (
                                            <button
                                                disabled={isFull || isEnrolled}
                                                onClick={() => handleEnroll(session.sessionId)}
                                                style={{
                                                    marginTop: "10px",
                                                    padding: "8px 14px",
                                                    borderRadius: "8px",
                                                    border: "none",
                                                    background: isEnrolled
                                                        ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                                                        : isFull
                                                            ? "#64748b"
                                                            : "linear-gradient(135deg, #22c55e, #16a34a)",
                                                    color: "white",
                                                    fontWeight: "600",
                                                    cursor: isFull || isEnrolled ? "not-allowed" : "pointer",
                                                }}
                                            >
                                                {isEnrolled ? "Enrolled" : isFull ? "Full" : "Enroll"}
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {showEnrollmentsModal && (
                <div
                    onClick={() => setShowEnrollmentsModal(false)}
                    style={{
                        position: "fixed",
                        top: 20,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 200,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "90%",
                            maxWidth: "1100px",
                            maxHeight: "85%",
                            overflowY: "auto",
                            background: "#0f172a",
                            padding: "22px",
                            borderRadius: "14px",
                            color: "white",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "18px",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <h2 style={{ margin: 0 }}>My Enrollments</h2>
                            <button
                                onClick={() => setShowEnrollmentsModal(false)}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "#334155",
                                    color: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                        </div>

                        {myEnrollments.length === 0 ? (
                            <p style={{ color: "#cbd5e1" }}>No enrollments found.</p>
                        ) : (
                            myEnrollments.map((booking) => {
                                const status = getBookingStatus(booking);
                                const isUnrolled = unrolledBookingIds.includes(
                                    booking.bookingId
                                );
                                const canUnenroll =
                                    status === "Upcoming" || status === "Ongoing";
                                const isCompleted = status === "Completed";
                                const existingFeedback = myFeedbacks.find(
                                    (f) => f.sessionId === booking.sessionId
                                );

                                return (
                                    <div
                                        key={booking.bookingId}
                                        style={{
                                            background: "#1e293b",
                                            borderRadius: "12px",
                                            padding: "16px",
                                            marginBottom: "14px",
                                            border: "1px solid #334155",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "start",
                                                gap: "12px",
                                                flexWrap: "wrap",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            <div>
                                                <h3 style={{ margin: "0 0 6px 0" }}>
                                                    {booking.sessionName}
                                                </h3>
                                                <div
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "4px 10px",
                                                        borderRadius: "999px",
                                                        fontSize: "12px",
                                                        fontWeight: 700,
                                                        ...statusBadgeStyle(isUnrolled ? "Unrolled" : status),
                                                    }}
                                                >
                                                    {isUnrolled ? "Unrolled" : status}
                                                </div>
                                            </div>

                                            {canUnenroll && !isUnrolled && (
                                                <button
                                                    onClick={() => handleUnenroll(booking)}
                                                    style={{
                                                        padding: "10px 16px",
                                                        borderRadius: "8px",
                                                        border: "none",
                                                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                                        color: "white",
                                                        fontWeight: 700,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Unenroll
                                                </button>
                                            )}

                                            {isUnrolled && (
                                                <button
                                                    disabled
                                                    style={{
                                                        padding: "10px 16px",
                                                        borderRadius: "8px",
                                                        border: "none",
                                                        background: "#7c3aed",
                                                        color: "white",
                                                        fontWeight: 700,
                                                        cursor: "not-allowed",
                                                    }}
                                                >
                                                    Unrolled
                                                </button>
                                            )}

                                            {isCompleted && !isUnrolled && !existingFeedback && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedSessionId(booking.sessionId);
                                                        setShowFeedbackModal(true);
                                                    }}
                                                    style={{
                                                        padding: "10px 16px",
                                                        borderRadius: "8px",
                                                        border: "none",
                                                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                                        color: "white",
                                                        fontWeight: 700,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Give Feedback
                                                </button>
                                            )}
                                        </div>

                                        <p style={{ margin: "6px 0" }}>{booking.sessionDescription}</p>
                                        <p style={{ margin: "6px 0" }}>👨‍🏫 {booking.coachName}</p>
                                        <p style={{ margin: "6px 0" }}>
                                            📅 {formatDate(booking.startDay)} →{" "}
                                            {formatDate(booking.endDay)}
                                        </p>
                                        <p style={{ margin: "6px 0" }}>
                                            ⏰ {booking.startTime} - {booking.endTime}
                                        </p>

                                        {existingFeedback && (
                                            <div
                                                style={{
                                                    marginTop: "12px",
                                                    padding: "10px",
                                                    background: "rgb(49 55 83)",
                                                    borderRadius: "8px",
                                                    border: "1px solid #334155",
                                                }}
                                            >
                                                <p style={{ margin: 0, fontSize: "13px", color: "#facc15" }}>
                                                    ⭐ {existingFeedback.rating} / 5
                                                </p>
                                                <p
                                                    style={{
                                                        margin: "4px 0 0 0",
                                                        fontSize: "12px",
                                                        color: "#cbd5e1",
                                                    }}
                                                >
                                                    {existingFeedback.feedbackDesc}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {showFeedbackModal && (
                <div
                    onClick={closeFeedbackModal}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 4000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "400px",
                            background: "#0f172a",
                            padding: "20px",
                            borderRadius: "12px",
                            color: "white",
                        }}
                    >
                        <h2>Submit Feedback</h2>

                        <div style={{ marginTop: "10px" }}>
                            <label>Rating (1–5)</label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                style={{
                                    width: "100%",
                                    marginTop: "5px",
                                    padding: "8px",
                                    borderRadius: "6px",
                                }}
                            />
                        </div>

                        <div style={{ marginTop: "12px" }}>
                            <label>Feedback</label>
                            <textarea
                                value={feedbackDesc}
                                onChange={(e) => setFeedbackDesc(e.target.value)}
                                rows={4}
                                style={{
                                    width: "100%",
                                    marginTop: "5px",
                                    padding: "8px",
                                    borderRadius: "6px",
                                }}
                            />
                        </div>

                        <div
                            style={{
                                marginTop: "16px",
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <button
                                onClick={closeFeedbackModal}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#334155",
                                    color: "white",
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSubmitFeedback}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                    color: "white",
                                    fontWeight: "600",
                                }}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantDashboard;