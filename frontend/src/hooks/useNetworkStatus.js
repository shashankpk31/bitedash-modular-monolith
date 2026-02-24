import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export const useNetworkStatus = () => {
  useEffect(() => {
    const handleOnline = () => toast.success("Back Online! Syncing data...");
    const handleOffline = () => toast.error("Offline Mode: Using cached data.", { duration: 5000 });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
};