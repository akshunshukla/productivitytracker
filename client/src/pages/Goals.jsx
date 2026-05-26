import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/api/axios";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoalCard from "@/components/GoalCard";
import CreateGoalDialog from "@/components/CreateGoalDialog";
import EditGoalDialog from "@/components/EditGoalDialog";

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/goal");
      setGoals(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch goals.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleGoalCreated = (newGoal) => {
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setIsEditDialogOpen(true);
  };

  const handleGoalUpdated = (updatedGoal) => {
    setGoals((prev) =>
      prev.map((g) => (g._id === updatedGoal._id ? updatedGoal : g))
    );
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await api.delete(`/goal/${goalId}`);
      setGoals((prev) => prev.filter((g) => g._id !== goalId));
      toast.success("Goal deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete goal.");
    }
  };


  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Goals</h1>
          <CreateGoalDialog onGoalCreated={handleGoalCreated}>
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" />
              New Goal
            </Button>
          </CreateGoalDialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 rounded-lg border-2 border-dashed border-border">
            <h2 className="text-lg font-semibold">No Goals Yet</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Create your first goal to start tracking your progress.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                  Active ({activeGoals.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeGoals.map((goal) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteGoal}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                  Completed ({completedGoals.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteGoal}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {editingGoal && (
          <EditGoalDialog
            goal={editingGoal}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onGoalUpdated={handleGoalUpdated}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default GoalsPage;
