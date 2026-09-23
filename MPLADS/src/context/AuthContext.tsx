"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, UserRole } from "@/types";
import {
  MP_USERS,
  DISTRICT_USERS,
  STATE_USERS,
  MINISTRY_USER,
  CITIZEN_USER,
} from "@/data/mpladsData";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mplads_user");
      if (saved) {
        let parsed = JSON.parse(saved) as User;
        // Patch stale Citizen user data: ensure district/state are always set
        if (parsed.role === "Citizen" && (!parsed.district || !parsed.state)) {
          parsed = { ...parsed, district: CITIZEN_USER.district, state: CITIZEN_USER.state };
          localStorage.setItem("mplads_user", JSON.stringify(parsed));
        }
        setUser(parsed);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    try {
      localStorage.setItem("mplads_user", JSON.stringify(newUser));
    } catch {
      // ignore
    }
    const roleSlug = newUser.role.toLowerCase();
    router.push(`/dashboard/${roleSlug}`);
  };

  const loginAsRole = (role: UserRole) => {
    let u: User;
    if (role === "MP") u = MP_USERS[0];
    else if (role === "District") u = DISTRICT_USERS[0];
    else if (role === "State") u = STATE_USERS[0];
    else if (role === "Ministry") u = MINISTRY_USER;
    else u = CITIZEN_USER;
    login(u);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("mplads_user");
      sessionStorage.removeItem("mplads_user");
    } catch {
      // ignore
    }
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsRole, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
