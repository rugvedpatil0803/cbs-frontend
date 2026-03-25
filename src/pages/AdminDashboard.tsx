import { useEffect, useRef, useState } from "react";
import {fetchUpcoming, fetchOngoing, fetchCompleted,} from "../services/participantDashboardService";
import { getSessionAnalytics, unenrollParticipant, enrollParticipant } from "../services/sessionService";
import { userByList } from "./../services/userProfileService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


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

type SessionAnalyticsResponse = {
  session: {
    sessionId: number;
    name: string;
    description: string;
    coach: string;
    schedule: {
      startDay: string;
      endDay: string;
      startTime: string;
      endTime: string;
    };
    totalSeats: number;
  };
  availability: {
    maxSeat: number;
    occupiedSeats: number;
    availableSeats: number;
    occupancyPercentage: number;
  };
  bookingStats: {
    totalBookings: number;
    activeBookings: number;
    cancelledBookings: number;
    deletedBookings: number;
  };
  participants: {
    totalParticipants: number;
    allParticipants: {
      userId: number;
      name: string;
      email: string;
      contactNumber: string;
      bookingTime: string;
    }[];
  };
  feedbackStats: {
    averageRating: number;
  };
  status: string;
};

const AdminDashboard = () => {
  const [upcoming, setUpcoming] = useState<SessionItem[]>([]);
  const [ongoing, setOngoing] = useState<SessionItem[]>([]);
  const [completed, setCompleted] = useState<SessionItem[]>([]);

  const [modalData, setModalData] = useState<SessionItem[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] =
    useState<SessionAnalyticsResponse | null>(null);
  const [selectedSessionName, setSelectedSessionName] = useState("");

  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || hasFetched.current) return;

    hasFetched.current = true;

    const fetchAll = async () => {
      try {
        setLoading(true);

        const [upcomingData, ongoingData, completedData] = await Promise.all([
          fetchUpcoming(),
          fetchOngoing(),
          fetchCompleted(),
        ]);

        setUpcoming(upcomingData);
        setOngoing(ongoingData);
        setCompleted(completedData);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);

        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Unable to load dashboard data",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  const openModal = (title: string, data: SessionItem[]) => {
    setModalTitle(title);
    setModalData(data);
    setShowModal(true);
  };

  const openAnalyticsPopup = async (sessionId: number, sessionName: string) => {
    try {
      setAnalyticsOpen(true);
      setAnalyticsLoading(true);
      setAnalyticsData(null);
      setSelectedSessionName(sessionName);

      // 🔥 GLOBAL LOADER
      Swal.fire({
        title: "Loading...",
        text: "Fetching session analytics",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const result = await getSessionAnalytics(sessionId);

      Swal.close();

      if (result.status !== "success") {
        throw new Error(result.message || "Failed to fetch analytics");
      }

      setAnalyticsData(result.data);
    } catch (error: any) {
      Swal.close();

      console.error("Error fetching session analytics:", error);
      setAnalyticsOpen(false);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.message || "Unable to load session analytics",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const openAddParticipantPopup = async () => {
    try {
      setAddParticipantOpen(true);
      setLoadingUsers(true);

      Swal.fire({
        title: "Loading Users...",
        text: "Fetching participant list",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await userByList();

      Swal.close();

      const allParticipants = res.PARTICIPANT || [];

      const existingIds =
        analyticsData?.participants.allParticipants.map((p) => p.userId) || [];

      const filtered = allParticipants.filter(
        (u: any) => !existingIds.includes(u.userId)
      );

      setAvailableUsers(filtered);
    } catch (err: any) {
      Swal.close();

      Swal.fire("Error", err, "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleEnroll = async (participantId: number) => {
    try {
      Swal.fire({
        title: "Enrolling...",
        text: "Please wait",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await enrollParticipant(
        analyticsData!.session.sessionId,
        participantId
      );

      Swal.close();

      if (res.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Enrolled",
          timer: 1200,
          showConfirmButton: false,
        });

        setAvailableUsers((prev) =>
          prev.filter((u) => u.userId !== participantId)
        );

        const addedUser = availableUsers.find(
          (u) => u.userId === participantId
        );

        if (addedUser) {
          setAnalyticsData((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              participants: {
                ...prev.participants,
                allParticipants: [
                  ...prev.participants.allParticipants,
                  {
                    userId: addedUser.userId,
                    name: `${addedUser.firstName} ${addedUser.lastName}`,
                    email: addedUser.email,
                    contactNumber: "-",
                    bookingTime: new Date().toISOString(),
                  },
                ],
              },
            };
          });
        }
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      Swal.close();

      Swal.fire("Error", err?.message || "Failed", "error");
    }
  };

  const handleUnenroll = async (sessionId: number, participantId: number) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "You want to unenroll this participant?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Yes, Unenroll",
      });

      if (!confirm.isConfirmed) return;

      Swal.fire({
        title: "Processing...",
        text: "Unenrolling participant",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await unenrollParticipant(sessionId, participantId);

      Swal.close();

      if (res.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Unenrolled",
          timer: 1200,
          showConfirmButton: false,
        });

        setAnalyticsData((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            participants: {
              ...prev.participants,
              allParticipants: prev.participants.allParticipants.filter(
                (p) => p.userId !== participantId
              ),
            },
          };
        });
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err?.message || "Failed to unenroll",
        confirmButtonColor: "#ef4444",
      });
    }
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

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ color: "white" }}>{title}</h2>

        <button
          onClick={() => openModal(title, data)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "white",
            cursor: "pointer",
            fontWeight: 700,
            boxShadow: "0 6px 16px rgba(79, 70, 229, 0.25)",
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
          className="custom-scroll"
        >
          {data.slice(0, 10).map((session) => (
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
                cursor: "default",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px #a855f7, 0 0 15px #a855f7";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <h3 style={{ marginTop: 0 }}>{session.name}</h3>
              <p style={{ fontSize: "13px", color: "#cbd5f5" }}>
                {session.description}
              </p>

              <div style={{ marginTop: "10px", fontSize: "13px" }}>
                <p>👨‍🏫 {session.coachName}</p>
                <p>
                  📅 {formatDate(session.startDay)} →{" "}
                  {formatDate(session.endDay)}
                </p>
                <p>
                  ⏰ {session.startTime} - {session.endTime}
                </p>
                <p>
                  🎟 Seats: {session.availableSeats}/{session.maxSeat}
                </p>
              </div>

              <button
                onClick={() =>
                  openAnalyticsPopup(session.sessionId, session.name)
                }
                style={{
                  marginTop: "12px",
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #06b6d4, #2563eb)",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                View Analytics
              </button>
            </div>
          ))}
        </div>
      )}
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
          Loading Admin Dashboard...
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

  const isCompleted =
    analyticsData?.status?.toLowerCase().trim() === "completed";

  const hasSeats =
    (analyticsData?.availability?.availableSeats ?? 0) > 0;

  return (
    <>
      <style>
        {`
          .custom-scroll::-webkit-scrollbar {
            height: 6px;
          }

          .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .custom-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
          }

          .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(133, 69, 194, 0.6);
          }

          .custom-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(231, 216, 238, 0.2) transparent;
          }
        `}
      </style>

      <div style={{ padding: "45px", marginTop: "70px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            paddingBottom: "40px",
          }}
        >
          <h1 style={{ margin: 0, color: "white" }}>🛠️ Admin Dashboard</h1>

          <button
            onClick={() => navigate("/user-management")}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(99, 102, 241, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            👥 Manage Users
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
                boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
              }}
              className="custom-scroll"
            >
              <h2 style={{ marginBottom: "15px" }}>{modalTitle}</h2>

              {modalData.length === 0 ? (
                <p style={{ color: "#cbd5e1" }}>No Sessions For Now</p>
              ) : (
                modalData.map((session) => (
                  <div
                    key={session.sessionId}
                    style={{
                      padding: "12px",
                      marginBottom: "10px",
                      background: "#0f172a",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      cursor: "default",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 0 0 2px #a855f7, 0 0 15px #a855f7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <h3 style={{ marginTop: 0 }}>{session.name}</h3>
                    <p>{session.description}</p>
                    <p>👨‍🏫 {session.coachName}</p>
                    <p>
                      📅 {formatDate(session.startDay)} →{" "}
                      {formatDate(session.endDay)}
                    </p>
                    <p>
                      ⏰ {session.startTime} - {session.endTime}
                    </p>
                    <p>
                      🎟 Seats: {session.availableSeats}/{session.maxSeat}
                    </p>

                    <button
                      onClick={() =>
                        openAnalyticsPopup(session.sessionId, session.name)
                      }
                      style={{
                        marginTop: "10px",
                        padding: "9px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: "linear-gradient(135deg, #06b6d4, #2563eb)",
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      View Analytics
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {analyticsOpen && (
          <div
            onClick={() => setAnalyticsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000,
              padding: "20px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "95%",
                maxWidth: "1100px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "linear-gradient(180deg, #0f172a, #111827)",
                color: "white",
                borderRadius: "16px",
                boxShadow: "0 25px 70px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              className="custom-scroll"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 22px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  position: "sticky",
                  top: 0,
                  background: "linear-gradient(180deg, #0f172a, #111827)",
                  zIndex: 1,
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Session Analytics</h2>
                  <p style={{ margin: "6px 0 0", color: "#cbd5e1" }}>
                    {selectedSessionName}
                  </p>
                </div>

                <button
                  onClick={() => setAnalyticsOpen(false)}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    border: "none",
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              {addParticipantOpen && (
                <div
                  onClick={() => setAddParticipantOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.7)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 3000,
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: "90%",
                      maxWidth: "900px",
                      maxHeight: "85vh",
                      overflowY: "auto",
                      background: "#0f172a",
                      borderRadius: "14px",
                      padding: "20px",
                      color: "white",
                    }}
                    className="custom-scroll"
                  >
                    {/* HEADER */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        paddingBottom: "12px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        marginBottom: "14px",
                      }}
                    >
                      <div>
                        <h2 style={{ margin: 0, fontSize: "20px" }}>{analyticsData?.session.name}</h2>
                      </div>

                      <button
                        onClick={() => setAddParticipantOpen(false)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          border: "none",
                          background: "rgba(255,255,255,0.06)",
                          color: "#e2e8f0",
                          fontSize: "18px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.18)";
                          e.currentTarget.style.transform = "scale(1.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* SESSION INFO */}
                    <div
                      style={{
                        marginBottom: "18px",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        fontSize: "13px",
                        color: "#e2e8f0",
                        lineHeight: "1.6",
                      }}
                    >
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <span>👨‍🏫 {analyticsData?.session.coach}</span>
                        <span>
                          📅 {formatDate(analyticsData!.session.schedule.startDay)} →{" "}
                          {formatDate(analyticsData!.session.schedule.endDay)}
                        </span>
                        <span>
                          ⏰ {analyticsData?.session.schedule.startTime} -{" "}
                          {analyticsData?.session.schedule.endTime}
                        </span>
                      </div>
                    </div>

                    {/* TABLE */}
                    {loadingUsers ? (
                      <p>Loading users...</p>
                    ) : availableUsers.length === 0 ? (
                      <p>No available participants</p>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#1f2937" }}>
                            <th style={tableHeadStyle}>ID</th>
                            <th style={tableHeadStyle}>Name</th>
                            <th style={tableHeadStyle}>Email</th>
                            <th style={tableHeadStyle}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableUsers.map((u) => (
                            <tr key={u.userId}>
                              <td style={tableCellStyle}>{u.userId}</td>
                              <td style={tableCellStyle}>
                                {u.firstName} {u.lastName}
                              </td>
                              <td style={tableCellStyle}>{u.email}</td>
                              <td style={tableCellStyle}>
                                <button
                                  onClick={() => handleEnroll(u.userId)}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                  }}
                                >
                                  Enroll
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {analyticsLoading ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      border: "6px solid rgba(255,255,255,0.15)",
                      borderTop: "6px solid #06b6d4",
                      borderRadius: "50%",
                      margin: "0 auto 16px",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p style={{ color: "#cbd5e1" }}>Loading analytics...</p>
                </div>
              ) : analyticsData ? (
                <div style={{ padding: "22px" }}>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "16px",
                      marginBottom: "22px",
                    }}
                  >
                    {/* Session Name */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))",
                        border: "1px solid rgba(99,102,241,0.4)",
                        borderLeft: "4px solid #6366f1",
                        borderRadius: "14px",
                        padding: "16px",
                        boxShadow: "0 4px 20px rgba(99,102,241,0.2)",
                      }}
                    >
                      <div style={analyticsLabelStyle}>Session Name</div>
                      <div style={analyticsValueStyle}>{analyticsData.session.name}</div>
                    </div>

                    {/* Coach */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
                        border: "1px solid rgba(34,197,94,0.4)",
                        borderLeft: "4px solid #22c55e",
                        borderRadius: "14px",
                        padding: "16px",
                        boxShadow: "0 4px 20px rgba(34,197,94,0.2)",
                      }}
                    >
                      <div style={analyticsLabelStyle}>Coach</div>
                      <div style={analyticsValueStyle}>{analyticsData.session.coach}</div>
                    </div>

                    {/* Status */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))",
                        border: "1px solid rgba(245,158,11,0.4)",
                        borderLeft: "4px solid #f59e0b",
                        borderRadius: "14px",
                        padding: "16px",
                        boxShadow: "0 4px 20px rgba(245,158,11,0.2)",
                      }}
                    >
                      <div style={analyticsLabelStyle}>Status</div>
                      <div style={analyticsValueStyle}>{analyticsData.status}</div>
                    </div>

                    {/* Seats */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))",
                        border: "1px solid rgba(6,182,212,0.4)",
                        borderLeft: "4px solid #06b6d4",
                        borderRadius: "14px",
                        padding: "16px",
                        boxShadow: "0 4px 20px rgba(6,182,212,0.2)",
                      }}
                    >
                      <div style={analyticsLabelStyle}>Total Seats</div>
                      <div style={analyticsValueStyle}>
                        {analyticsData.session.totalSeats}
                      </div>
                    </div>
                  </div>

                  {/* ===== DETAILS SECTIONS ===== */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                      marginBottom: "22px",
                    }}
                  >
                    {/* Session Details */}
                    <div
                      style={{
                        background: "linear-gradient(180deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))",
                        border: "1px solid rgba(99,102,241,0.3)",
                        borderRadius: "14px",
                        padding: "18px",
                        boxShadow: "0 10px 30px rgba(99,102,241,0.1)",
                      }}
                    >
                      <h3 style={{ ...sectionTitleStyle, color: "#a5b4fc" }}>
                        📘 Session Details
                      </h3>
                      <p style={detailLineStyle}>
                        <strong>Description:</strong> {analyticsData.session.description}
                      </p>
                      <p style={detailLineStyle}>
                        <strong>Start Day:</strong>{" "}
                        {formatDate(analyticsData.session.schedule.startDay)}
                      </p>
                      <p style={detailLineStyle}>
                        <strong>End Day:</strong>{" "}
                        {formatDate(analyticsData.session.schedule.endDay)}
                      </p>
                      <p style={detailLineStyle}>
                        <strong>Time:</strong>{" "}
                        {analyticsData.session.schedule.startTime} -{" "}
                        {analyticsData.session.schedule.endTime}
                      </p>
                    </div>

                    {/* Availability */}
                    <div
                      style={{
                        background: "linear-gradient(180deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))",
                        border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "14px",
                        padding: "18px",
                        boxShadow: "0 10px 30px rgba(34,197,94,0.1)",
                      }}
                    >
                      <h3 style={{ ...sectionTitleStyle, color: "#86efac" }}>
                        📊 Availability
                      </h3>
                      <p style={detailLineStyle}>
                        <strong>Max Seat:</strong> {analyticsData.availability.maxSeat}
                      </p>
                      <p style={detailLineStyle}>
                        <strong>Occupied Seats:</strong>{" "}
                        {analyticsData.availability.occupiedSeats}
                      </p>
                      <p style={detailLineStyle}>
                        <strong>Available Seats:</strong>{" "}
                        {analyticsData.availability.availableSeats}
                      </p>
                      <p style={detailLineStyle}>
                        <strong>Occupancy:</strong>{" "}
                        {analyticsData.availability.occupancyPercentage.toFixed(2)}%
                      </p>
                    </div>

                    {/* Booking Stats */}
                    <div
                      style={{
                        background: "linear-gradient(180deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))",
                        border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: "14px",
                        padding: "18px",
                        boxShadow: "0 10px 30px rgba(245,158,11,0.1)",
                      }}
                    >
                      <h3 style={{ ...sectionTitleStyle, color: "#fcd34d" }}>
                        📦 Booking Stats
                      </h3>
                      <p style={detailLineStyle}>
                        <strong>Total Bookings:</strong>{" "}
                        {analyticsData.bookingStats.totalBookings}
                      </p>
                      <p style={detailLineStyle}>
                        <strong>Active:</strong>{" "}
                        {analyticsData.bookingStats.activeBookings}
                      </p>
                      <p style={detailLineStyle}>
                        <strong>Cancelled:</strong>{" "}
                        {analyticsData.bookingStats.cancelledBookings}
                      </p>
                      <p style={detailLineStyle}>
                        <strong>Deleted:</strong>{" "}
                        {analyticsData.bookingStats.deletedBookings}
                      </p>
                    </div>

                    {/* Feedback */}
                    <div
                      style={{
                        background: "linear-gradient(180deg, rgba(236,72,153,0.08), rgba(236,72,153,0.02))",
                        border: "1px solid rgba(236,72,153,0.3)",
                        borderRadius: "14px",
                        padding: "18px",
                        boxShadow: "0 10px 30px rgba(236,72,153,0.1)",
                      }}
                    >
                      <h3 style={{ ...sectionTitleStyle, color: "#f9a8d4" }}>
                        ⭐ Feedback
                      </h3>
                      <p style={detailLineStyle}>
                        <strong>Average Rating:</strong>{" "}
                        {analyticsData.feedbackStats.averageRating}
                      </p>
                      <p style={detailLineStyle}>
                        <strong>Total Participants:</strong>{" "}
                        {analyticsData.participants.totalParticipants}
                      </p>
                    </div>
                  </div>

                  <div style={sectionCardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={sectionTitleStyle}>Participants</h3>

                      {!isCompleted && hasSeats && (
                        <button
                          onClick={openAddParticipantPopup}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "none",
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
                            color: "white",
                            fontWeight: 700,
                            cursor: "pointer",
                            marginBottom: "20px",
                          }}
                        >
                          + Add Participant
                        </button>
                      )}
                    </div>

                    {analyticsData.participants.allParticipants.length === 0 ? (
                      <p style={{ color: "#cbd5e1" }}>No participants found.</p>
                    ) : (
                      <div style={{ overflowX: "auto" }} className="custom-scroll">
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: "750px",
                          }}
                        >
                          <thead>
                            <tr style={{ background: "#1f2937" }}>
                              <th style={tableHeadStyle}>User ID</th>
                              <th style={tableHeadStyle}>Name</th>
                              <th style={tableHeadStyle}>Email</th>
                              <th style={tableHeadStyle}>Contact</th>
                              <th style={tableHeadStyle}>Booking Time</th>
                              {!isCompleted && (
                                <th style={tableHeadStyle}>Action</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsData.participants.allParticipants.map(
                              (participant) => (
                                <tr
                                  key={participant.userId}
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(255,255,255,0.08)",
                                  }}
                                >
                                  <td style={tableCellStyle}>
                                    {participant.userId}
                                  </td>
                                  <td style={tableCellStyle}>
                                    {participant.name}
                                  </td>
                                  <td style={tableCellStyle}>
                                    {participant.email}
                                  </td>
                                  <td style={tableCellStyle}>
                                    {participant.contactNumber}
                                  </td>
                                  <td style={tableCellStyle}>
                                    {formatDateTime(participant.bookingTime)}
                                  </td>
                                  {!isCompleted && (
                                    <td style={tableCellStyle}>
                                      <button
                                        onClick={() =>
                                          handleUnenroll(
                                            analyticsData!.session.sessionId,
                                            participant.userId
                                          )
                                        }
                                        style={{
                                          padding: "6px 10px",
                                          borderRadius: "6px",
                                          border: "none",
                                          background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                          color: "white",
                                          cursor: "pointer",
                                          fontSize: "12px",
                                          fontWeight: 600,
                                        }}
                                      >
                                        Unenroll
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <p style={{ color: "#cbd5e1" }}>No analytics data found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const analyticsCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "16px",
};

const analyticsLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const analyticsValueStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: "white",
};

const sectionCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "18px",
  marginBottom: "16px",
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "14px",
  fontSize: "18px",
};

const detailLineStyle: React.CSSProperties = {
  margin: "8px 0",
  color: "#e2e8f0",
};

const tableHeadStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 10px",
  fontSize: "14px",
  color: "white",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  whiteSpace: "nowrap",
};

const tableCellStyle: React.CSSProperties = {
  padding: "12px 10px",
  color: "#e2e8f0",
  fontSize: "14px",
  whiteSpace: "nowrap",
};

export default AdminDashboard;