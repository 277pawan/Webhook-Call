import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import {
  getCurrentUser,
  loginUserApi,
  logoutUserApi,
  loginUser,
  logoutUser,
} from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const apiUser = await loginUserApi(email);
      if (apiUser) {
        setUser(apiUser);
        return apiUser;
      }

      const loggedInUser = loginUser(email);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.warn("API login failed, using local fallback:", error);
      const loggedInUser = loginUser(email);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setIsLoading(false); // ✅ ALWAYS RUNS
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUserApi();
    } catch (error) {
      console.warn("API logout failed, using local fallback:", error);
      logoutUser();
    }
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
