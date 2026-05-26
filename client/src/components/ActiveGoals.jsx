import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Target, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatHoursMinutes, getDaysOverdue } from "@/utils/helpers";
import { useSession } from "@/context/SessionContext";

const ActiveGoals = () => {
  const { needsGoalRefresh, setNeedsGoalRefresh } = useSession();
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/goal");

      const active = (response.data.data || [])
        .filter((g) => g.status !== "completed")
        .slice(0, 4);
      setGoals(active);
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    if (needsGoalRefresh) {
      fetchGoals();
      setNeedsGoalRefresh(false);
    }
  }, [needsGoalRefresh, setNeedsGoalRefresh]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Target className="w-4 h-4 mr-2 text-chart-2" />
          Active Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active goals. Create one from the Goals page!
          </p>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progressPct =
                goal.targetDuration > 0
                  ? Math.min(
                      (goal.loggedDuration / goal.targetDuration) * 100,
                      100
                    )
                  : 0;
              const daysOverdue = getDaysOverdue(goal.deadline);

              return (
                <div key={goal._id} className="animate-slide-up">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {goal.title}
                      </span>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-chart-2/10 text-chart-2 border border-chart-2/20">
                        {goal.tag}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatHoursMinutes(goal.loggedDuration)} /{" "}
                      {formatHoursMinutes(goal.targetDuration)}
                    </span>
                  </div>
                  <Progress value={progressPct} className="h-1.5" />
                  {daysOverdue !== null && daysOverdue > 0 && (
                    <p className="text-[10px] text-destructive mt-1">
                      {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveGoals;
