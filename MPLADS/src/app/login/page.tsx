"use client";

import Login from "@/components/Login";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [user, isLoading, router]);

  return <Login />;
}
