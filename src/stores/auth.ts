import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";
import { seedUsers } from "@/lib/seed";

interface AuthState {
  users: User[];
  currentUserId: string | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  changePassword: (oldPw: string, newPw: string) => { ok: boolean; error?: string };
  requestReset: (email: string) => { ok: boolean; error?: string };
  resetPassword: (email: string, newPw: string) => { ok: boolean; error?: string };
  upsertUser: (u: User) => void;
  deleteUser: (id: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUserId: null,
      login: (email, password) => {
        const u = get().users.find((x) => x.email.toLowerCase() === email.toLowerCase());
        if (!u) return { ok: false, error: "No account with that email" };
        if (!u.active) return { ok: false, error: "Account is inactive" };
        if (u.password !== password) return { ok: false, error: "Incorrect password" };
        set({ currentUserId: u.id });
        return { ok: true };
      },
      logout: () => set({ currentUserId: null }),
      updateProfile: (patch) => {
        const id = get().currentUserId;
        if (!id) return;
        set({ users: get().users.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
      },
      changePassword: (oldPw, newPw) => {
        const id = get().currentUserId;
        const u = get().users.find((x) => x.id === id);
        if (!u) return { ok: false, error: "Not signed in" };
        if (u.password !== oldPw) return { ok: false, error: "Current password is wrong" };
        set({ users: get().users.map((x) => (x.id === id ? { ...x, password: newPw } : x)) });
        return { ok: true };
      },
      requestReset: (email) => {
        const u = get().users.find((x) => x.email.toLowerCase() === email.toLowerCase());
        if (!u) return { ok: false, error: "No account with that email" };
        return { ok: true };
      },
      resetPassword: (email, newPw) => {
        const u = get().users.find((x) => x.email.toLowerCase() === email.toLowerCase());
        if (!u) return { ok: false, error: "No account with that email" };
        set({ users: get().users.map((x) => (x.id === u.id ? { ...x, password: newPw } : x)) });
        return { ok: true };
      },
      upsertUser: (u) => {
        const exists = get().users.some((x) => x.id === u.id);
        set({ users: exists ? get().users.map((x) => (x.id === u.id ? u : x)) : [...get().users, u] });
      },
      deleteUser: (id) => set({ users: get().users.filter((x) => x.id !== id) }),
    }),
    { name: "hams-auth" },
  ),
);

export const useCurrentUser = () => {
  const { users, currentUserId } = useAuth();
  return users.find((u) => u.id === currentUserId) ?? null;
};
