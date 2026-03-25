import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  fetchUpcoming,
  fetchOngoing,
  fetchCompleted,
} from "../services/participantDashboardService";
import { useNavigate } from "react-router-dom";

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

const AdminDashboard = () => {
  const [upcoming, setUpcoming] = useState<SessionItem[]>([]);
  const [ongoing, setOngoing] = useState<SessionItem[]>([]);
  const [completed, setCompleted] = useState<SessionItem[]>([]);

  const [modalData, setModalData] = useState<SessionItem[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px #a855f7, 0 0 15px #a855f7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
              }}
            >
              <h3 style={{ marginTop: 0 }}>{session.name}</h3>
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
                <p>
                  🎟 Seats: {session.availableSeats}/{session.maxSeat}
                </p>
              </div>
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
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;  