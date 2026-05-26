import { createContext, useState, useEffect, useContext } from "react";
import api from "@/api/axios";
import { toast } from "sonner";

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsGoalRefresh, setNeedsGoalRefresh] = useState(false);
  const [sessionUpdated, setSessionUpdated] = useState(0);

  useEffect(() => {
    const fetchCurrentSession = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/session/current");
        setCurrentSession(response.data.data);
      } catch (error) {
        setCurrentSession(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentSession();
  }, []);

  const startSession = async ({ tag }) => {
    if (currentSession) {
      toast.error("Another session is already active.");
      return;
    }
    try {
      const response = await api.post("/session/startSession", { tag });
      setCurrentSession(response.data.data);
      toast.success(`Session started for "${tag}"`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start session.");
    }
  };

  const pauseSession = async () => {
    if (!currentSession) return;
    try {
      const response = await api.patch(
        `/session/pauseSession/${currentSession._id}`
      );
      setCurrentSession(response.data.data);
      toast.info("Session paused.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to pause session.");
    }
  };

  const resumeSession = async () => {
    if (!currentSession) return;
    try {
      const response = await api.patch(
        `/session/resumeSession/${currentSession._id}`
      );
      setCurrentSession(response.data.data);
      toast.success("Session resumed.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resume session.");
    }
  };

  const endSession = async ({ rating, notes }) => {
    if (!currentSession) return;
    try {
      await api.post(`/session/end/${currentSession._id}`, { rating, notes });
      toast.success("Session completed!");
      setCurrentSession(null);
      setNeedsGoalRefresh(true);
      setSessionUpdated((prev) => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to end session.");
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await api.delete(`/session/delete/${sessionId}`);
      toast.success("Session deleted.");
      setSessionUpdated((prev) => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete session.");
    }
  };

  const value = {
    currentSession,
    isLoading,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    deleteSession,
    needsGoalRefresh,
    setNeedsGoalRefresh,
    sessionUpdated,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
