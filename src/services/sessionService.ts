import apiClient from "./apiClient";

export const createSession = async (payload: any) => {
  const res = await apiClient.post("/api/session/create", payload);
  return res.data;
};

export const getSessionAnalytics = async (sessionId: number) => {
  const res = await apiClient.get(`/session/analytics/${sessionId}`);
  return res.data;
};