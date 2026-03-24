import apiClient from "./apiClient";

export const fetchUpcoming = async () => {
    const res = await apiClient.get("/session/upcoming");
    return res.data?.data || [];
};

export const fetchBookings = async () => {
    const res = await apiClient.get("/booking/my-bookings");
    return res.data?.data || [];
};

export const fetchOngoing = async () => {
    const res = await apiClient.get("/session/ongoing");
    return res.data?.data || [];
};

export const fetchCompleted = async () => {
    const res = await apiClient.get("/session/completed");
    return res.data?.data || [];
};

export const fetchMyFeedbacks = async () => {
    const res = await apiClient.get("/feedback/user");
    return res.data?.data || [];
};

export const createBooking = async (sessionId: number) => {
    const res = await apiClient.post("/booking/create", { sessionId });
    return res.data;
};

export const unenrollBooking = async (sessionId: number) => {
    const res = await apiClient.delete(`/booking/unenroll/${sessionId}`);
    return res.data; 
};

export const createFeedback = async (
    sessionId: number,
    rating: number,
    feedbackDesc: string
) => {
    const res = await apiClient.post("/feedback/create", {
        sessionId,
        rating,
        feedbackDesc,
    });

    return res.data; 
};
