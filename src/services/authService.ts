import apiClient from "./apiClient";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  address: string;
  role: "coach" | "participant";
  motivation: string;
  reason: string;
  preferredSessionDuration: number;
  bio?: string | null;
}

export const registerUser = async (payload: RegisterPayload) => {
  try {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || "Registration failed";
  }
};

export const loginWithEmail = async (email: string) => {
  const res = await apiClient.post("/auth/login/email", { email });

  if (res.data?.status !== "success") {
    throw new Error(res.data?.message || "Email verification failed");
  }

  return res.data;
};

export const loginWithPassword = async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", {email, password,});

    if (res.data?.status !== "success") {
      throw new Error(res.data?.message || "Login failed");
    }

    return res.data.data;
};

export const requestOtp = async (email: string) => {
  const res = await apiClient.post("/auth/request-otp", { email });

  if (res.data?.status !== "success") {
    throw new Error(res.data?.message || "Failed to send OTP");
  }

  return res.data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const res = await apiClient.post("/auth/reset", {email, otp, newPassword,});

  if (res.data?.status !== "success") {
    throw new Error(res.data?.message || "Password reset failed");
  }

  return res.data;
};