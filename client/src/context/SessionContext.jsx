import { createContext, useState, useEffect, useContext } from "react";
import api from "@/api/axios";
import { toast } from "sonner";

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [needsGoalRefresh, setNeedsGoalRefresh] = useState(false);

  useEffect(() => {
    const fetchCurrentSession = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/session/current");
        setCurrentSession(response.data.data);
      } catch (error) {
        console.error("No active session found.", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentSession();
  }, []);

  const startSession = async ({ taskId, goalId, tags }) => {
    if (currentSession) {
      toast.error("Another session is already active.");
      return;
    }
    try {
      const response = await api.post("/session/start", {
        taskId,
        goalId,
        tags,
      });
      setCurrentSession(response.data.data);
      toast.success(`Session started for: ${tags.join(", ")}`);
    } catch (error) {
      toast.error("Failed to start session.");
      console.error(error);
    }
  };

  const pauseSession = async () => {
    if (!currentSession) return;
    try {
      const response = await api.patch(`/session/pause/${currentSession._id}`);
      setCurrentSession(response.data.data);
      toast.info("Session paused.");
    } catch (error) {
      toast.error("Failed to pause session.");
    }
  };

  const resumeSession = async () => {
    if (!currentSession) return;
    try {
      const response = await api.patch(`/session/resume/${currentSession._id}`);
      setCurrentSession(response.data.data);
      toast.success("Session resumed.");
    } catch (error) {
      toast.error("Failed to resume session.");
    }
  };

  const endSession = async ({ rating, notes }) => {
    if (!currentSession) return;
    try {
      await api.post(`/session/end/${currentSession._id}`, { rating, notes });
      toast.success("Session completed!");
      setCurrentSession(null);

      setNeedsGoalRefresh(true);
    } catch (error) {
      toast.error("Failed to end session.");
    }
  };

  const value = {
    currentSession,
    isLoading,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    needsGoalRefresh,
    setNeedsGoalRefresh,
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
