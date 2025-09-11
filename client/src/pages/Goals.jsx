import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/api/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import GoalCard from "@/components/GoalCard";
import CreateGoalDialog from "@/components/CreateGoalDialog";
import EditGoalDialog from "@/components/EditGoalDialog";

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/goal");
        setGoals(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch goals.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleGoalCreated = (newGoal) => {
    setGoals((prevGoals) => [newGoal, ...prevGoals]);
  };

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setIsEditDialogOpen(true);
  };

  const handleGoalUpdated = (updatedGoal) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) =>
        goal._id === updatedGoal._id ? updatedGoal : goal
      )
    );
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await api.delete(`/goal/${goalId}`);
      setGoals((prevGoals) => prevGoals.filter((goal) => goal._id !== goalId));
      toast.success("Goal deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete goal.");
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Goals
        </h1>
        <CreateGoalDialog onGoalCreated={handleGoalCreated} />{" "}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      ) : goals.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No goals created yet. Click "New Goal" to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={handleEditClick}
              onDelete={handleDeleteGoal}
            />
          ))}
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
    </DashboardLayout>
  );
};

export default GoalsPage;
