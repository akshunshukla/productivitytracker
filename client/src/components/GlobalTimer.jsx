import { useEffect, useState } from "react";
import { useSession } from "@/context/SessionContext";

export default function GlobalTimer() {
  const { currentSession } = useSession();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (currentSession?.status === "active") {
      const lastInterval = currentSession.intervals[currentSession.intervals.length - 1];
      const start = new Date(lastInterval.startTime).getTime();
      const baseDuration = currentSession.duration;

      interval = setInterval(() => {
        setElapsed(baseDuration + (new Date().getTime() - start));
      }, 1000);
    } else if (currentSession) {
      setElapsed(currentSession.duration);
    } else {
      setElapsed(0);
    }

    return () => clearInterval(interval);
  }, [currentSession]);

  if (!currentSession) return null;

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };



  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {currentSession.status === "active" ? "Active Session" : "Paused"}
        </div>
        <div className="font-mono text-lg">{formatTime(elapsed)}</div>
      </div>
    </div>
  );
}
