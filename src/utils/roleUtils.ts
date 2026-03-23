export const ROLE_PRIORITY = ["ADMIN", "COACH", "PARTICIPANT"];

export const getHighestRole = (roles: string[]) => {
  return ROLE_PRIORITY.find((role) => roles.includes(role));
};