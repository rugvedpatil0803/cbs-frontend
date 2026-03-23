export const redirectToDashboard = (role: string, navigate: any) => {
  if (role === "ADMIN") navigate("/admin-dashboard");
  else if (role === "COACH") navigate("/coach-dashboard");
  else navigate("/participant-dashboard");
};