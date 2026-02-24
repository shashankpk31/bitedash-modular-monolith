import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { LOCL_STRG_KEY } from "../config/constants";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem(LOCL_STRG_KEY.USER);
        const storedToken = localStorage.getItem(LOCL_STRG_KEY.TOKEN);

        if (storedUser && storedToken) {
          // Validate token with backend
          try {
            await api.get(`/auth/validate?token=${storedToken}`);
            // Token is valid, restore user session
            setUser(JSON.parse(storedUser));
          } catch (error) {
            // Token is invalid or expired, clear storage
            console.warn("Token validation failed:", error);
            localStorage.clear();
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        localStorage.clear();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const saveLoginDetails = (userData, token) => {
    localStorage.setItem(LOCL_STRG_KEY.USER, JSON.stringify(userData));
    localStorage.setItem(LOCL_STRG_KEY.TOKEN, token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(LOCL_STRG_KEY.USER);
    localStorage.removeItem(LOCL_STRG_KEY.TOKEN);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isInitializing,
      saveLoginDetails,
      logout,
      isAuthenticated: !!user,
    }),
    [user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};