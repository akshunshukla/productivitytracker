import { useState, useEffect } from "react";
import { SessionProvider } from "@/context/SessionContext";
import DashboardLayout from "@/components/DashboardLayout";
import SessionTimer from "@/components/SessionTimer";
import ActiveGoals from "@/components/ActiveGoals";
import TodoList from "@/components/TodoList";
import RecentSessions from "@/components/RecentSessions";
import MotivationalQuote from "@/components/MotivationalQuote";
import api from "@/api/axios";
import { Clock, Timer } from "lucide-react";

const Dashboard = () => {
  const [todaySummary, setTodaySummary] = useState({
    totalHours: 0,
    sessionCount: 0,
  });

  useEffect(() => {
    const fetchTodaySummary = async () => {
      try {
        const response = await api.get("/analytics/todays-summary");
        setTodaySummary(response.data.data);
      } catch (error) {

      }
    };
    fetchTodaySummary();
  }, []);

  return (
    <DashboardLayout>
      <SessionProvider>
        <div className="space-y-4 animate-fade-in">
          {/* Row 1: Quote + Today's Stats — compact banner */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            <div className="flex-1">
              <MotivationalQuote />
            </div>
            <div className="flex gap-3 sm:shrink-0">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card border border-border">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Focus Today</p>
                  <p className="text-base font-bold leading-none">{todaySummary.totalHours || 0}h</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card border border-border">
                <div className="p-1.5 rounded-md bg-chart-2/10">
                  <Timer className="w-3.5 h-3.5 text-chart-2" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Sessions</p>
                  <p className="text-base font-bold leading-none">{todaySummary.sessionCount || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Compact Timer */}
          <SessionTimer />

          {/* Row 3: 2-column grid — Tasks + Goals left, Sessions right */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left side: Tasks + Goals */}
            <div className="lg:col-span-2 space-y-4">
              <TodoList />
              <ActiveGoals />
            </div>
            {/* Right side: Recent Sessions */}
            <div className="lg:col-span-3">
              <RecentSessions />
            </div>
          </div>
        </div>
      </SessionProvider>
    </DashboardLayout>
  );
};

export default Dashboard;
