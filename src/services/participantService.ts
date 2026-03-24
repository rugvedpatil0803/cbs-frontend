// ─── Base URL from environment ────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SESSION_BASE   = `${BASE_URL}/session`;
const BOOKING_BASE   = `${BASE_URL}/booking`;
const FEEDBACK_BASE  = `${BASE_URL}/feedback`;

// ─── Types ────────────────────────────────────────────────────────────────────
export type SessionItem = {
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

export type BookingItem = {
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

export type FeedbackItem = {
  feedbackId: number;
  sessionId: number;
  rating: number;
  feedbackDesc: string;
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
});

// ─── Session APIs ─────────────────────────────────────────────────────────────

/** Fetch upcoming sessions */
export const fetchUpcomingSessions = async (token: string): Promise<SessionItem[]> => {
  const res = await fetch(`${SESSION_BASE}/upcoming`, { headers: authHeaders(token), cache: "no-store" });
  const data = await res.json();
  return data.data || [];
};

/** Fetch ongoing sessions */
export const fetchOngoingSessions = async (token: string): Promise<SessionItem[]> => {
  const res = await fetch(`${SESSION_BASE}/ongoing`, { headers: authHeaders(token), cache: "no-store" });
  const data = await res.json();
  return data.data || [];
};

/** Fetch completed sessions */
export const fetchCompletedSessions = async (token: string): Promise<SessionItem[]> => {
  const res = await fetch(`${SESSION_BASE}/completed`, { headers: authHeaders(token), cache: "no-store" });
  const data = await res.json();
  return data.data || [];
};

// ─── Booking APIs ─────────────────────────────────────────────────────────────

/** Fetch all bookings for the logged-in participant */
export const fetchMyBookings = async (token: string): Promise<BookingItem[]> => {
  const res = await fetch(`${BOOKING_BASE}/my-bookings`, { headers: authHeaders(token), cache: "no-store" });
  const data = await res.json();
  return data.data || [];
};

/** Enroll in a session */
export const enrollSession = async (
  token: string,
  sessionId: number
): Promise<{ status: string; message?: string }> => {
  const res = await fetch(`${BOOKING_BASE}/create`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ sessionId }),
  });
  return res.json();
};

/** Unenroll from a session */
export const unenrollSession = async (
  token: string,
  sessionId: number
): Promise<{ status: string; message?: string }> => {
  const res = await fetch(`${BOOKING_BASE}/unenroll/${sessionId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return res.json();
};

// ─── Feedback APIs ────────────────────────────────────────────────────────────

/** Fetch feedback submitted by the logged-in participant */
export const fetchMyFeedbacks = async (token: string): Promise<FeedbackItem[]> => {
  const res = await fetch(`${FEEDBACK_BASE}/user`, { headers: authHeaders(token), cache: "no-store" });
  const data = await res.json();
  return data.data || [];
};

/** Submit feedback for a completed session */
export const submitFeedback = async (
  token: string,
  payload: { sessionId: number; rating: number; feedbackDesc: string }
): Promise<{ status: string; message?: string }> => {
  const res = await fetch(`${FEEDBACK_BASE}/create`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
};

// ─── Composite / Dashboard fetch ──────────────────────────────────────────────

/**
 * Loads all data needed for the initial dashboard render in parallel:
 * upcoming, ongoing, completed sessions + enrolled booking IDs.
 */
export const fetchDashboardData = async (token: string) => {
  const [upcoming, ongoing, completed, bookings] = await Promise.all([
    fetchUpcomingSessions(token),
    fetchOngoingSessions(token),
    fetchCompletedSessions(token),
    fetchMyBookings(token),
  ]);

  const enrolledSessionIds = bookings.map((b) => b.sessionId);

  return { upcoming, ongoing, completed, enrolledSessionIds };
};

/**
 * Loads enrollments + feedbacks together (used by "My Enrollments" modal).
 */
export const fetchEnrollmentsWithFeedback = async (token: string) => {
  const [bookings, feedbacks] = await Promise.all([
    fetchMyBookings(token),
    fetchMyFeedbacks(token),
  ]);
  return { bookings, feedbacks };
};
