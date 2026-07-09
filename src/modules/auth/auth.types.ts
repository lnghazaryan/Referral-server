export type UserRole = "Guest" | "Admin";

export type SessionUser = {
  id: number;
  username: string;
  role: UserRole;
};
