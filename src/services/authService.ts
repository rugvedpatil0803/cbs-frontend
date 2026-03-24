import apiClient from "./apiClient";

// 🔹 Step 1: Email verification
export const loginWithEmail = async (email: string) => {
  const res = await apiClient.post("/auth/login/email", { email });

  if (res.data?.status !== "success") {
    throw new Error(res.data?.message || "Email verification failed");
  }

  return res.data;
};

// 🔹 Step 2: Password login
export const loginWithPassword = async (
  email: string,
  password: string
) => {
  const res = await apiClient.post("/auth/login", {
    email,
    password,
  });

  if (res.data?.status !== "success") {
    throw new Error(res.data?.message || "Login failed");
  }

  return res.data.data; // ✅ correct
};