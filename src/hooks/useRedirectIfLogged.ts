// src/hooks/useRedirectIfLogged.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const useRedirectIfLogged = () => {
  const router = useRouter();
  
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      router.push(`/profile/${userId}`);
    }
  }, [router]);
};
