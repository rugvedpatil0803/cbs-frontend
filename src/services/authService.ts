const BASE_URL = "http://localhost:8080";

export const loginWithEmail = async (email: string) => {
  const response = await fetch(`${BASE_URL}/auth/login/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Email verification failed");
  }

  return data;
};

export const loginWithPassword = async (email: string, password: string) => {
  const res = await fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Login failed");

  return data;
};