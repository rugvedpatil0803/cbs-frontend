import apiClient from "./apiClient";

export const myAllSessions = async () => {
    const res = await apiClient.get("/session/my-sessions");
    return res.data?.data || {};
};

export const getSessionDetails = async (sessionId: number) => {
    const res = await apiClient.get(`/session/details/${sessionId}`);
    return res.data?.data || null;
};

export const createSession = async (payload: any) => {
    const res = await apiClient.post("/session/create", payload);
    return res.data;
};

export const updateSession = async (sessionId: number, payload: any) => {
    const res = await apiClient.put(`/session/update/${sessionId}`, payload);
    return res.data;
};

export const deleteSession = async (sessionId: number) => {
    const res = await apiClient.delete(`/session/delete/${sessionId}`);
    return res.data;
};