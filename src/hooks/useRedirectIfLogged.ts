// src/hooks/useRedirectIfLogged.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useRedirectIfLogged = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) navigate(`/profile/${userId}`);
  }, [navigate]);
};
