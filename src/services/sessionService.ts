import apiClient from "./apiClient";

export const createSession = async (payload: any) => {
  const res = await apiClient.post("/api/session/create", payload);
  return res.data;
};

export const getSessionAnalytics = async (sessionId: number) => {
  const res = await apiClient.get(`/session/analytics/${sessionId}`);
  return res.data;
};

export const unenrollParticipant = async (sessionId: number, participantId: number) => {
  const response = await apiClient.delete(`/booking/unenroll/${sessionId}?participantId=${participantId}`);
  return response.data;
};

export const enrollParticipant = async (sessionId: number, participantId: number) => {
  const response = await apiClient.post(`/booking/create`,{sessionId,participantId});
  return response.data;
};