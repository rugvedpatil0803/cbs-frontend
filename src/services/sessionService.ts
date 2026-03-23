import apiClient from "./apiClient";

export const createSession = async (payload: any) => {
  const res = await apiClient.post("/api/session/create", payload);
  return res.data;
};